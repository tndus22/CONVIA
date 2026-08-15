import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Slack,
  MessageCircle,
  FileText,
  Github,
  TrendingUp,
  ShieldCheck,
  HeartHandshake,
  Users,
  CheckCircle2,
  Cpu,
  Lock,
  MessageSquareQuote,
  Terminal,
  Play,
  Scale,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { TEAM_SCENARIOS } from '../data';

interface LandingPageProps {
  onStartDiagnostic: () => void;
  onSelectScenario: (scenario: any) => void;
  selectedScenarioId: string;
}

export default function LandingPage({ onStartDiagnostic, onSelectScenario, selectedScenarioId }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'slack' | 'kakao' | 'notion' | 'github'>('slack');
  const sandboxRef = useRef<HTMLDivElement>(null);

  // 1. Slack State
  const [slackInput, setSlackInput] = useState('어련히 잘 하시겠어요 ^^ 주말까지는 끝낼 수 있으시죠?');
  const [slackResult, setSlackResult] = useState<{ score: number; sentiment: string; risk: string; parsedTip: string } | null>({
    score: 78,
    sentiment: '수동적 공격성 (Passive-Aggressive)',
    risk: '🚨 경고 • 문장 내 냉소적인 어조 및 무언의 압박감 감지 (부정 감정 유발 확률 89%)',
    parsedTip: '💬 Convia 말투 순화 가이드: "믿고 맡기겠습니다. 주말 일정이 겹치실 수 있으니, 혹시 다음 주 초까지 기한 조율이 필요하시다면 편히 조율 부탁드립니다."'
  });

  // 2. Kakao State
  const [kakaoCount, setKakaoCount] = useState(5);
  const [kakaoDelay, setKakaoDelay] = useState(120); // mins
  const [kakaoResult, setKakaoResult] = useState<{ score: number; level: string; warning: string; plan: string } | null>({
    score: 65,
    level: '⚠️ 주의 (Moderate)',
    warning: '대화방 내 특정 참여자에 대한 읽씹 누적 및 응답 시간의 급격한 지연이 감지되었습니다.',
    plan: '📋 대화 소외 극복 플랜: "침묵 중인 멤버를 직접 멘션하며 가벼운 확인성 질문을 던져 발언 장벽을 낮춰보세요."'
  });

  // 3. Notion State
  const [notionCardCount, setNotionCardCount] = useState(12);
  const [notionAssigneeCount, setNotionAssigneeCount] = useState(2);
  const [notionResult, setNotionResult] = useState<{ score: number; status: string; suggestion: string; reassignPlan: string } | null>({
    score: 60,
    status: '⚠️ 업무 불균형 감지 (Moderate)',
    suggestion: '특정 1명에게 할당된 칸반 티켓 및 완료 과업 피로도가 지나치게 편중되어 있습니다.',
    reassignPlan: '📋 역할 재분배 추천: "개발 파트의 B 태스크 2건을 비교적 여유 일감이 있는 C 멤버에게 위임 또는 재분배하는 것을 추천합니다."'
  });

  // 4. GitHub State
  const [githubCommits, setGithubCommits] = useState(18);
  const [githubLines, setGithubLines] = useState(2800);
  const [githubResult, setGithubResult] = useState<{ score: number; efficiency: string; reviewAggressiveness: string; ratingHelp: string } | null>({
    score: 75,
    efficiency: '⚠️ 대형 커밋 집중 (기여 과부하 발생 및 리뷰 병목 리스크 상승)',
    reviewAggressiveness: '✅ 양호 (PR 리뷰 톤 안정적)',
    ratingHelp: '📋 HR 기여도 평가 지원: "해당 멤버는 소스 기여 대비 소통 비중이 조화롭습니다. 사후 평가 시 기획/코딩 실질 기여 점수를 가산 반영하세요."'
  });

  const [loading, setLoading] = useState(false);

  // Handlers for Sandbox
  const handleTestSlack = () => {
    setLoading(true);
    setTimeout(() => {
      let score = 55;
      let sentiment = '수동적 공격성 (Passive-Aggressive)';
      let risk = '⚠️ 주의 요망 • 비폭력 화법 필터 추천';
      let parsedTip = '💬 Convia 말투 순화 가이드: "제가 도와드릴 부분이 있을까요? 다음 미팅 전까지 일정을 조율해 보아요."';
      
      if (slackInput.includes('^^') || slackInput.includes('...')) {
        score = 78;
        sentiment = '비꼬는 감정 / 간접 불만 (Sarcastic Friction)';
        risk = '🚨 경고 • 상대방에게 불쾌감이나 업무 방어기제를 자극할 확률 89%';
        parsedTip = '💬 Convia 말투 순화 가이드: "믿고 맡기겠습니다. 혹시 주말 전 완료가 무리가 되신다면 편히 조율 부탁드릴게요."';
      } else if (slackInput.includes('아니') || slackInput.includes('답답') || slackInput.includes('이 모양')) {
        score = 88;
        sentiment = '직접적 감정 표출 (Direct Hostility)';
        risk = '🚨 위험 • 날선 말투로 소통 채널 내 정서적 이탈 리스크 유발 우려';
        parsedTip = '💬 Convia 말투 순화 가이드: "전달드린 피드백 방향성과 다소 차이가 있는 것 같습니다. 싱크업 미팅에서 세부 조율을 진행해 보면 어떨까요?"';
      } else if (slackInput.includes('감사') || slackInput.includes('고생') || slackInput.includes('화이팅')) {
        score = 12;
        sentiment = '생산적 격려 (Constructive Encouragement)';
        risk = '✅ 안전 • 협업 참여를 촉진하고 심리적 안전감을 높이는 우수한 소통 톤';
        parsedTip = '💬 Convia 제안: "지금처럼 긍정적이고 정교한 피드백 루프를 이어가시는 것을 추천합니다."';
      }
      setSlackResult({ score, sentiment, risk, parsedTip });
      setLoading(false);
    }, 400);
  };

  const handleTestKakao = () => {
    setLoading(true);
    setTimeout(() => {
      const score = Math.min(100, Math.round((kakaoDelay / 60) * 15 + (kakaoCount * 8)));
      let level = '양호';
      let warning = '소외나 응답 지연 징후가 극히 적습니다.';
      let plan = '📋 대화 소외 극복 플랜: "팀 내의 균형 잡힌 실시간 소통 흐름이 양호하게 지속되고 있습니다."';
      
      if (score > 70) {
        level = '🚨 소통 고립 위험 (High)';
        warning = '대답 없는 침묵과 응답 대기 시간이 경보 수준입니다. 특정 발언자가 사실상 방치 상태에 있습니다.';
        plan = '📋 대화 소외 극복 플랜: "해당 참여자의 글에 리액션 이모지를 적극 달아주고, 쉬운 범위의 질문으로 재참여를 이끌어내세요."';
      } else if (score > 40) {
        level = '⚠️ 주의 (Medium)';
        warning = '응답 속도가 다소 지연되거나 대화 흐름이 단절되는 징후가 존재합니다.';
        plan = '📋 대화 소외 극복 플랜: "최근 발언이 부재한 멤버의 이름을 짚어 의견을 경청하는 원스텝 매핑 룰을 도입해 보세요."';
      }
      setKakaoResult({ score, level, warning, plan });
      setLoading(false);
    }, 400);
  };

  const handleTestNotion = () => {
    setLoading(true);
    setTimeout(() => {
      const imbalanceRatio = Math.round((notionCardCount / (notionAssigneeCount || 1)) * 10);
      const score = Math.min(100, imbalanceRatio);
      let status = '균등 배분';
      let suggestion = '역할 배분이 골고루 분산되어 안정적인 단계입니다.';
      let plan = '📋 역할 분배 추천: "팀 내 특정 멤버에게 일감이 과몰입되지 않은 안전한 소통 상태입니다."';
      
      if (score > 75) {
        status = '🚨 극심한 독박 업무 (High Imbalance)';
        suggestion = '특정 1~2명에게 칸반 보드 카드 비중이 완전히 집중되었습니다. 기한 내 번다운 지수가 위태롭습니다.';
        plan = '📋 역할 분배 추천: "완료가 늦어지는 태스크 중 2건을 기한에 여유가 있는 멤버의 계정으로 즉시 역할 재분배를 추천합니다."';
      } else if (score > 40) {
        status = '⚠️ 주의 (Moderate Imbalance)';
        suggestion = '일감 할당의 미세한 치우침이 감지되었습니다. 마일스톤 회의 시 태스크 재조정이 요구됩니다.';
        plan = '📋 역할 분배 추천: "일의 범위를 쪼개어 서브 태스크를 서브 멤버에게 일부 배당하는 것을 권고합니다."';
      }
      setNotionResult({ score, status, suggestion, reassignPlan: plan });
      setLoading(false);
    }, 400);
  };

  const handleTestGithub = () => {
    setLoading(true);
    setTimeout(() => {
      const ratio = Math.round((githubLines / (githubCommits || 1)));
      let score = 40;
      let efficiency = '보통';
      let reviewAggressiveness = '낮음 (안전)';
      let ratingHelp = '📋 HR 기여도 평가 지원: "정기적인 분할 커밋이 원활하게 유지되어 주관적 오차 없이 기여도 측정이 투명합니다."';
      
      if (ratio > 300) {
        score = 78;
        efficiency = '과부하 커밋 (커밋당 대형 코드 수정 집중)';
        reviewAggressiveness = '⚠️ 위험 (대형 PR로 인한 동료 리뷰 피로 누적 및 코드 지연)';
        ratingHelp = '📋 HR 기여도 평가 지원: "단기간에 코드량이 과폭발하여 다른 팀원들의 동시 다면 기여를 저해했을 우려가 있으니 사후 회고를 추진하세요."';
      } else if (ratio < 40) {
        score = 25;
        efficiency = '최적 (소형 마이크로 커밋 분산화)';
        reviewAggressiveness = '✅ 양호';
        ratingHelp = '📋 HR 기여도 평가 지원: "커밋 신뢰도와 기어 비율이 매우 규칙적입니다. HR 인사 평가 시 협업 가산점 항목을 적극 적용하세요."';
      }
      setGithubResult({ score, efficiency, reviewAggressiveness, ratingHelp });
      setLoading(false);
    }, 400);
  };

  const scrollToSandboxAndSelect = (tab: 'slack' | 'kakao' | 'notion' | 'github') => {
    setActiveTab(tab);
    if (sandboxRef.current) {
      sandboxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-20 animate-fade-in" id="promo-landing-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl text-white p-8 md:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-800/80 text-amber-400 border border-slate-700/50">
            <Sparkles size={13} className="animate-spin" />
            <span>비폭력 지향 로컬 협업 매핑</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight md:leading-tight">
            조직에서 일어나는 모든 순간을<br /> 읽습니다,
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-rose-500 bg-clip-text text-transparent">
              Convia
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            답답하게 묵혀둔 팀 내 대화, 일감 비대칭, 소통 부조화를 Convia만의 독보적인 엔진으로 즉시 감지하여 
            실시간 말투 순화 가이드와 정밀한 HR 기여도 사후 분석 리포트를 제공합니다.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartDiagnostic}
              className="px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
              id="btn-hero-diagnostic"
            >
              지금 로컬 정밀 진단 시작하기
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => {
                sandboxRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all border border-slate-700 flex items-center gap-2"
              id="btn-hero-learn-more"
            >
              기능 예시 시뮬레이션 체험
            </button>
          </div>
        </div>
      </section>

      {/* EXTREMELY PROMINENT CORE CAPABILITIES SHOWCASE */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-[11px] font-black text-indigo-600 tracking-wider uppercase font-mono bg-indigo-50 px-2.5 py-1 rounded-md">
            Core Innovative Features
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Convia의 핵심 혁신 솔루션
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium max-w-xl mx-auto">
            실시간 협업 위험의 조기 경보부터 사후 객관적인 공헌도 평가까지, 협업 생태계의 모든 라이프사이클을 데이터로 증명합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. 사후 객관적 기여도 분석 및 HR 평가 연동 Column */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono block">Post-Project Analytics</span>
                  <h3 className="font-extrabold text-slate-950 text-xl tracking-tight">
                    📊 사후 객관적 기여도 및 인사평가 지표 지원
                  </h3>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                인사담당자(HR)와 프로젝트 리더가 감정이나 친밀도에 치우치지 않고, <b>실제 소통 패턴, 노션 업무 완료율, 깃허브 실질 코드 기여도</b>를 종합 교차 연산하여 공정하고 객관적인 사후 성과 지표로 투명하게 활용할 수 있도록 조력합니다.
              </p>

              {/* Interactive/Visual Dashboard Mockup Widget */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 font-mono text-[11px] text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-sans font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    인사평가용 객전적 기여 종합 리포트
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">HR Audit Standard</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-sans">실질 공헌 보정계수</span>
                    <span className="text-base font-extrabold text-slate-900">1.24x</span>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[85%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-sans">조용하지만 핵심적인 기여자</span>
                    <span className="text-base font-extrabold text-indigo-600">정밀 분석 완료</span>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[100%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs col-span-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans mb-1">
                      <span>협업 지수 신뢰도 (주관 성과 왜곡률 필터링)</span>
                      <span className="font-bold text-slate-700">매우 우수 (98.4%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[98.4%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span><b>인사 평가 왜곡 제로:</b> 과장된 자가 평가나 '목소리 큰 소수'에게 가려진 음지의 숨은 공헌자를 정밀 분석</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span><b>다차원 신뢰성 보정:</b> 슬랙 감정 톤과 코드 실질 임팩트 라인 수, 칸반 진척도를 결합한 성과 가중치 생성</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span><b>HR 리포트 자동 생성:</b> 연봉 협상, 승진 대상 심사, 사후 회고 등에서 증빙 자료로 활용 가능한 데이터 포맷 제공</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 실시간 대화 분석 및 즉각적 교정·역할 조율 지원 Column */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Zap size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono block">Real-time Remediation</span>
                  <h3 className="font-extrabold text-slate-950 text-xl tracking-tight">
                    🚨 실시간 소통 갈등 위험 감지 및 맞춤 조율
                  </h3>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                협업 커뮤니케이션 채널을 실시간 분석하여, <b>팀 내 특정 구성원 고립, 긴급 응답 지연, 감정적 폭발 등</b> 위험 상황 발생 시 관리자 및 팀원에게 개입 안내를 전송하고, 즉각 순화가 필요한 말투 교정과 합리적인 역할 재분배 플랜을 제시합니다.
              </p>

              {/* Interactive/Visual Playbook Mockup Widget */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 font-sans text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    NVC 템플릿 기반 말투 순화 가이드 및 역할 조율
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">위험 경보</span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-rose-50 border border-rose-100/50 rounded-xl">
                    <span className="text-[9px] font-black text-rose-600 uppercase block font-mono">⚠️ 감지된 소외/마찰성 어조</span>
                    <p className="font-bold text-slate-800 text-[11px] mt-0.5">"이거 왜 아직도 안 되어 있어요? 주말까지 무조건 하세요."</p>
                  </div>
                  <div className="text-center text-slate-400">⬇️</div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100/50 rounded-xl">
                    <span className="text-[9px] font-black text-emerald-600 uppercase block font-mono">✅ Convia 비폭력 순화 어조 추천</span>
                    <p className="font-bold text-slate-900 text-[11px] mt-0.5">"작업 진행 중 막히는 병목이 있으신가요? 주말 일정이 부담스러우시다면 역할을 다른 분과 교차하여 일부 분담할 것을 제안해 볼까요?"</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><b>실시간 위험 감지 및 조기 경보:</b> 응답률 폭락이나 언어 마찰 감지 시, 위험 상황을 선제 안내하여 갈등의 격화 예방</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><b>NVC 말투 변환 어시스트:</b> 상대의 반발을 부르지 않는 비폭력 평화 소통 스크립트 실시간 피드백</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><b>역할 재배치 정밀 처방:</b> 편중되거나 지체된 업무 카드를 다른 멤버에게 부드럽게 위임하는 정량적 솔루션 제안</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE 2 PILLARS - Highly Professional Overview */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-[11px] font-black text-indigo-600 tracking-wider uppercase font-mono bg-indigo-50 px-2.5 py-1 rounded-md">
            Our Core Value & Methodology
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Convia가 갈등을 완화하고 기여도를 평가하는 핵심 기술
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            주관적 오차와 감정 소모를 배제한, 완벽한 소통 복원 및 투명한 협업 성과 정량화 솔루션
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Pillar 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl w-fit">
                <TrendingUp size={26} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg md:text-xl">
                1. 실시간 대화 분석 & 중재 해결 플랜
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                협업 채팅 채널의 언어 패턴을 실시간으로 감지하여 오해와 소통 불화를 완벽 차단합니다. 
                부정적인 감정 흐름이나 간접적 불만이 누적되면 이를 정밀하게 진단하고, 건강한 소통을 위한 다각도의 해결 장치를 제공합니다.
              </p>
              
              <ul className="space-y-2.5 pt-2 text-xs text-slate-600 font-bold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-rose-500 shrink-0" />
                  <span>비생산적인 조롱, 무언의 압박감을 감지해 부드러운 말투 순화 가이드 제시</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-rose-500 shrink-0" />
                  <span>특정 팀원의 업무 독점 및 편중 감지 시 즉각적인 역할 재분배 스크립트 제공</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-rose-500 shrink-0" />
                  <span>소외되는 침묵 참여자를 자극 없이 소통망으로 안전하게 견인</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => scrollToSandboxAndSelect('slack')}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              실시간 말투 순화 체험하기
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
                <ShieldCheck size={26} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg md:text-xl">
                2. 사후 정밀 데이터 분석 & HR 기여도 평가 지원
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                프로젝트 완수 후, 누적된 협업 흔적(코드, 카드, 대화)을 종합 사후 분석하여 감정에 치우치지 않는 <b>정량적/정성적 공헌 데이터</b>를 추출합니다. 
                인사 평가를 진행하는 HR 담당자에게 전방위적 신뢰 지표를 제공합니다.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-600 font-bold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>주관적 편견과 목소리 크기에 가려진 조용한 핵심 기여자의 실질 성과 도출</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>협업 도구별 가동 데이터와 응답 협력도 비율을 한눈에 매핑하는 정량 그래프 구성</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>인사 평가(KPI 및 다면평가) 시 주관성을 제로화하고 다각적 기여도를 정확히 입증</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => scrollToSandboxAndSelect('github')}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              사후 기여도 통계 체험하기
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ⚡ 협업 갈등 규칙 시뮬레이터 */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-10 shadow-xs space-y-8" id="sandbox-scenario-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200/40 uppercase tracking-wider font-mono">
              <Layers size={11} />
              <span>Diagnostic Sandbox</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              ⚡ 협업 갈등 규칙 시뮬레이터
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
              실제 대학 프로젝트나 기업 협업 상황에서 빈번하게 나타나는 3가지 마찰 시나리오를 선택해 보세요. Convia 로컬 규칙 엔진이 참여량과 활동 분포를 즉시 계산합니다.
            </p>
          </div>
          <button
            onClick={onStartDiagnostic}
            className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-3 rounded-xl transition-all shadow-md shrink-0"
          >
            내 원본 로그 직접 진단하기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEAM_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenarioId === scenario.id;
            return (
              <div 
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className={`group cursor-pointer rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-4 hover:scale-[1.02] hover:shadow-md ${
                  isSelected 
                    ? 'border-neutral-900 bg-neutral-950 text-white shadow-sm ring-2 ring-neutral-900' 
                    : 'border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="space-y-2">
                  <span className={`text-[9px] font-black uppercase font-mono tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {scenario.id === 'contest-free-rider' ? 'Case 01' : scenario.id === 'grad-thesis-silent' ? 'Case 02' : 'Case 03'}
                  </span>
                  <h3 className={`text-sm font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {scenario.title}
                  </h3>
                  <p className={`text-[11px] font-bold ${isSelected ? 'text-amber-400' : 'text-indigo-600'}`}>
                    {scenario.subtitle}
                  </p>
                  <p className={`text-[11px] leading-relaxed line-clamp-3 ${isSelected ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>
                    {scenario.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                    멤버 수: {scenario.members.length}명
                  </span>
                  <span className={`inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform ${
                    isSelected ? 'text-amber-400' : 'text-neutral-900'
                  }`}>
                    실시간 정밀 진단 실행
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE SIMULATOR & TECH DETAILS INTERACTIVE SECTOR */}
      <section ref={sandboxRef} className="space-y-8 pt-8 border-t border-slate-200" id="sandbox-simulator-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md tracking-wider uppercase font-mono border border-amber-200/50">
              Interactive Simulation Hub
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              실시간 기능 체험 & 채널 분석 시뮬레이터
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl font-medium">
              Convia의 고성능 엔진이 각각의 협업 채널에서 데이터를 어떻게 분석하고 해결책을 제시하는지 직접 조작하며 시뮬레이션해 보세요.
            </p>
          </div>
        </div>

        {/* Channels Selector Menu */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('slack')}
            className={`py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'slack'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Slack size={15} />
            Slack 말투 순화
          </button>
          <button
            onClick={() => setActiveTab('kakao')}
            className={`py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'kakao'
                ? 'bg-white text-yellow-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <MessageCircle size={15} className="fill-yellow-100" />
            KakaoTalk 대화 소외
          </button>
          <button
            onClick={() => setActiveTab('notion')}
            className={`py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'notion'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText size={15} />
            Notion 업무 독박
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'github'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Github size={15} />
            GitHub 실질 기여도
          </button>
        </div>

        {/* Visual Info Display & Live Sandbox Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct explanations for each technology */}
          <div className="lg:col-span-5 space-y-6">
            {activeTab === 'slack' && (
              <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-6 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-600">
                  <Slack size={20} />
                  <h4 className="font-extrabold text-slate-900 text-base">Slack 실시간 말투 교정 기능</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  슬랙 어조 진단기는 주관적인 감정 해석을 지양하고, 실제 비폭력 언어 정량화 공식을 사용해 <b>문맥 뒤에 가려진 마찰과 냉소</b>를 진단합니다.
                </p>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-rose-100 text-rose-700 rounded font-mono font-bold text-[10px] shrink-0">마찰율</span>
                    <p className="text-slate-500 font-medium">조롱이나 과도한 다이렉트 푸시, 은근한 지연 압박 등의 감도 점수 환산</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-rose-100 text-rose-700 rounded font-mono font-bold text-[10px] shrink-0) shrink-0">순화필터</span>
                    <p className="text-slate-500 font-medium">대체할 비폭력 스크립트를 즉각 제안하여 팀 내 감정 파열을 원천 봉쇄</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kakao' && (
              <div className="bg-yellow-50/40 rounded-2xl border border-yellow-200/60 p-6 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-yellow-600">
                  <MessageCircle size={20} className="fill-yellow-100" />
                  <h4 className="font-extrabold text-slate-900 text-base">KakaoTalk 응답 소외 매핑 기능</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  카카오톡 단체 채팅방 텍스트 데이터를 분석하여, 특정 멤버의 대답이 방치되거나 무의식적으로 소외당하는 현상(읽씹, 늦씹)을 가려냅니다.
                </p>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-yellow-100 text-yellow-800 rounded font-mono font-bold text-[10px] shrink-0">지연(RTT)</span>
                    <p className="text-slate-500 font-medium">특정인의 제안 후 타인의 답장이 오기까지 걸리는 정량 경과 시간 감지</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-yellow-100 text-yellow-800 rounded font-mono font-bold text-[10px] shrink-0">소외 지수</span>
                    <p className="text-slate-500 font-medium">팀원 중 소외 징후를 보이는 구성원의 정신적 이탈율 조기 경보</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notion' && (
              <div className="bg-amber-50/40 rounded-2xl border border-amber-200/60 p-6 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-600">
                  <FileText size={20} />
                  <h4 className="font-extrabold text-slate-900 text-base">Notion 업무 독박/편중 진단 기능</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  기획서 회의록이나 보드 데이터에만 이름이 올라있고, 사실상 특정 1인이 과업을 짊어지는 "독박 프로젝트"를 즉각 적발합니다.
                </p>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-amber-100 text-amber-800 rounded font-mono font-bold text-[10px] shrink-0">할당 비율</span>
                    <p className="text-slate-500 font-medium">전체 칸반 데이터 대비 담당 멤버의 기한 밀집 일감 비율 연산</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-amber-100 text-amber-800 rounded font-mono font-bold text-[10px] shrink-0">위임 가이드</span>
                    <p className="text-slate-500 font-medium">정체가 우려되는 보틀넥 작업을 타 멤버에게 재분배할 수 있는 구체적 시나리오 제안</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="bg-indigo-50/40 rounded-2xl border border-indigo-200/60 p-6 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Github size={20} />
                  <h4 className="font-extrabold text-slate-900 text-base">GitHub 코드 기여 사후 기여도 산출</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  말만 앞서는 소통 대신, 실제 깃허브 코드 저장소에 반영된 Commit 횟수와 Line 변화량을 교차 분석하여 공정한 기여도를 평가합니다.
                </p>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-[10px] shrink-0">커밋 분산</span>
                    <p className="text-slate-500 font-medium">일시적 몰치기 대형 코딩 대신 마이크로 분산 협업을 했는지 신뢰도 평가</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="p-1 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-[10px] shrink-0">인사 다면지표</span>
                    <p className="text-slate-500 font-medium">HR 관리자가 각 인원의 정성적 말투 필터 점수와 정량적 깃 코딩 점수를 다면 융합하여 기여 평가 가능</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Info size={14} />
                <span>데이터 일회성 연산 보증</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                모든 시뮬레이션 및 데이터 매핑 알고리즘은 외부 클라우드 서버에 영구 기록되지 않으며, 브라우저 세션 즉시 만료 처리되어 보안 및 사생활 침해 걱정이 전혀 없습니다.
              </p>
            </div>
          </div>

          {/* Right Column: Live Sandbox Simulator */}
          <div className="lg:col-span-7">
            <div className="bg-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-amber-400" />
                  <h4 className="font-extrabold text-sm tracking-tight text-slate-200 uppercase font-mono">
                    Convia Core Engine Sandbox v1.2
                  </h4>
                </div>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Sim Active
                </span>
              </div>

              {/* 1. Slack Sandbox UI */}
              {activeTab === 'slack' && (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">임의의 슬랙 대화 문장 입력</label>
                    <textarea
                      value={slackInput}
                      onChange={(e) => setSlackInput(e.target.value)}
                      className="w-full h-24 bg-slate-900 text-slate-100 rounded-xl p-3.5 border border-slate-800 focus:border-rose-500 focus:outline-hidden font-medium leading-relaxed"
                      placeholder="슬랙 갈등 문장을 자유롭게 적어보세요... (예: 어련히, 주말까지, 아니)"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => setSlackInput('진짜 어련히 알아서들 잘 하시네요^^ 전 손 뗄랍니다.')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-[10px] font-bold text-slate-300 border border-slate-800 transition-colors"
                      >
                        💡 수동적 공격 예시
                      </button>
                      <button
                        onClick={() => setSlackInput('아니 제가 저번에도 말씀드렸는데 왜 또 기획이 이 모양이죠?')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-[10px] font-bold text-slate-300 border border-slate-800 transition-colors"
                      >
                        💡 감정 표출 예시
                      </button>
                      <button
                        onClick={() => setSlackInput('항상 성실히 임해주셔서 감사합니다! 이번 빌드 대만족이에요 화이팅!')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-[10px] font-bold text-slate-300 border border-slate-800 transition-colors"
                      >
                        💡 긍정 격려 예시
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleTestSlack}
                    disabled={loading}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-extrabold transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-900/10"
                  >
                    <Play size={12} fill="white" />
                    {loading ? '어조 매칭 필터링 분석 중...' : '슬랙 말투 리얼타임 분석하기'}
                  </button>

                  {slackResult && (
                    <div className="p-4.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">마찰 지수:</span>
                        <span className={`font-mono font-black text-xs ${slackResult.score > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {slackResult.score} / 100
                        </span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${slackResult.score > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${slackResult.score}%` }}
                        ></div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-800/60 leading-relaxed">
                        <p className="text-[11px] font-bold text-slate-200">
                          감정 분류: <span className="text-amber-400">{slackResult.sentiment}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {slackResult.risk}
                        </p>
                        <p className="text-[11px] text-emerald-400 font-extrabold bg-slate-950/60 p-3 rounded-xl border border-emerald-950 leading-relaxed">
                          {slackResult.parsedTip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Kakao Sandbox UI */}
              {activeTab === 'kakao' && (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-slate-400 font-bold">대화방 내 미응답 메시지 수</label>
                        <span className="text-yellow-400 font-mono font-bold">{kakaoCount}개</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={kakaoCount}
                        onChange={(e) => setKakaoCount(Number(e.target.value))}
                        className="w-full accent-yellow-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-slate-400 font-bold">평균 응답 지연 시간 (분)</label>
                        <span className="text-yellow-400 font-mono font-bold">{kakaoDelay}분</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="600"
                        step="5"
                        value={kakaoDelay}
                        onChange={(e) => setKakaoDelay(Number(e.target.value))}
                        className="w-full accent-yellow-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleTestKakao}
                    disabled={loading}
                    className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <Play size={12} fill="currentColor" />
                    {loading ? '카카오 소외 지수 정합 연산 중...' : '대화방 소외 고립도 분석하기'}
                  </button>

                  {kakaoResult && (
                    <div className="p-4.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">소통 고립 차단도:</span>
                        <span className="font-mono font-black text-xs text-yellow-400">
                          {kakaoResult.score} / 100
                        </span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-300"
                          style={{ width: `${kakaoResult.score}%` }}
                        ></div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-800/60 leading-relaxed">
                        <p className="text-[11px] font-bold text-slate-200">
                          고립 강도: <span className="text-yellow-400">{kakaoResult.level}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                          {kakaoResult.warning}
                        </p>
                        <p className="text-[11px] text-amber-400 font-extrabold bg-slate-950/60 p-3 rounded-xl border border-amber-950 leading-relaxed">
                          {kakaoResult.plan}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Notion Sandbox UI */}
              {activeTab === 'notion' && (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-slate-400 font-bold">미완료 노션 칸반 카드 수</label>
                        <span className="text-amber-400 font-mono font-bold">{notionCardCount}개</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={notionCardCount}
                        onChange={(e) => setNotionCardCount(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-slate-400 font-bold">업무 배정 담당 인원수</label>
                        <span className="text-amber-400 font-mono font-bold">{notionAssigneeCount}명</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={notionAssigneeCount}
                        onChange={(e) => setNotionAssigneeCount(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleTestNotion}
                    disabled={loading}
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 rounded-xl font-extrabold transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-900/10"
                  >
                    <Play size={12} fill="white" />
                    {loading ? '노션 데이터 연동 분석 중...' : '칸반 업무 독박 비율 산출하기'}
                  </button>

                  {notionResult && (
                    <div className="p-4.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">독박 업무 위험 지수:</span>
                        <span className="font-mono font-black text-xs text-amber-400">
                          {notionResult.score}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${notionResult.score}%` }}
                        ></div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-800/60 leading-relaxed">
                        <p className="text-[11px] font-bold text-slate-200">
                          진단 결과: <span className="text-amber-400">{notionResult.status}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                          {notionResult.suggestion}
                        </p>
                        <p className="text-[11px] text-yellow-400 font-extrabold bg-slate-950/60 p-3 rounded-xl border border-yellow-950 leading-relaxed">
                          {notionResult.reassignPlan}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. GitHub Sandbox UI */}
              {activeTab === 'github' && (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-slate-400 font-bold">최근 7일 전체 커밋 횟수</label>
                        <span className="text-indigo-400 font-mono font-bold">{githubCommits}회</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={githubCommits}
                        onChange={(e) => setGithubCommits(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-slate-400 font-bold">수정 총 코드 라인 수 (Lines Changed)</label>
                        <span className="text-indigo-400 font-mono font-bold">{githubLines} lines</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="8000"
                        step="50"
                        value={githubLines}
                        onChange={(e) => setGithubLines(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleTestGithub}
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-extrabold transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-900/10"
                  >
                    <Play size={12} fill="white" />
                    {loading ? '코드 저장소 이력 크로스 분석 중...' : 'GitHub 기여 균형 및 HR 매핑 실행'}
                  </button>

                  {githubResult && (
                    <div className="p-4.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">커밋 집중 부하도:</span>
                        <span className="font-mono font-black text-xs text-indigo-400">
                          {githubResult.score} / 100
                        </span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${githubResult.score}%` }}
                        ></div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-800/60 leading-relaxed">
                        <p className="text-[11px] font-bold text-slate-200">
                          커밋 효율성: <span className="text-indigo-400">{githubResult.efficiency}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                          동료 리뷰 부담도: <span className="text-slate-300 font-bold">{githubResult.reviewAggressiveness}</span>
                        </p>
                        <p className="text-[11px] text-indigo-300 font-extrabold bg-slate-950/60 p-3 rounded-xl border border-indigo-950 leading-relaxed">
                          {githubResult.ratingHelp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Security and Privacy Disclaimer with locks */}
      <section className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-rose-500/5 pointer-events-none"></div>
        <div className="flex items-start gap-4 max-w-2xl relative z-10">
          <div className="p-3 bg-slate-800 rounded-2xl text-amber-400 mt-0.5">
            <Lock size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-100 text-sm">개인정보 및 대화 비밀 보호 보증</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Convia는 업로드한 대화 로그를 별도 데이터베이스에 저장하거나 외부 생성형 AI 서비스로 전송하지 않습니다.
              분석은 이 앱의 서버 프로세스 메모리에서 규칙 기반으로 처리되며, 사용자가 연동을 실행한 경우에만 Slack 또는 GitHub API에 요청합니다.
            </p>
          </div>
        </div>
        <button
          onClick={onStartDiagnostic}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors shrink-0 relative z-10"
        >
          안전하게 직접 체험하기
        </button>
      </section>
    </div>
  );
}
