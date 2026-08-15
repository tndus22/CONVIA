import React, { useState, useEffect, useRef } from 'react';
import {
  Slack,
  FileText,
  Github,
  AlertCircle,
  HelpCircle,
  Loader2,
  Link2,
  Check,
  Upload,
  Database,
  RefreshCw,
  Cpu,
  CheckCircle,
  Key,
  Code,
  MessageCircle
} from 'lucide-react';
import { WorkspaceLogs } from '../types';

interface IntegrationConfigProps {
  onAnalyze: (logs: WorkspaceLogs) => void;
  isLoading: boolean;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export default function IntegrationConfig({ onAnalyze, isLoading }: IntegrationConfigProps) {
  const [activeTab, setActiveTab] = useState<'slack' | 'kakao' | 'notion' | 'github'>('slack');
  const [slackInput, setSlackInput] = useState('');
  const [kakaoInput, setKakaoInput] = useState('');
  const [notionInput, setNotionInput] = useState('');
  const [githubInput, setGithubInput] = useState('');

  // Live status configurations
  const [slackConn, setSlackConn] = useState<ConnectionState>('disconnected');
  const [notionConn, setNotionConn] = useState<ConnectionState>('disconnected');
  const [githubConn, setGithubConn] = useState<ConnectionState>('disconnected');

  const [slackToken, setSlackToken] = useState('');
  const [slackChannel, setSlackChannel] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDbId, setNotionDbId] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [slackFetchError, setSlackFetchError] = useState('');

  const [githubFetching, setGithubFetching] = useState(false);
  const [githubFetchError, setGithubFetchError] = useState('');
  const [githubFetchSuccess, setGithubFetchSuccess] = useState(false);

  // File Upload refs & states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadToastMessage, setUploadToastMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const [slackAutoSync, setSlackAutoSync] = useState(false);
const slackPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

const handleFetchSlack = async (silent = false) => {
  if (!slackToken || !slackChannel) {
    alert('Slack Bot Token과 채널 이름(또는 채널 ID)을 모두 입력해 주세요.');
    return;
  }
  setSlackFetchError('');
  try {
    const resp = await fetch('/api/slack/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: slackToken.trim(), channel: slackChannel.trim() }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Slack 연동에 실패했습니다.');
    if (!data.formatted) throw new Error(data.warning || '가져올 메시지가 없습니다.');

    setSlackInput(prev => {
      // 내용이 바뀌었을 때만 상태 갱신 (불필요한 리렌더/재분석 방지)
      if (prev === data.formatted) return prev;
      return data.formatted;
    });
    setSlackAutoSync(true);
    setSlackConn('connected');
  } catch (err: any) {
    setSlackConn('disconnected');
    setSlackFetchError(err.message || 'Slack 데이터를 가져오는 중 오류가 발생했습니다.');
  }
};

useEffect(() => {
  if (slackAutoSync && slackConn === 'connected') {
    slackPollRef.current = setInterval(() => {
      handleFetchSlack(true); // silent 갱신
    }, 5000); // 5초마다. Slack rate limit(분당 ~50회) 고려해 너무 짧게 두지 마세요
  }
  return () => {
    if (slackPollRef.current) {
      clearInterval(slackPollRef.current);
      slackPollRef.current = null;
    }
  };
}, [slackAutoSync, slackConn, slackToken, slackChannel]);

