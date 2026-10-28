import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, User, FileText, Mail } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';
import { HeaderActions } from './HeaderActions';

export function Header() {
  return (
    <header className="relative z-40 max-w-4xl mx-auto px-4 w-full pt-6">
      <div className="glass-panel rounded-2xl sm:rounded-full px-4 sm:px-6 h-14 flex items-center justify-between shadow-lg shadow-black/25">
        {/* Brand / Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group shrink-0"
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
            <span className="text-[11px] font-mono text-slate-400 hidden xs:inline">
              @initbtn
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
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

          <div className="h-4 w-px bg-slate-800" />

          {/* Social & Direct Contact */}
          <div className="flex items-center gap-2">
            <a 
              href="mailto:min2spapa@gmail.com"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:border-amber-400/60 hover:text-amber-300 transition-colors text-xs"
              title="이메일 문의"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email</span>
            </a>
            <a 
              href="https://github.com/initbtn" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:border-sky-500/60 hover:text-sky-300 transition-colors text-xs"
              title="GitHub 프로필"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </nav>

        {/* Header Right Actions: Subscribe & Share */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <HeaderActions />

          {/* Mobile direct icons (Email, GitHub) */}
          <div className="flex md:hidden items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-0.5">
            <a
              href="mailto:min2spapa@gmail.com"
              className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 transition-colors"
              aria-label="이메일 문의"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/initbtn"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="GitHub Profile"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
