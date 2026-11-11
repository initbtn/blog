import { Award, Zap, CheckCircle2, Bookmark } from 'lucide-react';

interface TopicFrequencyBadgeProps {
  slug: string;
}

// Module frequency metadata mapping based on collected dataset statistics (427 total questions)
// Grade Standard: Grade A (>=20%), Grade B (>=10%), Grade C (>=5%), Grade D (<5%)
const MODULE_STATS: Record<
  string,
  {
    grade: 'GRADE A' | 'GRADE B' | 'GRADE C' | 'GRADE D';
    count: number;
    percent: string;
  }
> = {
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
  // Extract module number from slug e.g. ncs-swe-1-1 or ncs-swe-module-1
  const match = slug.match(/ncs-swe-(?:module-)?(\d+)/);
  if (!match) return null;

  const modNum = match[1];
  const stat = MODULE_STATS[modNum];
  if (!stat) return null;

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
