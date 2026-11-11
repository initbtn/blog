import React from 'react';

interface FormattedQuestionProps {
  questionIndex: number;
  rawText: string;
}

export function FormattedQuestion({ questionIndex, rawText }: FormattedQuestionProps) {
  // 1. Detect if question contains example bullets (○, ㄱ., ㄴ., 가., 나., etc.)
  const hasCircleBullets = rawText.includes('○');
  const hasKoreanBullets = /(?:^|\s)[ㄱ-ㅎ가-힣]\.\s+/.test(rawText);

  if (hasCircleBullets) {
    // Split stem and circle bullet items
    const parts = rawText.split(/\s*○\s*/);
    const stem = parts[0].trim();
    const items = parts.slice(1).map((p) => p.trim()).filter(Boolean);

    return (
      <div className="space-y-3">
        <div className="text-slate-100 font-medium text-sm sm:text-base leading-relaxed">
          <span className="text-sky-400 font-bold mr-1.5">Q{questionIndex}.</span>
          {stem}
        </div>

        {items.length > 0 && (
          <div className="rounded-xl p-3.5 sm:p-4 bg-slate-900/90 border border-slate-800/90 shadow-inner space-y-2">
            <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>&lt;보 기&gt;</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (hasKoreanBullets) {
    // Split by ㄱ., ㄴ., ㄷ., ㄹ. or 가., 나., 다., 라.
    const bulletRegex = /(?:^|\s)([ㄱ-ㅎ가-힣]\.\s+)/;
    const splitParts = rawText.split(bulletRegex);
    const stem = splitParts[0].trim();

    const items: { label: string; text: string }[] = [];
    for (let i = 1; i < splitParts.length; i += 2) {
      const label = splitParts[i].trim();
      const text = splitParts[i + 1] ? splitParts[i + 1].trim() : '';
      items.push({ label, text });
    }

    return (
      <div className="space-y-3">
        <div className="text-slate-100 font-medium text-sm sm:text-base leading-relaxed">
          <span className="text-sky-400 font-bold mr-1.5">Q{questionIndex}.</span>
          {stem}
        </div>

        {items.length > 0 && (
          <div className="rounded-xl p-3.5 sm:p-4 bg-slate-900/90 border border-slate-800/90 shadow-inner space-y-2">
            <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>&lt;보 기&gt;</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold shrink-0 font-mono">{item.label}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 2. Default standard question stem
  return (
    <div className="text-slate-100 font-medium text-sm sm:text-base leading-relaxed min-h-[3rem]">
      <span className="text-sky-400 font-bold mr-1.5">Q{questionIndex}.</span>
      {rawText}
    </div>
  );
}
