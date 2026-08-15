import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { AlertTriangle, TrendingUp, Sparkles, Smile, ShieldAlert, BadgeCheck, MessageSquare, Code } from 'lucide-react';
import { AnalysisReport, RiskLevel, MetricStatus } from '../types';

interface DashboardProps {
  report: AnalysisReport;
}

export default function Dashboard({ report }: DashboardProps) {
  const { overallRiskScore, riskLevel, summary, dimensions, identifiedRisks, memberMetrics, analyzedAt } = report;

  // Format dimension data for Recharts Radar Chart
  const radarData = [
    { subject: '소통 참여도 (Participation)', A: dimensions.participation, fullMark: 100 },
    { subject: '업무 균등성 (Work Balance)', A: 100 - dimensions.imbalance, fullMark: 100 }, // Work Balance = 100 - imbalance
    { subject: '협업 평화도 (Peace Index)', A: 100 - dimensions.conflictRisk, fullMark: 100 }, // Peace = 100 - conflict
    { subject: '소통 우호도 (Tone Sentiment)', A: dimensions.toneSentiment, fullMark: 100 }
  ];

  // Format member metrics for Recharts Bar Chart
  const memberBarData = memberMetrics.map(member => ({
    name: member.name,
    '참여도': member.participationScore,
    '소통 긍정도': member.sentimentScore,
    '업무량(태스크)': member.taskCount * 15, // scaled for visualization
    '깃허브 활동': member.contributionsCount * 5 // scaled for visualization
  }));

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'High':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-100';
    }
  };

  const getStatusBadge = (status: MetricStatus) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700">✓ 정상 활동</span>;
      case 'Overburdened':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-100 text-rose-700">⚠️ 업무 과부하</span>;
      case 'Silent':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 border border-neutral-200 text-neutral-600">📴 대화 이탈</span>;
      case 'Unstable':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-100 text-amber-700">⚡ 불완전 소통</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="dashboard-visual-analytics">
      {/* Risk Overview Hero */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3">
        {/* Dial & Score */}
        <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Overall Health Risk Index
          </span>
          
          <div className="relative flex items-center justify-center my-5 group">
            {/* Glowing background halo */}
            <div className="absolute inset-0 bg-slate-100 rounded-full blur-xl opacity-40 group-hover:opacity-75 transition-opacity"></div>
            
            {/* Simple Dynamic Circle Dial with glowing styling */}
            <svg className="w-34 h-34 transform -rotate-90 relative z-10">
              <circle
                cx="68"
                cy="68"
                r="52"
                stroke="#e2e8f0"
                strokeWidth="11"
                fill="transparent"
              />
              <circle
                cx="68"
                cy="68"
                r="52"
                stroke={overallRiskScore > 70 ? '#f43f5e' : overallRiskScore > 40 ? '#f59e0b' : '#10b981'}
                strokeWidth="11"
                fill="transparent"
                strokeDasharray="326"
                strokeDashoffset={326 - (326 * overallRiskScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center z-10">
              <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">{overallRiskScore}</span>
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
          </div>

          <span className={`px-4 py-1.5 text-xs font-bold rounded-full border shadow-2xs ${getRiskColor(riskLevel)}`}>
            위험 상태: {riskLevel === 'High' ? '🚨 고위험 (High)' : riskLevel === 'Medium' ? '⚠️ 주의 (Medium)' : '✅ 양호 (Low)'}
          </span>
        </div>

        {/* Diagnostic Report Summary */}
        <div className="p-8 md:col-span-2 flex flex-col justify-between bg-gradient-to-br from-white via-white to-slate-50/30">
          <div>
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider font-mono mb-3">
              <Sparkles size={16} className="text-amber-500 fill-amber-400 animate-pulse" />
              Convia 협업 종합 진단 레포트
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium font-sans">
              {summary}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
              진단 시각: <span className="font-semibold text-slate-700">{new Date(analyzedAt).toLocaleDateString()} {new Date(analyzedAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
              인증 출처: <span className="font-semibold text-slate-700">Slack • KakaoTalk • Notion • GitHub Logs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm">
          <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-neutral-500" />
            4대 협업 차원 종합 분석 (Health Matrix)
          </h4>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#404040', fontSize: 10, fontWeight: '500' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#737373', fontSize: 9 }} />
                <Radar
                  name="진단 지수"
                  dataKey="A"
                  stroke="#171717"
                  fill="#171717"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3.5 mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <div className="p-3 bg-slate-50/50 rounded-xl border-l-3 border-rose-500 hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-800 block mb-0.5">✓ 소통 참여도 ({dimensions.participation}점)</span>
              {dimensions.participationDetails}
            </div>
            <div className="p-3 bg-slate-50/50 rounded-xl border-l-3 border-amber-500 hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-800 block mb-0.5">✓ 업무 균등성 ({100 - dimensions.imbalance}점)</span>
              {dimensions.imbalanceDetails}
            </div>
            <div className="p-3 bg-slate-50/50 rounded-xl border-l-3 border-emerald-500 hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-800 block mb-0.5">✓ 협업 평화도 ({100 - dimensions.conflictRisk}점)</span>
              {dimensions.conflictRiskDetails}
            </div>
            <div className="p-3 bg-slate-50/50 rounded-xl border-l-3 border-indigo-500 hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-800 block mb-0.5">✓ 소통 우호도 ({dimensions.toneSentiment}점)</span>
              {dimensions.toneSentimentDetails}
            </div>
          </div>
        </div>

        {/* Member Bar Chart */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm">
          <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-1.5">
            <Smile size={16} className="text-neutral-500" />
            멤버별 소통 및 작업량 기여 비교
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberBarData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 11, fontWeight: '500' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#737373', fontSize: 10 }} />
                <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="참여도" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="소통 긍정도" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="업무량(태스크)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="깃허브 활동" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-neutral-400 text-center mt-3">
            ※ 업무량과 깃허브 활동은 시각적 가독성을 위해 개별 카운트에 배율이 적용되었습니다.
          </p>
        </div>
      </div>

      {/* Team Member Audits Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-neutral-900">팀 협업 멤버 정밀 감사(Audit)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">이름 & 역할</th>
                <th className="py-3 px-5">소통 기여 상태</th>
                <th className="py-3 px-5">대화 참여도</th>
                <th className="py-3 px-5">소통 우호도</th>
                <th className="py-3 px-5">배정된 태스크</th>
                <th className="py-3 px-5">개발 기여도(GitHub)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {memberMetrics.map((member, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-neutral-800">{member.name}</div>
                    <div className="text-[10px] text-neutral-400">{member.role}</div>
                  </td>
                  <td className="py-4 px-5">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="py-4 px-5 font-medium text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: `${member.participationScore}%` }} />
                      </div>
                      <span className="font-mono">{member.participationScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-medium text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${member.sentimentScore}%` }} />
                      </div>
                      <span className="font-mono">{member.sentimentScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-semibold text-neutral-700 font-mono">
                    <span className="flex items-center gap-1">
                      <BadgeCheck size={14} className="text-amber-500" />
                      {member.taskCount} 개
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-neutral-700 font-mono">
                    <span className="flex items-center gap-1 text-indigo-600">
                      <Code size={14} />
                      {member.contributionsCount} commits
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identified Specific Risks */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 bg-neutral-50/20 flex items-center gap-1.5">
          <ShieldAlert size={18} className="text-rose-600" />
          <h4 className="text-sm font-bold text-neutral-900">감지된 핵심 위협 및 피드백 이슈</h4>
        </div>
        <div className="divide-y divide-neutral-100">
          {identifiedRisks && identifiedRisks.length > 0 ? (
            identifiedRisks.map((risk, idx) => (
              <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-neutral-50/30 transition-colors">
                <div className="shrink-0">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                    risk.severity === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : risk.severity === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                  }`}>
                    {risk.severity === 'High' ? '고위험 (High)' : risk.severity === 'Medium' ? '경고 (Medium)' : '주의 (Low)'}
                  </span>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-bold text-neutral-900 text-sm tracking-tight">{risk.title}</h5>
                    <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded font-mono">
                      {risk.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans font-medium">
                    {risk.description}
                  </p>
                  <div className="flex flex-wrap gap-1 items-center pt-1.5">
                    <span className="text-[10px] text-neutral-400 font-semibold">관련 팀원:</span>
                    {risk.affectedMembers.map((name, mIdx) => (
                      <span key={mIdx} className="text-[10px] font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-400 text-xs flex flex-col items-center justify-center gap-2">
              <BadgeCheck size={24} className="text-emerald-500" />
              감지된 주요 위험 요소가 없습니다. 완벽한 시너지 상태입니다!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
