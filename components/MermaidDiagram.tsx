import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    mermaid: any;
  }
}

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && window.mermaid) {
      window.mermaid.run({
        nodes: [ref.current],
      });
    }
  }, [chart]);

  return (
    <div className="mermaid bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto flex justify-center" ref={ref}>
      {chart}
    </div>
  );
};

export default MermaidDiagram;