import React, { useState } from 'react';
import { Mail, Lock, User, X, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; name: string; userType?: 'student' | 'corporate'; organizationSize?: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'student' | 'corporate'>('student');
  const [organizationSize, setOrganizationSize] = useState<string>('1-10명');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password || !name) {
      setError('모든 필드를 채워주세요.');
      return;
    }

    // Get existing users
    const usersRaw = localStorage.getItem('convia_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const userExists = users.some((u: any) => u.email === email);
    if (userExists) {
      setError('이미 가입된 이메일 주소입니다.');
      return;
    }

    const newUser = { 
      email, 
      password, 
      name, 
      userType, 
      organizationSize: userType === 'corporate' ? organizationSize : undefined,
      savedReports: [] 
    };
    users.push(newUser);
    localStorage.setItem('convia_users', JSON.stringify(users));

    setSuccessMsg('회원가입이 완료되었습니다! 맞춤 서비스 설정을 시작합니다.');
    setTimeout(() => {
      onLoginSuccess({ 
        email, 
        name, 
        userType, 
        organizationSize: userType === 'corporate' ? organizationSize : undefined 
      });
      onClose();
      // Reset
      setEmail('');
      setPassword('');
      setName('');
      setSuccessMsg('');
    }, 1200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const usersRaw = localStorage.getItem('convia_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      setError('이메일 주소 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    const welcomeMsg = user.userType === 'corporate'
      ? `${user.name} 담당자님, 환영합니다! 기업 분석 맞춤 가이드가 동기화되었습니다.`
      : `${user.name}님, 환영합니다! Convia 협업 진단 가이드가 동기화되었습니다.`;

    setSuccessMsg(welcomeMsg);
    setTimeout(() => {
      onLoginSuccess({ 
        email, 
        name: user.name, 
        userType: user.userType, 
        organizationSize: user.organizationSize 
      });
      onClose();
      // Reset
      setEmail('');
      setPassword('');
      setSuccessMsg('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" id="auth-modal-overlay">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden" id="auth-modal-box">
        {/* Upper Accent Color Banner */}
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          id="btn-close-auth"
        >
          <X size={18} />
        </button>

        {/* Form Body */}
        <div className="p-8">
          <div className="text-center mb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider font-mono">
              <Sparkles size={11} className="text-amber-500" />
              <span>Convia Premium Account</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isRegisterMode ? '새로운 계정 만들기' : 'Convia 서비스 로그인'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isRegisterMode 
                ? '분석된 소통 협업 파일을 계정에 안전하게 보관하세요.' 
                : '로그인하여 이전 소통 진단 내역을 안전하게 불러옵니다.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 flex gap-2 items-start text-xs font-semibold animate-shake">
              <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 flex gap-2 items-start text-xs font-semibold">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            {isRegisterMode && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">이름 / 팀명</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-hidden rounded-xl text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">회원 구분</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserType('student')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                        userType === 'student'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🎓 학생 (개인/팀 프로젝트)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('corporate')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                        userType === 'corporate'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🏢 기업 (조직 관리/HR)
                    </button>
                  </div>
                </div>

                {userType === 'corporate' && (
                  <div className="space-y-1.5 animate-fade-in-down">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">조직 규모 (인원수)</label>
                    <select
                      value={organizationSize}
                      onChange={(e) => setOrganizationSize(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-hidden rounded-xl text-xs font-bold transition-all"
                    >
                      <option value="10명 미만">10명 미만 (소규모 스타트업/소팀)</option>
                      <option value="10명~50명">10명 ~ 50명 (성장기 스타트업)</option>
                      <option value="50명~100명">50명 ~ 100명 (중소기업)</option>
                      <option value="100명 이상">100명 이상 (중견/대기업)</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">이메일 주소</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-hidden rounded-xl text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">비밀번호</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-hidden rounded-xl text-xs font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md mt-6 flex items-center justify-center gap-2"
              id="btn-auth-submit"
            >
              {isRegisterMode ? '회원가입 완료하기' : '로그인하기'}
            </button>
          </form>

          {/* Toggle View */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-400 font-medium">
              {isRegisterMode ? '이미 Convia 계정이 있으신가요? ' : '아직 계정이 없으신가요? '}
            </span>
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
                setSuccessMsg('');
              }}
              className="font-bold text-slate-900 hover:underline ml-1"
              id="btn-auth-toggle"
            >
              {isRegisterMode ? '로그인하기' : '회원가입하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
