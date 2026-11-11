import { Award, Zap, CheckCircle2, Bookmark, Flame } from 'lucide-react';

interface TopicFrequencyBadgeProps {
  slug: string;
}

type GradeType = 'GRADE A+' | 'GRADE A' | 'GRADE B' | 'GRADE C' | 'GRADE D';

interface StatItem {
  grade: GradeType;
  count: number;
  percent: string;
}

// 14개 세부 유형별 실측 기출 비중 (총 427문항 기준)
// Grade 기준: A+ (>=15%), A (>=10%), B (>=5%), C (>=3%), D (<3%)
const SUBTOPIC_STATS: Record<string, StatItem> = {
  '1-1': { grade: 'GRADE A+', count: 66, percent: '15.5%' },
  '1-2': { grade: 'GRADE A', count: 52, percent: '12.2%' },
  '2-1': { grade: 'GRADE B', count: 24, percent: '5.6%' },
  '2-2': { grade: 'GRADE C', count: 19, percent: '4.4%' },
  '3-1': { grade: 'GRADE A', count: 53, percent: '12.4%' },
  '3-2': { grade: 'GRADE D', count: 3, percent: '0.7%' },
  '3-3': { grade: 'GRADE C', count: 21, percent: '4.9%' },
  '4-1': { grade: 'GRADE A+', count: 95, percent: '22.2%' },
  '4-2': { grade: 'GRADE C', count: 15, percent: '3.5%' },
  '5-1': { grade: 'GRADE D', count: 7, percent: '1.6%' },
  '5-2': { grade: 'GRADE D', count: 11, percent: '2.6%' },
  '6-1': { grade: 'GRADE B', count: 30, percent: '7.0%' },
  '7-1': { grade: 'GRADE C', count: 21, percent: '4.9%' },
  '8-1': { grade: 'GRADE D', count: 10, percent: '2.3%' },
};

// 모듈 단위(통합 아티클) 대비 폴백
const MODULE_STATS: Record<string, StatItem> = {
  '1': { grade: 'GRADE A', count: 118, percent: '27.6%' },
  '2': { grade: 'GRADE B', count: 43, percent: '10.1%' },
  '3': { grade: 'GRADE B', count: 77, percent: '18.0%' },
  '4': { grade: 'GRADE A', count: 110, percent: '25.8%' },
  '5': { grade: 'GRADE D', count: 18, percent: '4.2%' },
  '6': { grade: 'GRADE C', count: 30, percent: '7.0%' },
  '7': { grade: 'GRADE D', count: 21, percent: '4.9%' },
  '8': { grade: 'GRADE D', count: 10, percent: '2.3%' },
};

export function TopicFrequencyBadge({ slug }: TopicFrequencyBadgeProps) {
  // 1. Try matching subtopic first (e.g. ncs-swe-1-1-traditional-sdlc...)
  const subtopicMatch = slug.match(/ncs-swe-(\d+)-(\d+)/);
  let stat: StatItem | undefined;

  if (subtopicMatch) {
    const subKey = `${subtopicMatch[1]}-${subtopicMatch[2]}`;
    stat = SUBTOPIC_STATS[subKey];
  }

  // 2. Fallback to module-level matching (e.g. ncs-swe-module-1...)
  if (!stat) {
    const moduleMatch = slug.match(/ncs-swe-(?:module-)?(\d+)/);
    if (moduleMatch) {
      stat = MODULE_STATS[moduleMatch[1]];
    }
  }

  if (!stat) return null;

  if (stat.grade === 'GRADE A+') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 whitespace-nowrap shadow-sm">
        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-400/20" />
        <span className="font-extrabold text-rose-300">{stat.grade}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 font-normal">{stat.count} Qs</span>
        <span className="text-rose-400 font-bold">({stat.percent})</span>
      </span>
    );
  }

  if (stat.grade === 'GRADE A') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25 whitespace-nowrap shadow-sm">
        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-bold">{stat.grade}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-normal">{stat.count} Qs</span>
        <span className="text-amber-400/80 font-semibold">({stat.percent})</span>
      </span>
    );
  }

  if (stat.grade === 'GRADE B') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 whitespace-nowrap">
        <Zap className="w-3 h-3 text-sky-400 shrink-0" />
        <span className="font-bold">{stat.grade}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-normal">{stat.count} Qs</span>
        <span className="text-sky-400/80 font-semibold">({stat.percent})</span>
      </span>
    );
  }

  if (stat.grade === 'GRADE C') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
        <span className="font-bold">{stat.grade}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-normal">{stat.count} Qs</span>
        <span className="text-emerald-400/80 font-semibold">({stat.percent})</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 whitespace-nowrap">
      <Bookmark className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="font-semibold text-slate-200">{stat.grade}</span>
      <span className="text-slate-600">/</span>
      <span className="text-slate-400 font-normal">{stat.count} Qs</span>
      <span className="text-slate-400 font-medium">({stat.percent})</span>
    </span>
  );
}
