import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './CompareView.css';

const CompareView = ({ markdownContent }) => {
  const { entities, cleanMarkdown } = useMemo(() => {
    let clean = markdownContent;

    // Remove hidden JSON block
    clean = clean.replace(/```json\s*[\s\S]*?\s*```/, '');

    // Try to extract entity names from the table header or "VERSUS OVERVIEW"
    let entityA = null;
    let entityB = null;

    // Look for table headers like | Metric | Modi | Rahul | Edge |
    const tableHeaderMatch = clean.match(/\|[^|]+\|([^|]+)\|([^|]+)\|[^|]*\|/);
    if (tableHeaderMatch) {
      const a = tableHeaderMatch[1].trim();
      const b = tableHeaderMatch[2].trim();
      if (a !== 'Entity A' && a.length < 40) entityA = a;
      if (b !== 'Entity B' && b.length < 40) entityB = b;
    }

    return { entities: { a: entityA, b: entityB }, cleanMarkdown: clean };
  }, [markdownContent]);

  return (
    <div className="compare-view">
      {entities.a && entities.b && (
        <div className="compare-header">
          <span className="compare-entity">{entities.a}</span>
          <span className="compare-vs">VS</span>
          <span className="compare-entity">{entities.b}</span>
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

export default CompareView;
