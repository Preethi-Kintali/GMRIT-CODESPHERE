import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-c";
import { PROBLEMS } from "../data/problems";
import { TerminalSquareIcon } from "lucide-react";

export default function CodePlayback({ session, problemId, language = "javascript" }) {
  const problem = Object.values(PROBLEMS).find(p => p.id === Number(problemId || session?.problem?.id));
  
  const displayLanguage = session?.finalLanguage || language;
  const code = session?.finalCode || problem?.starterCode?.[displayLanguage] || "// Code not available";

  useEffect(() => {
    Prism.highlightAll();
  }, [code, displayLanguage]);

  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 h-11 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
           <TerminalSquareIcon className="size-4 text-emerald-400" />
           <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{problem?.title || session?.problem?.title || 'Session Code'}</span>
        </div>
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{displayLanguage}</span>
      </div>
      <div className="p-4 overflow-auto max-h-[500px]">
        <pre className="line-numbers text-[13px] font-mono leading-relaxed bg-transparent p-0 m-0">
          <code className={`language-${displayLanguage === 'cpp' ? 'cpp' : displayLanguage}`}>
            {code}
          </code>
        </pre>
      </div>
      <style>{`
        pre[class*="language-"] { background: transparent !important; margin: 0 !important; padding: 0 !important; }
        code[class*="language-"] { color: #d4d4d4 !important; text-shadow: none !important; }
        .token.comment { color: #6a9955 !important; }
        .token.keyword { color: #569cd6 !important; }
        .token.string { color: #ce9178 !important; }
        .token.function { color: #dcdcaa !important; }
        .token.number { color: #b5cea8 !important; }
        .token.operator { color: #d4d4d4 !important; }
      `}</style>
    </div>
  );
}
