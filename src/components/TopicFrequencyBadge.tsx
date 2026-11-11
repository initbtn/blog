import { Flame, Zap, Target } from 'lucide-react';

interface TopicFrequencyBadgeProps {
  slug: string;
}

// Module frequency metadata mapping based on collected dataset statistics
const MODULE_STATS: Record<string, { label: string; count: number; tier: 'critical' | 'core' | 'calc' }> = {
  '1': { label: 'CRITICAL', count: 123, tier: 'critical' },
  '2': { label: 'CORE', count: 43, tier: 'core' },
  '3': { label: 'CRITICAL', count: 83, tier: 'critical' },
  '4': { label: 'CRITICAL', count: 102, tier: 'critical' },
  '5': { label: 'CALC', count: 17, tier: 'calc' },
  '6': { label: 'CORE', count: 27, tier: 'core' },
  '7': { label: 'CORE', count: 21, tier: 'core' },
  '8': { label: 'CALC', count: 11, tier: 'calc' },
};

export function TopicFrequencyBadge({ slug }: TopicFrequencyBadgeProps) {
  // Extract module number from slug e.g. ncs-swe-1-1 or ncs-swe-module-1
  const match = slug.match(/ncs-swe-(?:module-)?(\d+)/);
  if (!match) return null;

  const modNum = match[1];
  const stat = MODULE_STATS[modNum];
  if (!stat) return null;

  if (stat.tier === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 whitespace-nowrap">
        <Flame className="w-3 h-3 text-rose-400 shrink-0" />
        <span>{stat.label}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 font-normal">{stat.count} Qs</span>
      </span>
    );
  }

  if (stat.tier === 'core') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 whitespace-nowrap">
        <Zap className="w-3 h-3 text-sky-400 shrink-0" />
        <span>{stat.label}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 font-normal">{stat.count} Qs</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
      <Target className="w-3 h-3 text-emerald-400 shrink-0" />
      <span>{stat.label}</span>
      <span className="text-slate-600">/</span>
      <span className="text-slate-400 font-normal">{stat.count} Qs</span>
    </span>
  );
}
