import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import './ReportView.css';

const ReportView = ({ markdownContent }) => {
  // Extract JSON chart data if it exists
  const { cleanMarkdown, chartData } = useMemo(() => {
    let clean = markdownContent;
    let data = null;
    
    // Look for ```json {...} ``` blocks
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = markdownContent.match(jsonRegex);
    
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.chartData) {
          data = parsed.chartData;
          clean = markdownContent.replace(jsonRegex, ''); // Remove JSON from markdown
        }
      } catch (err) {
        console.error("Failed to parse chart JSON from Gemini output:", err);
      }
    }
    
    return { cleanMarkdown: clean, chartData: data };
  }, [markdownContent]);

  return (
    <div className="report-view">
      {chartData && chartData.length > 0 && (
        <div className="chart-container glass-panel">
          <h4 className="chart-title">DATA VISUALIZATION</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }} />
              {Object.keys(chartData[0]).filter(k => k !== 'name').map((key, idx) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={idx === 0 ? 'var(--chart-color-1)' : idx === 1 ? 'var(--chart-color-2)' : 'var(--status-neutral)'} 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="markdown-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({node, href, children, ...props}) => {
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

export default ReportView;
