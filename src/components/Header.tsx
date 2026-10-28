import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, User, FileText } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';

export function Header() {
  return (
    <header className="sticky top-4 z-40 max-w-4xl mx-auto px-4 w-full">
      <div className="glass-panel rounded-full px-4 sm:px-6 h-14 flex items-center justify-between shadow-lg shadow-black/25">
        {/* Brand / Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
        >
          <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-sky-500/50 shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform bg-slate-900 flex items-center justify-center shrink-0">
            <Image 
              src="/avatar.png" 
              alt="Waffle Keycap Avatar" 
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

        {/* Desktop Navigation (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link href="/" className="hover:text-slate-100 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>아티클</span>
          </Link>
          <Link href="/about" className="hover:text-slate-100 transition-colors flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-400" />
            <span>소개</span>
          </Link>
          <a 
            href="https://initbtn.github.io/resume-vuejs/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-sky-400 transition-colors flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            <span>이력서 ↗</span>
          </a>
          <a 
            href="https://github.com/initbtn" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:border-slate-500 transition-colors text-xs"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Mobile Header Right Simple Link */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="https://github.com/initbtn"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
