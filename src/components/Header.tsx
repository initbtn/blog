import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border transition-colors">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-lg font-semibold tracking-tight hover:text-sky-500 transition-colors flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block animate-pulse" />
          <span>dominic.log</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            아티클
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            소개
          </Link>
          <a 
            href="https://initbtn.github.io/resume-vuejs/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-foreground transition-colors"
          >
            이력서 ↗
          </a>
          <a 
            href="https://github.com/initbtn" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-foreground transition-colors"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