  // Handle live mock API handshake for visual/interactive completeness
  const handleTestHandshake = (platform: 'slack' | 'notion' | 'github') => {
    if (platform === 'slack') {
      if (!slackToken || !slackChannel) {
        alert('Slack Bot Token과 채널 이름을 모두 입력해 주세요.');
        return;
      }
      setSlackConn('connecting');
      setTimeout(() => {
        setSlackConn('connected');
        setSlackInput(
          `[정승호] (오전 10:11): 이번주에 배포 가능할까요?\n` +
          `[김소진] (오전 10:14): 아.. 백엔드 API 완성이 늦어져서 디자인 피드백 수용이 아직 안 됐어요.\n` +
          `[이민기] (읽음 2명, 답장 없음)\n` +
          `[정승호] (오후 1:00): 민기님, DB 마이그레이션 끝났나요? 대답이 없으셔서 일정 지연 우려됩니다.\n` +
          `[이민기] (오후 5:30): 네, 대충 다 끝났어요.`
        );
      }, 1500);
    } else if (platform === 'notion') {
      if (!notionToken || !notionDbId) {
        alert('Notion API 토큰과 데이터베이스 ID를 입력해 주세요.');
        return;
      }
      setNotionConn('connecting');
      setTimeout(() => {
        setNotionConn('connected');
        setNotionInput(
          `### 📝 Notion Workspace 실시간 동기화 데이터\n` +
          `**가져온 시간:** ${new Date().toLocaleString()}\n` +
          `**활성 업무 카드:** 12개\n\n` +
          `#### 완료 상태 점검\n` +
          `- [x] 서비스 전체 기획서 초안 (정승호)\n` +
          `- [ ] 프론트엔드 모바일 상세화면 12종 (김소진) -> UI 리소스 전달 지연\n` +
          `- [ ] 클라우드 DB 연동 및 Swagger 작성 (이민기) -> 3주 전 커밋 이후 소통 지연`
        );
      }, 1500);
    } else if (platform === 'github') {
      if (!githubPat || !githubRepoUrl) {
        alert('GitHub PAT(Personal Access Token)와 레포지토리 URL을 입력해 주세요.');
        return;
      }
      setGithubConn('connecting');
      setTimeout(() => {
        setGithubConn('connected');
        handleFetchGithub(true);
      }, 1500);
    }
  };

  const handleDisconnect = (platform: 'slack' | 'notion' | 'github') => {
    if (platform === 'slack') {
      setSlackConn('disconnected');
      setSlackInput('');
    } else if (platform === 'notion') {
      setNotionConn('disconnected');
      setNotionInput('');
    } else if (platform === 'github') {
      setGithubConn('disconnected');
      setGithubInput('');
      setGithubFetchSuccess(false);
    }
  };

  // Parse public GitHub repo to pull real commits
  const handleFetchGithub = async (isSilencedAlert = false) => {
    const targetUrl = githubRepoUrl || 'https://github.com/facebook/react';
    
    setGithubFetching(true);
    setGithubFetchError('');
    setGithubFetchSuccess(false);

    try {
      const cleanUrl = targetUrl.replace('https://github.com/', '').replace('.git', '');
      const parts = cleanUrl.split('/');
      if (parts.length < 2) {
        throw new Error('올바른 GitHub 저장소 URL 형식이 아닙니다. (예: https://github.com/facebook/react)');
      }
      const owner = parts[0];
      const repo = parts[1];

      const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`);
      if (!commitsResponse.ok) {
        throw new Error(`저장소를 찾을 수 없거나 API 제한이 초과되었습니다. (${commitsResponse.status})`);
      }
      const commitsData = await commitsResponse.json();

      let formattedActivity = `### Real-time GitHub Activity for ${owner}/${repo}\n`;
      formattedActivity += `Fetched latest 10 commits dynamically on ${new Date().toLocaleDateString()}\n\n`;
      formattedActivity += `#### Commits:\n`;
      
      commitsData.forEach((item: any) => {
        const author = item.commit.author.name;
        const message = item.commit.message.split('\n')[0];
        const date = new Date(item.commit.author.date).toLocaleDateString();
        formattedActivity += `- [${author}] ${message} (${date})\n`;
      });

      setGithubInput(formattedActivity);
      setGithubFetchSuccess(true);
      if (githubPat) {
        setGithubConn('connected');
      }
    } catch (err: any) {
      if (!isSilencedAlert) {
        setGithubFetchError(err.message || 'GitHub 데이터를 가져오는 도중 오류가 발생했습니다.');
      }
    } finally {
      setGithubFetching(false);
    }
  };

  const processFileContent = (fileName: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      const errMsg = `Convia 오류: [${fileName}] 파일이 비어 있습니다.`;
      setUploadToastMessage(errMsg);
      setTimeout(() => {
        setUploadToastMessage('');
      }, 4000);
      return;
    }

    // Auto-detect tab based on content patterns
    let detectedTab: 'slack' | 'kakao' | 'notion' | 'github' = activeTab;
    
