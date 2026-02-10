import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

// Configure marked for consistent output
marked.use({
  breaks: false,
  gfm: true,
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, className = "" }) => {
  const html = useMemo(() => marked.parse(text, { async: false }) as string, [text]);

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownRenderer;
