import React from 'react';
import { ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split into lines to parse basic markdown structures cleanly
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];
  let inTable = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return null;
    const headerLine = tableRows[0];
    const dataLines = tableRows.slice(2); // Skip separator

    const headers = headerLine.split('|').map(s => s.trim()).filter(Boolean);

    const rendered = (
      <div key={`table-${key}`} className="overflow-x-auto my-4 rounded-xl border border-slate-700/60 bg-slate-900/60 shadow-inner">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-300 border-b border-slate-700">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-semibold">{parseInline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {dataLines.map((row, rIdx) => {
              const cells = row.split('|').map(s => s.trim()).filter(Boolean);
              return (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-300">
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
    return rendered;
  };

  const parseInline = (text: string): React.ReactNode => {
    // Links [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderBoldItalic(text.substring(lastIndex, match.index)));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-medium"
        >
          {label}
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderBoldItalic(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : renderBoldItalic(text);
  };

  const renderBoldItalic = (text: string): React.ReactNode => {
    // Bold **text**
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      // Italic *text*
      const italicParts = part.split(/(\*.*?\*)/g);
      return italicParts.map((subPart, sIdx) => {
        if (subPart.startsWith('*') && subPart.endsWith('*')) {
          return <em key={sIdx} className="italic text-slate-300">{subPart.slice(1, -1)}</em>;
        }
        // Inline code `code`
        const codeParts = subPart.split(/(`.*?`)/g);
        return codeParts.map((cPart, cIdx) => {
          if (cPart.startsWith('`') && cPart.endsWith('`')) {
            return (
              <code key={cIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-xs font-mono border border-slate-700/50">
                {cPart.slice(1, -1)}
              </code>
            );
          }
          return cPart;
        });
      });
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks ```
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-slate-900 border border-slate-800 text-indigo-200 p-4 rounded-xl my-4 text-xs font-mono overflow-x-auto">
            {codeBlockContent.join('\n')}
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Markdown Table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      const renderedTable = flushTable(i);
      if (renderedTable) elements.push(renderedTable);
    }

    // Dividers
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-800" />);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold text-white mt-6 mb-3 tracking-tight">{parseInline(line.slice(2))}</h1>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-bold text-indigo-200 mt-5 mb-2.5 tracking-tight border-b border-slate-800/80 pb-1.5">{parseInline(line.slice(3))}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-semibold text-slate-100 mt-4 mb-2">{parseInline(line.slice(4))}</h3>);
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-sm font-semibold text-indigo-300 mt-3 mb-1">{parseInline(line.slice(5))}</h4>);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-indigo-500 bg-indigo-950/20 px-4 py-2 my-3 rounded-r-lg text-slate-300 italic text-sm">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const indent = line.search(/\S/);
      const bulletText = line.trim().slice(2);
      elements.push(
        <li key={i} className={`text-slate-300 my-1 text-sm flex items-start gap-2 ${indent > 0 ? 'ml-6' : 'ml-2'}`}>
          <span className="text-indigo-400 mt-1 select-none">•</span>
          <span className="flex-1">{parseInline(bulletText)}</span>
        </li>
      );
      continue;
    }

    // Numbered List
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <li key={i} className="text-slate-300 my-1 text-sm flex items-start gap-2 ml-2">
          <span className="font-semibold text-indigo-400 text-xs min-w-4 mt-0.5">{numMatch[1]}.</span>
          <span className="flex-1">{parseInline(numMatch[2])}</span>
        </li>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="text-slate-300 leading-relaxed text-sm my-1.5">
        {parseInline(line)}
      </p>
    );
  }

  if (inTable) {
    const renderedTable = flushTable(lines.length);
    if (renderedTable) elements.push(renderedTable);
  }

  return <div className="space-y-1">{elements}</div>;
};
