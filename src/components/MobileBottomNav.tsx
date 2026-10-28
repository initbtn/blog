'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, User, FileText } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: '아티클',
      href: '/',
      icon: BookOpen,
      isActive: pathname === '/' || pathname.startsWith('/posts'),
      isExternal: false,
    },
    {
      name: '소개',
      href: '/about',
      icon: User,
      isActive: pathname === '/about',
      isExternal: false,
    },
    {
      name: '이력서',
      href: 'https://initbtn.github.io/resume-vuejs/',
      icon: FileText,
      isActive: false,
      isExternal: true,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/initbtn',
      icon: GithubIcon,
      isActive: false,
      isExternal: true,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/90 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isExternal) {
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium tracking-tight flex items-center">
                  {item.name} <span className="text-[8px] ml-0.5 opacity-60">↗</span>
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                item.isActive
                  ? 'text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 transition-transform ${item.isActive ? 'scale-110' : ''}`} />
                {item.isActive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