    // KakaoTalk indicators: calendar bar (e.g., "요일") or typical user timestamp [이름] [오전/오후
    const isKakaoPattern = /\[[^\]\n]{1,15}\]\s*\[(?:오전|오후|AM|PM)/i.test(trimmed) || 
                           /--------------- \d{4}년/i.test(trimmed) ||
                           (/\d{4}[.-]\s*\d{1,2}[.-]\s*\d{1,2}/.test(trimmed) && /:\s*/.test(trimmed)) ||
                           (/(오전|오후)/.test(trimmed) && /:\s*/.test(trimmed));
                           
    const isGithubPattern = /commit\s+[a-f0-9]{40}/i.test(trimmed) || 
                            /### GitHub/i.test(trimmed) || 
                            /PR #\d+/i.test(trimmed) || 
                            /No commits found/i.test(trimmed);
                            
    const isNotionPattern = /###\s+.*회의/i.test(trimmed) || 
                            /-\s+\[[ x]\]/i.test(trimmed);

    if (isKakaoPattern) {
      detectedTab = 'kakao';
    } else if (isGithubPattern) {
      detectedTab = 'github';
    } else if (isNotionPattern) {
      detectedTab = 'notion';
    }

    setActiveTab(detectedTab);
    setUploadedFileName(fileName);

    // Update the corresponding states
    if (detectedTab === 'slack') {
      setSlackInput(trimmed);
    } else if (detectedTab === 'kakao') {
      setKakaoInput(trimmed);
    } else if (detectedTab === 'notion') {
      setNotionInput(trimmed);
    } else if (detectedTab === 'github') {
      setGithubInput(trimmed);
    }

    // Build immediate payload for analysis with the new content
    const payload = {
      slackLogs: detectedTab === 'slack' ? trimmed : (slackInput.trim() || undefined),
      kakaoLogs: detectedTab === 'kakao' ? trimmed : (kakaoInput.trim() || undefined),
      notionNotes: detectedTab === 'notion' ? trimmed : (notionInput.trim() || undefined),
      githubActivity: detectedTab === 'github' ? trimmed : (githubInput.trim() || undefined),
    };

    // Trigger automatic success notification and start analysis!
    const successMsg = `Convia 알림: 파일 [${fileName}] 업로드가 완료되어 자동으로 로컬 규칙 분석을 시작합니다!`;
    setUploadToastMessage(successMsg);
    
    setTimeout(() => {
      setUploadToastMessage('');
    }, 4000);

    onAnalyze(payload);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processFileContent(file.name, content);
    };
    reader.readAsText(file);
  };

  // Read Local Files directly & Parse them
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processFileContent(file.name, content);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input so same file can be uploaded again
      }
    };
    reader.readAsText(file);
  };

  const handleStartAnalysis = () => {
    onAnalyze({
      slackLogs: slackInput.trim() || undefined,
      kakaoLogs: kakaoInput.trim() || undefined,
      notionNotes: notionInput.trim() || undefined,
      githubActivity: githubInput.trim() || undefined,
    });
  };

  const handleLoadSampleFormat = (type: 'slack' | 'kakao' | 'notion' | 'github') => {
    if (type === 'slack') {
      setSlackInput(
        `[민우] (오후 2:15): 민서님, 마케팅 시안 이번 주까지 마무리 가능하신가요?\n` +
        `[민서] (오후 5:40): 아.. 네 노력해볼게요. 근데 자료 리서치 파트가 안 넘어와서 시작을 못하고 있었어요.\n` +
        `[정호] (읽음 2명, 답장 없음)\n` +
        `[민우] (오후 5:42): 정호님 시장조사 자료 정리해서 민서님께 공유해 주기로 하셨던 것 같은데 전달해 주셨나요?\n` +
        `[정호] (다음날 오전 11:00): 앗 깜빡했네요 지금 드립니다 (파일 첨부)`
      );
    } else if (type === 'kakao') {
      setKakaoInput(
        `--------------- 2026년 7월 2일 목요일 ---------------\n` +
        `[서영] [오전 9:15] 다들 공모전 발표자료 마감 이틀 남았는데 피그마 진척이 어떻게 되나요?\n` +
        `[지훈] [오전 11:30] 아 죄송해요ㅠㅠ 저 오늘 전공 과제가 너무 밀려서 오늘밤 늦게나 가능할 것 같습니다..\n` +
        `[태희] [오후 1:00] (읽고 답장 없음 - 1 사라진 상태)\n` +
        `[서영] [오후 5:40] 태희님, 마케팅 전략 파트 내용 써주셔야 발표자료 제작 가능합니다. 공유 부탁드려요!\n` +
        `[태희] [오후 9:15] 아 넵.. 피그마에 내일 아침까지 해둘게요\n` +
        `[서영] [오후 9:20] 내일 아침이면 발표 전날인데 피드백할 시간이 너무 부족해요. 미리 말씀해주시지 그랬어요..\n` +
        `[태희] [오후 9:25] 저도 시험이 있어서 바빴어요. 내일 아침까지 해드린댔잖아요;`
      );
    } else if (type === 'notion') {
      setNotionInput(
        `### 🗓️ 프로젝트 진행 회의\n` +
        `**참석자:** 민우, 민서, 정호\n\n` +
        `#### 업무 목록\n` +
        `- [x] 서비스 코어 개발 (민우)\n` +
        `- [ ] 랜딩 페이지 일러스트 디자인 (민서) -> 진행 지연 (기초 기획 미달)\n` +
        `- [ ] 경쟁사 벤치마킹 설문조사 (정호) -> 미시작`
      );
    } else if (type === 'github') {
      setGithubInput(
        `### GitHub Commits (최근 7일)\n` +
        `- [민우] feat: setup Node.js server and routes (18 commits)\n` +
        `- [민우] refactor: integrate database connectors (5 commits)\n` +
        `- [민서] (No commits found)\n` +
        `- [정호] (No commits found)\n\n` +
        `### Code Review Comments (PR #3)\n` +
        `- **Reviewer [민우]**: "전체적으로 로직은 괜찮은데, 마케팅 전략 파일 경로가 꼬여있네요. 정호님 이부분 수정 필요해요."\n` +
        `- **Developer [정호]**: "그냥 로컬에서 올리다보니 누락됐나보네요. 나중에 수정하죠 뭐."`
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden" id="integration-config-panel">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database size={18} className="text-slate-600 animate-pulse" />
            Convia 다채널 소통 분석 동기화 (Integration Hub)
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
            <b>카카오톡 대화방 내보내기 파일(.txt)</b> 및 실시간 슬랙, 노션 회의록, 깃허브 원본 커밋 내역을 연동하여 멤버들의 소통 참여도와 협업 충돌 여부를 정밀 감지합니다.
          </p>
        </div>
      </div>

      {uploadToastMessage && (
        <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-100/80 rounded-xl text-emerald-800 flex items-center gap-2.5 text-xs font-bold animate-fade-in shadow-xs" id="file-upload-toast">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <span>{uploadToastMessage}</span>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex flex-wrap border-b border-slate-100 bg-white">
        <button
          onClick={() => setActiveTab('slack')}
          className={`flex-1 py-3.5 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'slack'
              ? 'border-slate-900 text-slate-900 bg-slate-50/40 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/20'
          }`}
          id="tab-slack"
        >
          <Slack size={15} className={activeTab === 'slack' ? 'text-rose-500' : ''} />
          Slack API {slackConn === 'connected' && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />}
        </button>
        <button
          onClick={() => setActiveTab('kakao')}
          className={`flex-1 py-3.5 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'kakao'
              ? 'border-yellow-500 text-yellow-600 bg-yellow-50/10 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/20'
          }`}
          id="tab-kakao"
        >
          <MessageCircle size={15} className={activeTab === 'kakao' ? 'text-yellow-500 fill-yellow-400' : ''} />
          카카오톡 (KakaoTalk)
        </button>
        <button
          onClick={() => setActiveTab('notion')}
          className={`flex-1 py-3.5 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'notion'
              ? 'border-slate-900 text-slate-900 bg-slate-50/40 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/20'
          }`}
          id="tab-notion"
        >
          <FileText size={15} className={activeTab === 'notion' ? 'text-amber-500' : ''} />
          Notion API {notionConn === 'connected' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />}
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`flex-1 py-3.5 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'github'
              ? 'border-slate-900 text-slate-900 bg-slate-50/40 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/20'
          }`}
          id="tab-github"
        >
          <Github size={16} className={activeTab === 'github' ? 'text-indigo-500' : ''} />
          GitHub API {githubConn === 'connected' && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Connection Setup Card based on active tab */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Interactive API Handshake / Instructions */}
          <div className="lg:col-span-2 border border-neutral-200 rounded-xl p-5 bg-neutral-50/20 space-y-4">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              {activeTab === 'slack' && <><Key size={15} className="text-neutral-500" /> 방법 1: Slack Webhook 및 API 토큰 실시간 핸드셰이크</>}
              {activeTab === 'kakao' && <><MessageCircle size={15} className="text-yellow-600" /> 방법 1: 카카오톡 대화 내용 연동 가이드</>}
              {activeTab === 'notion' && <><Key size={15} className="text-neutral-500" /> 방법 1: Notion 프라이빗 워크스페이스 실시간 동기화</>}
              {activeTab === 'github' && <><Key size={15} className="text-neutral-500" /> 방법 1: GitHub 레포지토리 및 PAT 실시간 동기화</>}
            </h4>

            {activeTab === 'slack' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-500">Slack Bot User OAuth Token</label>
                  <input
                    type="password"
                    className="w-full p-2.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    placeholder="xoxb-xxxxxxxxxxxxx-xxxxxxxxxxxx"
                    value={slackToken}
                    onChange={(e) => setSlackToken(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-500">대상 채널 이름 (Target Channel ID)</label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    placeholder="예: #general-project"
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'kakao' && (
              <div className="bg-white border border-yellow-100 rounded-lg p-4 text-xs space-y-2.5 text-neutral-600 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-yellow-700">
                  <span className="bg-yellow-100 text-yellow-800 rounded px-1.5 py-0.5">내보내기 방법</span>
                  모바일 및 PC 카카오톡 대화 이력 가져오기
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-neutral-500 font-medium">
                  <li>
                    <b className="text-neutral-700">스마트폰 카톡:</b> 대화방 우측 상단 삼선 ➔ 우측 하단 톱니바퀴(설정) ➔ <span className="text-yellow-600 font-semibold">"대화 내용 내보내기"</span> ➔ <span className="text-yellow-600 font-semibold">"텍스트만 보내기"</span> 선택 후 파일을 저장 혹은 나에게 전송합니다.
                  </li>
                  <li>
                    <b className="text-neutral-700">PC 카톡:</b> 대화방 우측 상단 삼선 메뉴 ➔ <span className="text-yellow-600 font-semibold">"대화 내용"</span> ➔ <span className="text-yellow-600 font-semibold">"저장하기"</span> 클릭하여 텍스트 파일(.txt)로 저장합니다.
                  </li>
                  <li>
                    <b className="text-neutral-700">분석 적용:</b> 우측의 <span className="font-semibold text-neutral-800">"로그 파일 업로더"</span>를 눌러 내보낸 <code>.txt</code> 파일을 업로드하거나, 복사한 내용을 아래 입력창에 바로 붙여넣어 주세요!
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'notion' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-500">Notion Integration Token</label>
                  <input
                    type="password"
                    className="w-full p-2.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={notionToken}
                    onChange={(e) => setNotionToken(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-500">Notion Database / Page ID</label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    placeholder="84b6f12a20xxxxxxxxxxxxxxxxxxxx"
                    value={notionDbId}
                    onChange={(e) => setNotionDbId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-500">GitHub Personal Access Token (PAT) - 선택사항</label>
                  <input
                    type="password"
                    className="w-full p-2.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={githubPat}
                    onChange={(e) => setGithubPat(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-500">GitHub 저장소 주소 (URL)</label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    placeholder="https://github.com/facebook/react"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Verification Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs">
                {activeTab === 'slack' && (
                  slackConn === 'connected' ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle size={14} /> Slack API 연결 활성화됨! 대화 기록을 동기화했습니다.
                    </span>
                  ) : slackConn === 'connecting' ? (
                    <span className="text-neutral-500 font-medium flex items-center gap-1">
                      <Loader2 size={13} className="animate-spin" /> API 핸드셰이크 검증 중...
                    </span>
                  ) : (
                    <span className="text-neutral-400">봇 연동 후 실시간으로 대화를 불러올 수 있습니다.</span>
                  )
                )}

                {activeTab === 'kakao' && (
                  <span className="text-yellow-700 font-semibold bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                    💡 카카오톡은 개인정보 보호법상 파일 업로드 및 수동 붙여넣기 방식이 가장 안전하고 확실합니다.
                  </span>
                )}

                {activeTab === 'notion' && (
                  notionConn === 'connected' ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle size={14} /> Notion 데이터베이스에 접근하여 칸반 카드를 갱신했습니다!
                    </span>
                  ) : notionConn === 'connecting' ? (
                    <span className="text-neutral-500 font-medium flex items-center gap-1">
                      <Loader2 size={13} className="animate-spin" /> 노션 워크스페이스 권한 확인 중...
                    </span>
                  ) : (
                    <span className="text-neutral-400">데이터베이스 권한을 승인하고 완료 현황을 동기화합니다.</span>
                  )
                )}

                {activeTab === 'github' && (
                  githubConn === 'connected' ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle size={14} /> GitHub 저장소와 연결되어 기여 내역을 실시간으로 반영합니다!
                    </span>
                  ) : githubConn === 'connecting' ? (
                    <span className="text-neutral-500 font-medium flex items-center gap-1">
                      <Loader2 size={13} className="animate-spin" /> 저장소 메타데이터 확인 중...
                    </span>
                  ) : (
                    <span className="text-neutral-400">공개 저장소는 토큰 없이 바로 '불러오기'가 가능합니다.</span>
                  )
                )}
              </div>

              {activeTab !== 'kakao' && (
                <div className="flex gap-2">
                  {((activeTab === 'slack' && slackConn === 'connected') ||
                    (activeTab === 'notion' && notionConn === 'connected') ||
                    (activeTab === 'github' && githubConn === 'connected')) && (
                    <button
                      onClick={() => handleDisconnect(activeTab)}
                      className="text-xs bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold px-3.5 py-2 rounded-lg transition-colors"
                    >
                      연결 해제
                    </button>
                  )}
                  <button
                   
                    onClick={() => {
  if (activeTab === 'github' && !githubPat) {
    handleFetchGithub();
  } else if (activeTab === 'slack') {
    handleFetchSlack();
  } else {
    handleTestHandshake(activeTab);
  }
}}
                    disabled={
                      (activeTab === 'slack' && (slackConn === 'connecting' || !slackToken)) ||
                      (activeTab === 'notion' && (notionConn === 'connecting' || !notionToken)) ||
                      (activeTab === 'github' && githubFetching)
                    }
                    className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    {(activeTab === 'slack' && slackConn === 'connecting') ||
                    (activeTab === 'notion' && notionConn === 'connecting') ||
                    (activeTab === 'github' && githubFetching) ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        연동 테스트 중...
                      </>
                    ) : (
                      '실시간 API 연동 테스트'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Dedicated Log File Uploader */}
          <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50/20 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Upload size={15} className="text-neutral-500" />
                방법 2: 전용 로그 파일 업로더
              </h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                카카오톡 <code>.txt</code> 대화 내보내기 파일, Slack에서 백업한 대화, 노션 마크다운, 혹은 깃허브 보고서를 직접 업로드하세요.
              </p>
            </div>

            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.json,.md,.csv"
                className="hidden"
                id="file-log-uploader-element"
              />
              <button
                onClick={() => {
                  if (!isLoading) {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isLoading}
                className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center justify-center gap-2 transition-all ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700 scale-[1.02]' 
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer animate-pulse'}`}
              >
                <div className={`p-2 rounded-full transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-neutral-50 text-neutral-500'}`}>
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold block">
                    {isLoading ? '분석 중에는 파일 업로드가 불가능합니다' : isDragging ? '여기에 드롭하여 파일 분석하기' : '내보낸 .txt 파일 불러오기'}
                  </span>
                  <span className={`text-[10px] mt-0.5 block ${isDragging ? 'text-indigo-500' : 'text-neutral-400'}`}>
                    {isLoading ? '잠시만 기다려 주세요...' : isDragging ? '마우스 버튼을 놓으세요' : '카톡 대화방 백업파일 지원 (드래그 가능)'}
                  </span>
                </div>
              </button>
              {uploadedFileName && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-2.5 text-center flex items-center justify-center gap-1">
                  <Check size={12} /> {uploadedFileName} 파싱 성공!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Input/Paste Textarea Panel */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Code size={15} className="text-neutral-500" />
              동기화된 원본 로 데이터 확인 & 수동 편집
            </h4>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLoadSampleFormat(activeTab)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'kakao'
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-800 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {activeTab === 'kakao' ? '카톡 전용 샘플 데이터 자동 로드' : '텍스트 자동 채우기 (Sample)'}
            </button>
          </div>

          <textarea
            className="w-full h-44 p-4 bg-neutral-50/50 border border-neutral-200 rounded-lg text-xs font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white leading-relaxed disabled:opacity-75 disabled:bg-neutral-100/80"
            disabled={isLoading}
            placeholder={
              activeTab === 'slack'
                ? "[이름] (시간): 대화 내용... 의 양식으로 붙여넣거나 위의 API 연동 또는 파일 업로드를 클릭해 대화를 동기화하세요."
                : activeTab === 'kakao'
                ? "카카오톡 대화방에서 내보낸 텍스트 파일(.txt) 내용을 그대로 복사해서 붙여넣거나 파일을 업로드해 주세요.\n(예:\n--------------- 2026년 7월 2일 목요일 ---------------\n[서영] [오전 9:15] 대화 내용...)"
                : activeTab === 'notion'
                ? "노션 회의록, 태스크 분배 현황, 마크다운 체크리스트를 붙여넣거나 동기화하세요."
                : "깃허브 커밋 로그, PR 코드리뷰 내역을 붙여넣거나 동기화하세요."
            }
            value={
              activeTab === 'slack'
                ? slackInput
                : activeTab === 'kakao'
                ? kakaoInput
                : activeTab === 'notion'
                ? notionInput
                : githubInput
            }
            onChange={(e) => {
              if (activeTab === 'slack') setSlackInput(e.target.value);
              else if (activeTab === 'kakao') setKakaoInput(e.target.value);
              else if (activeTab === 'notion') setNotionInput(e.target.value);
              else if (activeTab === 'github') setGithubInput(e.target.value);
            }}
            id="logs-textarea-dynamic"
          />
        </div>

        {/* Diagnostic Guide Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 flex gap-3">
            <Slack size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-rose-900">Slack 감정 분석</h5>
              <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                대화 빈도, 응답 속도, 단답형 비율 및 텍스트의 공격성/냉담도를 측정하여 passive-aggressive 양상을 포착합니다.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50/30 border border-yellow-200 rounded-xl p-4 flex gap-3">
            <MessageCircle size={18} className="text-yellow-600 shrink-0 mt-0.5 fill-yellow-100" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-yellow-950">KakaoTalk 대화 분석</h5>
              <p className="text-[11px] text-yellow-800 font-medium leading-relaxed">
                내보낸 카톡 텍스트의 "읽씹(수신 후 무응답)", "안읽씹(장기 소통 이탈)", 심야 시간 응답률 및 특정인 배제 흐름을 정확히 마이닝합니다.
              </p>
            </div>
          </div>

          <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-4 flex gap-3">
            <FileText size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-amber-900">Notion 업무 완료 분석</h5>
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                계획된 체크리스트의 소유주와 마감 기한 경과 데이터를 분석하여, 특정 멤버에게 과중하게 집중된 독박 업무를 판단합니다.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-4 flex gap-3">
            <Github size={18} className="text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-indigo-900">GitHub 기여도 정밀 매핑</h5>
              <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                실제 커밋 건수, 코드 수정 빈도, PR 리뷰 코멘트 내에서의 피드백 수용도를 긁어와 소통 온도와 기여 실태를 교차 검증합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <HelpCircle size={14} />
            원하는 방법으로 데이터를 동기화한 후 로컬 정밀 진단을 누르세요.
          </div>
          <button
            onClick={handleStartAnalysis}
            disabled={isLoading || (!slackInput && !kakaoInput && !notionInput && !githubInput)}
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm px-7 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
            id="btn-trigger-local-analysis"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                로컬 규칙 기반 협업 건강도 분석 중...
              </>
            ) : (
              '동기화된 데이터로 로컬 정밀 진단 시작하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
