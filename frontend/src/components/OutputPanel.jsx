import { TerminalIcon } from "lucide-react";

function OutputPanel({ output }) {
  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 px-4 h-12 bg-[#2d2d2d] border-b border-white/10 shrink-0">
        <TerminalIcon className="size-4 text-neutral-400" />
        <span className="text-xs font-semibold text-neutral-300">Console Output</span>
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {output === null ? (
          <div className="flex items-center justify-center p-6 text-neutral-500 text-sm">
            Run your code to see the output here...
          </div>
        ) : output.success ? (
          <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap">{output.output}</pre>
        ) : (
          <div>
            {output.output && (
              <pre className="text-sm font-mono text-neutral-400 whitespace-pre-wrap mb-3 border-b border-white/10 pb-3">
                {output.output}
              </pre>
            )}
            <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap">{output.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
