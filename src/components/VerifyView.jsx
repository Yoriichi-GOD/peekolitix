import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './VerifyView.css';

const VerifyView = ({ markdownContent }) => {
  const { verdict, verdictClass, verdictIcon, cleanMarkdown } = useMemo(() => {
    let clean = markdownContent;
    let v = null;
    let cls = 'unverifiable';
    let icon = '?';

    // Remove hidden JSON block
    clean = clean.replace(/```json\s*[\s\S]*?\s*```/, '');

    // Detect verdict from content
    const upper = markdownContent.toUpperCase();
    if (upper.includes('PARTIALLY TRUE')) {
      v = 'PARTIALLY TRUE'; cls = 'partial'; icon = '\u25E6';
    } else if (upper.includes('MISLEADING')) {
      v = 'MISLEADING'; cls = 'misleading'; icon = '\u26A0\uFE0F';
    } else if (upper.includes('UNVERIFIABLE')) {
      v = 'UNVERIFIABLE'; cls = 'unverifiable'; icon = '?';
    } else if (/\bTRUE\b/.test(upper) && !upper.includes('FALSE') && !upper.includes('PARTIALLY')) {
      v = 'TRUE'; cls = 'true'; icon = '\u2705';
    } else if (upper.includes('FALSE')) {
      v = 'FALSE'; cls = 'false'; icon = '\u274C';
    }

    return { verdict: v, verdictClass: cls, verdictIcon: icon, cleanMarkdown: clean };
  }, [markdownContent]);

  return (
    <div className="verify-view">
      {verdict && (
        <div className={`verdict-banner ${verdictClass}`}>
          <span className="verdict-icon">{verdictIcon}</span>
          VERDICT: {verdict}
        </div>
      )}

      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, href, children, ...props }) => {
              if (href === '#confidence-high') return <span className="conf-high">{children}</span>;
              if (href === '#confidence-medium') return <span className="conf-medium">{children}</span>;
              if (href === '#confidence-low') return <span className="conf-low">{children}</span>;
              return <a href={href} {...props}>{children}</a>;
            }
          }}
        >
          {cleanMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default VerifyView;
