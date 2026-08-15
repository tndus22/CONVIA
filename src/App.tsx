import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Users,
  Activity,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Home,
  Cpu,
  Database,
  Bookmark,
  LogOut,
  Trash2
} from 'lucide-react';
import { TEAM_SCENARIOS } from './data';
import { AnalysisReport, WorkspaceLogs, TeamScenario } from './types';
import IntegrationConfig from './components/IntegrationConfig';
import Dashboard from './components/Dashboard';
import PlaybookReport from './components/PlaybookReport';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';

export default function App() {
  const [navigationTab, setNavigationTab] = useState<'home' | 'hr-evaluation' | 'realtime-mediation'>('home');

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('contest-free-rider');
  const [customLogs, setCustomLogs] = useState<WorkspaceLogs>({
    slackLogs: '',
    notionNotes: '',
    githubActivity: ''
  });
  
  // Choose to analyze either Scenario or Custom inputs
  const [useCustomMode, setUseCustomMode] = useState<boolean>(false);
  
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeReportTab, setActiveReportTab] = useState<'dashboard' | 'playbook'>('dashboard');

  // Auth states
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; userType?: 'student' | 'corporate'; organizationSize?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [savedReportsList, setSavedReportsList] = useState<Array<{ id: string; analyzedAt: string; report: AnalysisReport; targetName: string }>>([]);

  // Trigger default scenario analysis on mount so the user sees a beautiful initialized dashboard immediately!
  useEffect(() => {
    handleRunAnalysis(TEAM_SCENARIOS[0]);

    // Load session and saved reports
    const activeSession = localStorage.getItem('convia_active_session');
    if (activeSession) {
      const user = JSON.parse(activeSession);
      setCurrentUser(user);
      
      const usersRaw = localStorage.getItem('convia_users');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const found = users.find((u: any) => u.email === user.email);
        if (found && found.savedReports) {
          setSavedReportsList(found.savedReports);
        }
      }
    }
  }, []);

  const handleLoginSuccess = (user: { email: string; name: string; userType?: 'student' | 'corporate'; organizationSize?: string }) => {
    setCurrentUser(user);
    localStorage.setItem('convia_active_session', JSON.stringify(user));
    
    // Load saved reports
    const usersRaw = localStorage.getItem('convia_users');
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const found = users.find((u: any) => u.email === user.email);
      if (found && found.savedReports) {
        setSavedReportsList(found.savedReports);
      } else {
        setSavedReportsList([]);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedReportsList([]);
    localStorage.removeItem('convia_active_session');
  };

  const handleSaveReport = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      alert('분석된 파일을 안전하게 보관하기 위해서는 회원가입 또는 로그인이 필요합니다. 지금 바로 가입해 보세요!');
      return;
    }
    if (!report) return;

    const targetName = useCustomMode ? '사용자 지정 로그' : currentScenario.title;
    const reportId = 'report_' + Date.now();
    const newSavedEntry = {
      id: reportId,
      analyzedAt: new Date().toISOString(),
      report,
      targetName
    };

    const usersRaw = localStorage.getItem('convia_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
    
    if (userIndex > -1) {
      if (!users[userIndex].savedReports) {
        users[userIndex].savedReports = [];
      }
      users[userIndex].savedReports.unshift(newSavedEntry);
      localStorage.setItem('convia_users', JSON.stringify(users));
      setSavedReportsList(users[userIndex].savedReports);
      alert(`성공: [${targetName}] 진단 결과가 귀하의 Convia 계정 보관함에 안전하게 저장되었습니다.`);
    } else {
      alert('오류: 사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.');
    }
  };

  const handleLoadSavedReport = (savedEntry: any) => {
    setReport(savedEntry.report);
    setUseCustomMode(savedEntry.targetName === '사용자 지정 로그');
    setActiveReportTab('dashboard');
    alert(`보관함 동기화: [${savedEntry.targetName}] (${new Date(savedEntry.analyzedAt).toLocaleDateString()}) 리포트를 성공적으로 불러왔습니다.`);
    
    setTimeout(() => {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }, 50);
  };

  const handleDeleteSavedReport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    if (!confirm('정말 이 보관된 분석 데이터를 보관함에서 영구 삭제하시겠습니까?')) return;

    const usersRaw = localStorage.getItem('convia_users');
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
      if (userIndex > -1 && users[userIndex].savedReports) {
        users[userIndex].savedReports = users[userIndex].savedReports.filter((r: any) => r.id !== id);
        localStorage.setItem('convia_users', JSON.stringify(users));
        setSavedReportsList(users[userIndex].savedReports);
      }
    }
  };

  const handleSelectScenario = (scenario: TeamScenario) => {
    setSelectedScenarioId(scenario.id);
    setUseCustomMode(false);
    handleRunAnalysis(scenario);
  };

  const handleCustomAnalyzeTrigger = (inputs: WorkspaceLogs) => {
    setCustomLogs(inputs);
    setUseCustomMode(true);
    handleRunAnalysis(inputs);
  };

  const handleRunAnalysis = async (payload: WorkspaceLogs | TeamScenario) => {
    setIsLoading(true);
    setErrorMessage('');
    console.log(payload, "payload")
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slackLogs: payload.slackLogs,
          kakaoLogs: (payload as any).kakaoLogs,
          notionNotes: payload.notionNotes,
          githubActivity: payload.githubActivity,
          members: 'members' in payload ? payload.members : undefined
        })
      });

      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `서버 응답 오류가 발생했습니다 (${response.status})`);
      }

      const data = await response.json();
      setReport(data);
      setActiveReportTab('dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '로컬 분석을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentScenario = TEAM_SCENARIOS.find(s => s.id === selectedScenarioId) || TEAM_SCENARIOS[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans antialiased text-slate-800" id="app-root">
      {/* Visual Accent Top Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500"></div>
      
      {/* Visual Accent Header with premium styling */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col md:flex-row md:items-center justify-between gap-3 py-2 md:py-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setNavigationTab('home')}
              className="p-2.5 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm shadow-slate-900/10 hover:scale-105 transition-transform"
            >
              <Sparkles size={22} className="text-amber-400 animate-pulse" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setNavigationTab('home')}
                  className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                  Convia
                </button>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 uppercase tracking-wider font-mono">
                  v1.2 Premium
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
                규칙 기반 로컬 협업 진단 플랫폼
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-center" id="nav-tabs">
            <button
              onClick={() => setNavigationTab('home')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                navigationTab === 'home'
                  ? 'bg-white text-slate-950 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              <Home size={14} />
              기능 소개
            </button>
            <button
              onClick={() => setNavigationTab('hr-evaluation')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                navigationTab === 'hr-evaluation'
                  ? 'bg-white text-slate-950 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
              id="btn-nav-hr"
            >
              <TrendingUp size={14} />
              기여도 분석
            </button>
            <button
              onClick={() => setNavigationTab('realtime-mediation')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                navigationTab === 'realtime-mediation'
                  ? 'bg-white text-slate-950 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
              id="btn-nav-realtime"
            >
              <MessageSquare size={14} />
              실시간 대화 분석 및 피드백
            </button>
          </nav>
          
          <div className="flex items-center gap-3 self-center md:self-auto">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Convia Engine Live
            </span>
            
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-3.5 pr-2 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                <div className="flex flex-col items-start leading-tight pr-1">
                  <span className="text-slate-600 block text-[11px]">
                    👋 <span className="text-slate-900 font-extrabold">{currentUser.name}</span>님
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 mt-0.5 inline-block">
                    {currentUser.userType === 'corporate' ? `🏢 기업 (${currentUser.organizationSize || '10명 미만'})` : '🎓 학생 (개인/팀)'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors"
                  title="로그아웃"
                  id="btn-logout"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                id="btn-header-login"
              >
                <Users size={13} />
                로그인 / 회원가입
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-16" id="app-main-content">
        {navigationTab === 'home' && (
          <LandingPage 
            onStartDiagnostic={() => setNavigationTab('hr-evaluation')} 
            onSelectScenario={(scenario) => {
              handleSelectScenario(scenario);
              setNavigationTab('hr-evaluation');
            }}
            selectedScenarioId={selectedScenarioId}
          />
        )}

        {/* 1. 사후 객관적 기여도 및 인사평가 지표 지원 페이지 */}
        {navigationTab === 'hr-evaluation' && (
          <div className="space-y-10 animate-fade-in">
            {/* Page Title & Mission */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200/40 uppercase tracking-wider font-mono">
                  <TrendingUp size={11} />
                  <span>Post-Project HR Analytics</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  📊 사후 객관적 기여도 및 인사평가 지표 지원
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
                  팀 프로젝트 종료 후, 주관적인 왜곡이나 감정을 제거하고 실제 대화 참여율, 노션 일감 기여도, 깃허브 코드 이력을 기반으로 정밀한 객관적 공헌 지표를 산출하여 HR 평가용 리포트로 제공합니다.
                </p>
              </div>
              
              {report && !isLoading && (
                <button
                  onClick={handleSaveReport}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all self-start md:self-center shrink-0"
                  id="btn-save-report-hr"
                >
                  <Bookmark size={14} className="fill-amber-400 text-amber-400" />
                  현재 평가 리포트 저장하기
                </button>
              )}
            </div>

            {/* If user has saved files, show personal archive! */}
            {currentUser && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6" id="personal-archives-hub-hr">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
                  <Bookmark size={18} className="text-amber-500 fill-amber-400" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {currentUser.name}님의 HR 평가 보관함
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      안전하게 영구 누적 보관된 사후 기여도 리포트 목록입니다.
                    </p>
                  </div>
                </div>

                {savedReportsList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    보관함에 저장된 진단 결과가 아직 없습니다. 하단에서 로그를 분석한 후 <b>'현재 평가 리포트 저장하기'</b> 버튼을 클릭해 보세요!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {savedReportsList.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleLoadSavedReport(entry)}
                        className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all flex flex-col justify-between group relative"
                      >
                        <button
                          onClick={(e) => handleDeleteSavedReport(e, entry.id)}
                          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                        
                        <div className="space-y-1.5 pr-6">
                          <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {new Date(entry.analyzedAt).toLocaleDateString()} {new Date(entry.analyzedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-slate-950 transition-colors">
                            {entry.targetName}
                          </h4>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>인사평가 점수: <b className="text-slate-900 font-extrabold">{entry.report.summaryScore}점</b></span>
                          <span className="text-slate-900 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            불러오기 <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loading/Error for HR-Evaluation */}
            {isLoading && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-slate-900 text-white rounded-full animate-spin">
                  <RefreshCw size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900">Convia가 사후 소통 기여도 및 인사 평가지표를 다차원 연산하고 있습니다</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    슬랙 감정 감지, 노션 업무 분배 편중성 진단, 깃허브 코드 이력을 Convia 엔진으로 종합 연동하여 정량 평가 지표를 완성하고 있습니다. 잠시만 기다려 주세요...
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 shadow-2xs flex gap-3.5 items-start">
                <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-rose-900">진단 처리에 실패했습니다</h4>
                  <p className="text-xs text-rose-700 font-medium">{errorMessage}</p>
                  <div className="text-[11px] text-rose-600 space-y-1">
                    <p>💡 <b>원인 해결 가이드:</b></p>
                    <p>1. 입력한 로그가 비어 있거나 지원되는 형식인지 확인해 주세요.</p>
                    <p>2. 서버가 실행 중인지 확인한 뒤 다시 시도해 주세요. 별도 AI API 키는 필요하지 않습니다.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Render Dashboard Component */}
            {!isLoading && report && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                    Current Analytics Dataset: {useCustomMode ? '사용자 지정 로그' : currentScenario.title}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                    HR Audit Level AAA
                  </span>
                </div>
                <Dashboard report={report} />
              </div>
            )}

            {/* Custom Input Config */}
            <div className="space-y-6">
              <div className="border-l-4 border-neutral-900 pl-4">
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">실제 협업 데이터 직접 분석하기</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  실제 본인이 참여하는 협업 채널의 데이터를 직접 입력하여 정밀 사후 기여도 분석을 진행할 수 있습니다.
                </p>
              </div>
              <IntegrationConfig onAnalyze={handleCustomAnalyzeTrigger} isLoading={isLoading} />
            </div>
          </div>
        )}

        {/* 2. 실시간 소통 갈등 위험 감지 및 맞춤 조율 페이지 */}
        {navigationTab === 'realtime-mediation' && (
          <div className="space-y-10 animate-fade-in">
            {/* Page Title & Mission */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200/40 uppercase tracking-wider font-mono">
                  <MessageSquare size={11} />
                  <span>Real-time Remediation</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  🚨 실시간 소통 갈등 위험 감지 및 맞춤 조율
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
                  프로젝트 진행 중 소통 채널의 특정 구성원 고립, 긴급 응답 누락, 대화 간의 비꼬기/공격적 어조 등 위험 수위를 모니터링하여 즉각적인 평화주의 스크립트 처방과 역할 조율 대책을 마련해 드립니다.
                </p>
              </div>
              
              {report && !isLoading && (
                <button
                  onClick={handleSaveReport}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all self-start md:self-center shrink-0"
                  id="btn-save-report-mediation"
                >
                  <Bookmark size={14} className="fill-amber-400 text-amber-400" />
                  현재 대화 분석 리포트 저장하기
                </button>
              )}
            </div>

            {/* If user has saved files, show personal archive! */}
            {currentUser && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6" id="personal-archives-hub-mediation">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
                  <Bookmark size={18} className="text-amber-500 fill-amber-400" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {currentUser.name}님의 실시간 대화 분석 보관함
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      안전하게 영구 누적 보관된 실시간 위험 진단 및 말투 교정 리포트 목록입니다.
                    </p>
                  </div>
                </div>

                {savedReportsList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    보관함에 저장된 진단 결과가 아직 없습니다. 하단에서 로그를 분석한 후 <b>'현재 대화 분석 리포트 저장하기'</b> 버튼을 클릭해 보세요!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {savedReportsList.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleLoadSavedReport(entry)}
                        className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all flex flex-col justify-between group relative"
                      >
                        <button
                          onClick={(e) => handleDeleteSavedReport(e, entry.id)}
                          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                        
                        <div className="space-y-1.5 pr-6">
                          <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {new Date(entry.analyzedAt).toLocaleDateString()} {new Date(entry.analyzedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-slate-950 transition-colors">
                            {entry.targetName}
                          </h4>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>종합 갈등점수: <b className="text-slate-900 font-extrabold">{entry.report.summaryScore}점</b></span>
                          <span className="text-slate-900 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            불러오기 <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loading/Error for Mediation */}
            {isLoading && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-slate-900 text-white rounded-full animate-spin">
                  <RefreshCw size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900">Convia가 실시간 마찰 위험 신호를 가중 분석 중입니다</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    메시지 참여량, 업무 분포, 기여도와 마찰 표현을 규칙 기반으로 계산하고 있습니다. 잠시만 기다려 주세요...
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 shadow-2xs flex gap-3.5 items-start">
                <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-rose-900">진단 처리에 실패했습니다</h4>
                  <p className="text-xs text-rose-700 font-medium">{errorMessage}</p>
                  <div className="text-[11px] text-rose-600 space-y-1">
                    <p>💡 <b>원인 해결 가이드:</b></p>
                    <p>1. 입력한 로그가 비어 있거나 지원되는 형식인지 확인해 주세요.</p>
                    <p>2. 서버가 실행 중인지 확인한 뒤 다시 시도해 주세요. 별도 AI API 키는 필요하지 않습니다.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Render PlaybookReport Component */}
            {!isLoading && report && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                    Current Mediation Dataset: {useCustomMode ? '사용자 지정 로그' : currentScenario.title}
                  </span>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100/50">
                    Real-time Threat Monitoring Active
                  </span>
                </div>
                <PlaybookReport playbook={report.playbook} />
              </div>
            )}

            {/* Custom Input Config */}
            <div className="space-y-6">
              <div className="border-l-4 border-neutral-900 pl-4">
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">실제 대화 로그 직접 분석하기</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  실제 마찰이 빈번하게 일어나는 단체 대화방 및 업무 툴의 비정제 원본 데이터를 입력하여 실시간 위기 가이드라인을 확보하세요.
                </p>
              </div>
              <IntegrationConfig onAnalyze={handleCustomAnalyzeTrigger} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
    </div>
  );
}
