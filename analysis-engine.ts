import type {
  AnalysisReport,
  IdentifiedRisk,
  MemberMetric,
  MetricStatus,
  RiskLevel,
  WorkspaceLogs,
} from "./src/types";

export interface LocalAnalysisInput extends WorkspaceLogs {
  members?: Array<{ name: string; role?: string }>;
}

interface Message {
  author: string;
  text: string;
  source: "Slack" | "KakaoTalk";
}

interface MemberStats {
  messages: number;
  words: number;
  tasks: number;
  contributions: number;
  positive: number;
  negative: number;
  silence: number;
  overload: number;
}

const STOPWORDS = new Set([
  "공지", "일시", "관리자", "작성자", "참석자", "담당자", "리뷰어", "개발자", "사용자", "알 수 없음",
  "notion", "github", "slack", "kakao", "kakaotalk", "reviewer", "developer", "author", "assignee",
  "high priority", "no commits found", "main", "master", "design", "developer", "frontend", "backend",
]);

const POSITIVE_TERMS = [
  "감사", "고마", "좋아요", "좋습니다", "잘했", "수고", "응원", "파이팅", "도움", "완료", "가능", "함께", "괜찮",
];
const NEGATIVE_TERMS = [
  "안 됩니다", "안돼", "문제", "늦", "지연", "불가", "어렵", "못", "없", "실패", "답장 없음", "무응답",
  "잠수", "미완료", "미확인", "급합니다", "답답", "짜증", "화", "최악", "개판", "사절", "엎고", "똑바로",
  "촌스럽", "베낀", "아무것도 모르", "너무합니다", "불평", "공격", "갈등", "병목", "막히",
];
const OVERLOAD_TERMS = ["밤샜", "밤을 새", "과부하", "독박", "너무 많", "과중", "빡빡", "번아웃", "대신 작성", "제가 다시"];
const SILENCE_TERMS = ["답장 없음", "응답 없음", "무응답", "읽씹", "안읽씹", "연락 두절", "확인 불가", "미응답"];
const TASK_TERMS = ["담당", "할당", "배분", "작성", "구축", "개발", "디자인", "조사", "검수", "완료", "미완료", "진행 중", "assigned to"];

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function countTerms(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  return terms.reduce((count, term) => count + (lower.includes(term.toLowerCase()) ? 1 : 0), 0);
}

