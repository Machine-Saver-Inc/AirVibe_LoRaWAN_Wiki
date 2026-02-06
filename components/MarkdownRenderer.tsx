import React from 'react';

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, className = "" }) => {
  const renderInline = (line: string): React.ReactNode[] => {
    // Handle bold (**text**) and italic (*text*) inline
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*(?!\s)(.*?)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      if (match[0].startsWith('**') && match[0].endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900">
            {match[0].slice(2, -2)}
          </strong>
        );
      } else {
        parts.push(
          <em key={match.index}>{match[0].slice(1, -1)}</em>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [line];
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (line === '') {
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-slate-900 mt-5 mb-2">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-2">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Bullet lists (-, *, •)
    if (/^[-*•]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length) {
        const bullet = lines[i].trim();
        if (/^[-*•]\s/.test(bullet)) {
          items.push(
            <li key={i} className="ml-4">{renderInline(bullet.replace(/^[-*•]\s+/, ''))}</li>
          );
          i++;
        } else if (bullet === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2 text-slate-700">
          {items}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length) {
        const numbered = lines[i].trim();
        if (/^\d+\.\s/.test(numbered)) {
          items.push(
            <li key={i} className="ml-4">{renderInline(numbered.replace(/^\d+\.\s+/, ''))}</li>
          );
          i++;
        } else if (numbered === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-2 text-slate-700">
          {items}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="my-2 text-slate-700 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className={className}>{elements}</div>;
};

export default MarkdownRenderer;
