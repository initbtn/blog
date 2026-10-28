export function Footer() {
  const currentYear = 2026;
  return (
    <footer className="border-t border-border mt-20 py-10 text-center text-xs text-muted">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © {currentYear} Dominic. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/initbtn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span>•</span>
          <a
            href="https://initbtn.github.io/resume-vuejs/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Resume
          </a>
          <span>•</span>
          <span className="text-muted/70">
            assist RAG Indexed
          </span>
        </div>
      </div>
    </footer>
  );
}
