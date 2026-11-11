'use client';

import { useEffect, useRef } from 'react';

export function MermaidRenderer() {
  const initializedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    async function renderMermaid() {
      // Find all code blocks with language-mermaid
      const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');
      if (mermaidBlocks.length === 0) return;

      try {
        const mermaid = (await import('mermaid')).default;
        if (!initializedRef.current) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            themeVariables: {
              darkMode: true,
              background: '#0b1120',
              mainBkg: '#0f172a',
              nodeBorder: '#38bdf8',
              lineColor: '#94a3b8',
              textColor: '#f8fafc',
            },
          });
          initializedRef.current = true;
        }

        for (let i = 0; i < mermaidBlocks.length; i++) {
          if (isCancelled) break;
          const codeEl = mermaidBlocks[i] as HTMLElement;
          const preEl = codeEl.closest('pre');
          if (!preEl || preEl.dataset.mermaidRendered === 'true') continue;

          const text = codeEl.textContent || '';
          const id = `mermaid-diagram-${Date.now()}-${i}`;

          try {
            const { svg } = await mermaid.render(id, text);
            if (isCancelled) break;

            const container = document.createElement('div');
            container.className =
              'mermaid-container my-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-center overflow-x-auto shadow-lg';
            container.innerHTML = svg;

            preEl.replaceWith(container);
            container.dataset.mermaidRendered = 'true';
          } catch (err) {
            console.error('Mermaid render error for block:', err);
            // Fallback: leave code block intact
            preEl.dataset.mermaidRendered = 'error';
          }
        }
      } catch (e) {
        console.error('Failed to load mermaid dynamic import', e);
      }
    }

    renderMermaid();

    return () => {
      isCancelled = true;
    };
  }, []);

  return null;
}