function cleanName(raw: string): string {
  return raw
    .replace(/[\[\]*`@#]/g, "")
    .replace(/^(?:reviewer|developer|author|assignee)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidName(name: string): boolean {
  if (!name || STOPWORDS.has(name.toLowerCase())) return false;
  if (/^[가-힣]{2,6}$/.test(name)) return true;
  if (/^[A-Za-z][A-Za-z0-9._ -]{1,29}$/.test(name) && !/\b(?:commit|issue|pull|request|priority)\b/i.test(name)) return true;
  return false;
}

function parseMessages(text: string, source: Message["source"]): Message[] {
  const messages: Message[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const bracket = line.match(/^\[([^\]]+)]\s*(?:\([^)]*\))?\s*:\s*(.+)$/);
    const simple = line.match(/^([^:\n]{2,30})\s*:\s+(.+)$/);
    const kakao = line.match(/^(?:\d{4}[.\-/년]\s*\d{1,2}[.\-/월]\s*\d{1,2}[^,]*,\s*)?([^,:]{2,30})\s*:\s*(.+)$/);
    const silent = line.match(/^\[([^\]]+)]\s*\(([^)]*(?:답장 없음|응답 없음|무응답)[^)]*)\)$/);
    const match = bracket || (source === "KakaoTalk" ? kakao : simple) || silent;
    if (!match) continue;

    const author = cleanName(match[1]);
    if (isValidName(author)) messages.push({ author, text: match[2].trim(), source });
  }
  return messages;
}

function gini(values: number[]): number {
  if (values.length < 2) return 0;
  const sorted = [...values].map((v) => Math.max(0, v)).sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  if (total === 0) return 0;
  const weighted = sorted.reduce((sum, value, index) => sum + (index + 1) * value, 0);
  return (2 * weighted) / (sorted.length * total) - (sorted.length + 1) / sorted.length;
}

function riskLevel(score: number): RiskLevel {
  return score <= 40 ? "Low" : score <= 70 ? "Medium" : "High";
}

export function analyzeLocally(input: LocalAnalysisInput): AnalysisReport {
  const slackLogs = input.slackLogs?.trim() || "";
  const kakaoLogs = input.kakaoLogs?.trim() || "";
  const notionNotes = input.notionNotes?.trim() || "";
  const githubActivity = input.githubActivity?.trim() || "";
  const combined = [slackLogs, kakaoLogs, notionNotes, githubActivity].filter(Boolean).join("\n");

  if (!combined) throw new Error("분석할 데이터가 비어 있습니다.");

  const roles = new Map<string, string>();
  const members = new Set<string>();
  const addMember = (rawName: string, role?: string) => {
    const name = cleanName(rawName);
    if (!isValidName(name)) return;
    members.add(name);
    if (role?.trim()) roles.set(name, role.trim());
  };

  for (const member of input.members || []) addMember(member.name, member.role);

  const messages = [
    ...parseMessages(slackLogs, "Slack"),
    ...parseMessages(kakaoLogs, "KakaoTalk"),
  ];
  messages.forEach((message) => addMember(message.author));

  for (const match of notionNotes.matchAll(/\*\*\s*([가-힣A-Za-z][가-힣A-Za-z0-9._ -]{1,29}?)\s*(?:\(([^)]+)\))?\s*:\s*\*\*/g)) {
    addMember(match[1], match[2]);
  }
  for (const match of notionNotes.matchAll(/(?:관리자|작성자)\s*:\*?\*?\s*([가-힣A-Za-z][가-힣A-Za-z0-9._ -]{1,29})/g)) {
    addMember(match[1]);
  }
  for (const match of githubActivity.matchAll(/\[([^\]]+)]/g)) addMember(match[1]);
  for (const match of githubActivity.matchAll(/Assigned to\s+([가-힣A-Za-z][가-힣A-Za-z0-9._ -]{1,29})/gi)) addMember(match[1]);

  if (members.size === 0) members.add("참여자 미확인");
  const memberNames = [...members].slice(0, 20);
  const stats = new Map<string, MemberStats>(memberNames.map((name) => [name, {
    messages: 0, words: 0, tasks: 0, contributions: 0, positive: 0, negative: 0, silence: 0, overload: 0,
  }]));

  for (const message of messages) {
    const item = stats.get(message.author);
    if (!item) continue;
    item.messages += 1;
    item.words += message.text.replace(/\s+/g, "").length;
    item.positive += countTerms(message.text, POSITIVE_TERMS);
    item.negative += countTerms(message.text, NEGATIVE_TERMS);
    item.silence += countTerms(message.text, SILENCE_TERMS);
    item.overload += countTerms(message.text, OVERLOAD_TERMS);
  }

  const notionLines = notionNotes.split(/\r?\n/);
  const githubLines = githubActivity.split(/\r?\n/);
  for (const name of memberNames) {
    const item = stats.get(name)!;
    for (const line of notionLines) {
      if (line.includes(name) && countTerms(line, TASK_TERMS) > 0) item.tasks += 1;
    }
    for (const line of githubLines) {
      if (!line.includes(name)) continue;
      const commitCount = line.match(/(\d+)\s+commits?/i);
      if (commitCount) item.contributions += Number(commitCount[1]);
      else if (/\b(?:feat|fix|docs|refactor|chore|commit|pull request|PR\s*#)\b/i.test(line) && !/no commits/i.test(line)) item.contributions += 1;
      if (/assigned to/i.test(line)) item.tasks += 1;
    }
  }

  const messageValues = memberNames.map((name) => stats.get(name)!.messages);
  const taskValues = memberNames.map((name) => stats.get(name)!.tasks);
  const contributionValues = memberNames.map((name) => stats.get(name)!.contributions);
  const activityValues = memberNames.map((name) => {
    const item = stats.get(name)!;
    return item.messages + item.tasks * 2 + item.contributions * 0.5;
  });
  const totalMessages = messageValues.reduce((sum, value) => sum + value, 0);
  const totalTasks = taskValues.reduce((sum, value) => sum + value, 0);
  const totalContributions = contributionValues.reduce((sum, value) => sum + value, 0);
  const totalActivity = activityValues.reduce((sum, value) => sum + value, 0);
  const silenceSignals = countTerms(combined, SILENCE_TERMS);
  const overloadSignals = countTerms(combined, OVERLOAD_TERMS);
  const positiveSignals = countTerms(combined, POSITIVE_TERMS);
  const negativeSignals = countTerms(combined, NEGATIVE_TERMS);

  const participation = Math.round(clamp(100 - gini(messageValues) * 105 - silenceSignals * 4));
  const workloadInputs = memberNames.map((_, index) => taskValues[index] * 2 + contributionValues[index]);
  const imbalance = Math.round(clamp((totalTasks + totalContributions > 0 ? gini(workloadInputs) : gini(activityValues)) * 115 + overloadSignals * 3));
  const conflictDensity = totalMessages > 0 ? negativeSignals / totalMessages : negativeSignals / Math.max(1, combined.split(/\r?\n/).length);
  const conflictRisk = Math.round(clamp(8 + conflictDensity * 22 + silenceSignals * 6 + overloadSignals * 4));
  const toneSentiment = Math.round(clamp(68 + positiveSignals * 3 - negativeSignals * 4 - silenceSignals * 3));

  const maxMessages = Math.max(...messageValues, 1);
  const averageMessages = totalMessages / Math.max(1, memberNames.length);
  const averageActivity = totalActivity / Math.max(1, memberNames.length);
  const metricDrafts = memberNames.map((name, index) => {
    const item = stats.get(name)!;
    const ownText = messages.filter((message) => message.author === name).map((message) => message.text).join(" ");
    const activity = activityValues[index];
    const isSilent = item.silence > 0 || (totalMessages > 0 && item.messages <= Math.max(0, averageMessages * 0.35));
    const isOverburdened = item.overload > 0 || (averageActivity > 0 && activity >= averageActivity * 1.75 && activity === Math.max(...activityValues));
    const memberSentiment = Math.round(clamp(68 + item.positive * 7 - item.negative * 9 - item.silence * 8));
    let status: MetricStatus = "Active";
    if (isSilent) status = "Silent";
    else if (isOverburdened) status = "Overburdened";
    else if (memberSentiment < 50 || /두통|병원|퇴사|사절|방어적/.test(ownText)) status = "Unstable";

    const participationScore = totalMessages > 0
      ? Math.round(clamp((item.messages / maxMessages) * 100))
      : Math.round(clamp((activity / Math.max(...activityValues, 1)) * 100));
    return {
      name,
      role: roles.get(name) || "역할 미확인",
      participationScore,
      taskCount: item.tasks,
      sentimentScore: memberSentiment,
      contributionsCount: item.contributions,
      status,
      activity,
    };
  });

  const busiest = [...metricDrafts].sort((a, b) => b.activity - a.activity)[0];
  const quietest = [...metricDrafts].sort((a, b) => a.participationScore - b.participationScore)[0];
  const mostStrained = [...metricDrafts].sort((a, b) => a.sentimentScore - b.sentimentScore)[0];
  const memberMetrics: MemberMetric[] = metricDrafts.map(({ activity: _activity, ...metric }) => metric);

  const identifiedRisks: IdentifiedRisk[] = [];
  if (participation < 70 || silenceSignals > 0) {
    identifiedRisks.push({
      title: "소통 참여 격차",
      category: kakaoLogs && !slackLogs ? "KakaoTalk" : "Slack",
      severity: participation < 45 ? "High" : "Medium",
      description: `${quietest.name}님의 기록상 참여도가 상대적으로 낮습니다. 전체 ${totalMessages}개 메시지와 무응답 신호 ${silenceSignals}건을 기준으로 확인이 필요합니다.`,
      affectedMembers: [quietest.name],
    });
  }
  if (imbalance >= 40) {
    identifiedRisks.push({
      title: "업무 및 기여 편중",
      category: totalContributions > totalTasks ? "GitHub" : "Notion",
      severity: imbalance > 70 ? "High" : "Medium",
      description: `${busiest.name}님에게 기록된 활동이 가장 많이 집중되어 있습니다. 태스크 ${totalTasks}건과 코드 기여 ${totalContributions}건의 분포를 재확인해 주세요.`,
      affectedMembers: [busiest.name],
    });
  }
  if (conflictRisk >= 45) {
    identifiedRisks.push({
      title: "마찰성 표현 증가",
      category: "General",
      severity: conflictRisk > 70 ? "High" : "Medium",
      description: `부정·마찰 표현 ${negativeSignals}건과 과부하 신호 ${overloadSignals}건이 감지되었습니다. 문맥을 함께 확인한 뒤 피드백 방식을 조정할 필요가 있습니다.`,
      affectedMembers: [mostStrained.name, busiest.name].filter((name, index, all) => all.indexOf(name) === index),
    });
  }
  if (identifiedRisks.length === 0) {
    identifiedRisks.push({
      title: "뚜렷한 고위험 신호 없음",
      category: "General",
      severity: "Low",
      description: "현재 입력에서 큰 참여 편중이나 반복적인 마찰 표현은 확인되지 않았습니다. 정기 점검을 유지하세요.",
      affectedMembers: [],
    });
  }

  const weightedRisk = conflictRisk * 0.35 + imbalance * 0.3 + (100 - participation) * 0.2 + (100 - toneSentiment) * 0.15;
  const overallRiskScore = Math.round(clamp(Math.max(
    weightedRisk,
    conflictRisk * 0.9,
    (100 - toneSentiment) * 0.6,
  )));
  const level = riskLevel(overallRiskScore);
  const summary = `규칙 기반 로컬 분석 결과, 협업 위험은 ${level}(${overallRiskScore}점)입니다. ` +
    `${totalMessages}개 메시지, ${totalTasks}개 업무 항목, ${totalContributions}개 코드 기여 기록을 집계했습니다. ` +
    `${busiest.name}님의 활동 비중이 가장 높고 ${quietest.name}님의 대화 참여도가 가장 낮게 나타났습니다. ` +
    `이 결과는 키워드와 활동량에 기반한 참고 지표이므로 원문 맥락과 함께 검토하세요.`;

  return {
    overallRiskScore,
    riskLevel: level,
    summary,
    dimensions: {
      participation,
      participationDetails: `구성원별 메시지 수의 분포를 비교했습니다. 총 ${totalMessages}개 메시지 중 참여가 가장 낮은 구성원은 ${quietest.name}님입니다.`,
      imbalance,
      imbalanceDetails: `노션 업무 항목 ${totalTasks}건과 GitHub 기여 ${totalContributions}건의 구성원별 분포를 지니계수 방식으로 산정했습니다.`,
      conflictRisk,
      conflictRiskDetails: `부정·마찰 표현 ${negativeSignals}건, 무응답 표현 ${silenceSignals}건, 과부하 표현 ${overloadSignals}건을 규칙으로 집계했습니다.`,
      toneSentiment,
      toneSentimentDetails: `긍정 표현 ${positiveSignals}건과 부정 표현 ${negativeSignals}건의 비율을 바탕으로 소통 온도를 계산했습니다.`,
    },
    identifiedRisks,
    memberMetrics,
    playbook: {
      meetingGuideline: `1단계: 원문 기록을 함께 보며 지표의 오탐 여부를 확인합니다.\n2단계: ${quietest.name}님부터 방해 없이 현재 상황과 필요한 지원을 듣습니다.\n3단계: ${busiest.name}님의 진행 업무를 목록화하고, 완료 기준과 담당자를 다시 합의합니다.\n4단계: 다음 점검 일시와 응답 규칙을 정해 회의록에 남깁니다.`,
      roleRealignment: `${busiest.name}님에게 집중된 활동 중 독립적으로 넘길 수 있는 업무를 분리하고, ${quietest.name}님에게는 범위·기한·완료 기준이 명확한 항목을 합의 후 배정하세요. 단, 단순 활동량만으로 역량이나 태도를 판단하지 마세요.`,
      feedbackScripts: [
        {
          scenario: "참여 상황과 지원 필요 확인",
          sender: busiest.name,
          recipient: quietest.name,
          scriptText: `${quietest.name}님, 최근 기록에서 참여가 줄어든 것으로 보여 현재 상황을 먼저 확인하고 싶어요. 진행을 막는 요인이나 필요한 지원이 있다면 알려주세요. 담당 범위와 일정을 함께 현실적으로 조정하겠습니다.`,
        },
        {
          scenario: "업무 편중 완화를 위한 재분배 제안",
          sender: quietest.name,
          recipient: busiest.name,
          scriptText: `${busiest.name}님에게 업무가 많이 모여 있는 것으로 보여요. 현재 맡은 항목을 같이 펼쳐 보고 제가 인수할 수 있는 일을 완료 기준과 함께 정하면 어떨까요?`,
        },
      ],
    },
    analyzedAt: new Date().toISOString(),
  };
}
