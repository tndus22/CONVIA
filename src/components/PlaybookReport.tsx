import React, { useState } from 'react';
import { Calendar, RefreshCw, MessageSquare, Copy, Check, Info, Users, ArrowRight } from 'lucide-react';
import { ActionPlaybook } from '../types';

interface PlaybookReportProps {
  playbook: ActionPlaybook;
}

export default function PlaybookReport({ playbook }: PlaybookReportProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="space-y-6" id="playbook-report-panel">
      {/* Title */}
      <div className="border-l-4 border-slate-900 pl-4">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          🚨 Convia 실시간 마찰 위험 감지 및 맞춤 조율 가이드
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-0.5">
          실시간 소통 감정 및 응답 지연을 실시간 진단하고, 갈등 위험 감지 시 개입 경보와 함께 비폭력 대화(NVC) 기반 말투 피드백 및 합리적인 역할 재구성 방안을 제안합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Meeting Guide */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">추천 다음 회의 진행 설계</h4>
              <p className="text-[11px] font-medium text-slate-500">감정이 아닌 본질에 집중하는 상호 비난 방지 프로세스</p>
            </div>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <Info size={13} className="text-slate-500" />
                회의 중재 위기관리 가이드라인
              </p>
              <p className="text-slate-500 leading-relaxed font-medium">
                특정인을 향한 지적은 방어 본능을 자극합니다. "개인의 나태함"이 아닌 "팀의 리소스 및 시스템 병목"으로 접근해야 진정한 조율이 가능합니다.
              </p>
            </div>
            <div className="whitespace-pre-line text-xs text-slate-600 font-sans leading-relaxed bg-white border border-slate-100 p-4 rounded-xl shadow-2xs font-medium">
              {playbook.meetingGuideline}
            </div>
          </div>
        </div>

        {/* Role realignment advice */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
              <RefreshCw size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">업무 및 역할 재구조화 플랜</h4>
              <p className="text-[11px] font-medium text-slate-500">기여도 병목을 풀고 작업 효용을 극대화하기 위한 가이딩</p>
            </div>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <Users size={13} className="text-slate-500" />
                역할 재구성의 핵심 로직
              </p>
              <p className="text-slate-500 leading-relaxed font-medium">
                과부하 멤버에겐 마일스톤 경감(Scoping down)을 부여하고, 소통 이탈 멤버에겐 고립을 방지하는 명확한 단독 태스크(Micro-task)를 분배하여 안도감을 회복시킵니다.
              </p>
            </div>
            <div className="whitespace-pre-line text-xs text-slate-600 font-sans leading-relaxed bg-white border border-slate-100 p-4 rounded-xl shadow-2xs font-medium">
              {playbook.roleRealignment}
            </div>
          </div>
        </div>
      </div>

      {/* Empathy Scripts Section */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neutral-100 text-rose-600 rounded-md">
              <MessageSquare size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 text-sm">갈등 해결을 위한 비폭력 대화 템플릿</h4>
              <p className="text-xs text-neutral-500">멤버 간에 오해를 풀고 신뢰를 다지기 위해 복사해서 사용해 볼 수 있는 텍스트 구문</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {playbook.feedbackScripts && playbook.feedbackScripts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playbook.feedbackScripts.map((script, idx) => (
                <div key={idx} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/20 relative flex flex-col justify-between transition-all hover:border-neutral-300">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {script.sender}
                      </span>
                      <ArrowRight size={12} className="text-neutral-400" />
                      <span className="font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {script.recipient}
                      </span>
                      <span className="ml-auto text-neutral-400 font-mono text-[10px]">
                        {script.scenario}
                      </span>
                    </div>

                    {/* Script Bubble */}
                    <div className="bg-white border border-neutral-100 rounded-lg p-3 text-xs text-neutral-700 font-sans italic relative leading-relaxed">
                      " {script.scriptText} "
                    </div>
                  </div>

                  {/* Copy Button */}
                  <div className="mt-4 pt-3 border-t border-neutral-100/60 flex justify-end">
                    <button
                      onClick={() => handleCopyText(script.scriptText, idx)}
                      className={`text-[11px] font-semibold flex items-center gap-1 px-3 py-1.5 rounded transition-all ${
                        copiedIndex === idx
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={11} />
                          복사 완료!
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          스크립트 복사
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-400 text-xs">
              이 시나리오에 추천되는 특별 스크립트가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
