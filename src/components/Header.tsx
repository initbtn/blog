import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-5 z-50 max-w-4xl mx-auto px-4 w-full">
      <div className="glass-panel rounded-full px-5 h-14 flex items-center justify-between shadow-lg shadow-black/20">
        {/* Brand / Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform bg-slate-900 flex items-center justify-center">
            <Image 
              src="/avatar.png" 
              alt="Avatar" 
              width={32} 
              height={32}
              className="object-cover"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-slate-100 group-hover:text-sky-400 transition-colors">
              domlog
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              @initbtn
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-400">
          <Link href="/" className="hover:text-slate-100 transition-colors">
            아티클
          </Link>
          <Link href="/about" className="hover:text-slate-100 transition-colors">
            소개
          </Link>
          <a 
            href="https://initbtn.github.io/resume-vuejs/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hidden sm:inline-flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
          >
            <span>이력서</span>
            <span className="text-xs">↗</span>
          </a>
          <a 
            href="https://github.com/initbtn" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:border-slate-500 transition-colors text-xs"
          >
            <span>GitHub</span>
            <span className="text-[10px] text-slate-400">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
