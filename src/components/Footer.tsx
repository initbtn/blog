import Link from 'next/link';

export function Footer() {
  const currentYear = 2026;
  return (
    <footer className="border-t border-slate-800/80 mt-20 py-10 text-xs text-slate-500 relative z-10">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>© {currentYear} <strong>domlog</strong>. Crafted by Dominic.</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-amber-500/80 text-[11px]">code: waffle</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <a
            href="https://github.com/initbtn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition-colors"
          >
            GitHub
          </a>
          <span>•</span>
          <a
            href="https://initbtn.github.io/resume-vuejs/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition-colors"
          >
            Resume
          </a>
          <span>•</span>
          <Link
            href="/sitemap.xml"
            className="hover:text-slate-200 transition-colors font-mono"
          >
            sitemap
          </Link>
          <span>•</span>
          <span className="text-sky-400/80 font-mono text-[11px]">
            assist RAG
          </span>
        </div>
      </div>
    </footer>
  );
}
