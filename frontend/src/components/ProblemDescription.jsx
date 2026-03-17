import { getDifficultyBadgeClass } from "../lib/utils";
import { BookTextIcon, Code2Icon, FileTextIcon, ListTodoIcon, ChevronDownIcon } from "lucide-react";

function ProblemDescription({ problem, currentProblemId, onProblemChange, allProblems }) {
  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] flex flex-col rounded-xl border border-white/10 custom-scrollbar">
      {/* HEADER TABS & SELECTOR */}
      <div className="flex items-center justify-between px-4 h-12 bg-[#2d2d2d] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-md border border-white/5">
          <BookTextIcon className="size-4 text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-300">Description</span>
        </div>

        <div className="relative group">
          <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">
            <ListTodoIcon className="size-4 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-300">Problems List</span>
            <ChevronDownIcon className="size-3 text-neutral-500" />
          </div>

          <div className="absolute top-full right-0 mt-2 w-64 bg-[#2d2d2d] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {allProblems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onProblemChange(p.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${currentProblemId === p.id ? "bg-white/[0.03]" : ""}`}
                >
                  <span className={`text-sm ${currentProblemId === p.id ? "text-white font-medium" : "text-neutral-300"}`}>{p.title}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getDifficultyBadgeClass(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 pb-10">
        {/* TITLE & META */}
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-4">{problem.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getDifficultyBadgeClass(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="text-xs text-neutral-500 font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              {problem.category}
            </span>
          </div>
        </div>

        {/* PROBLEM DESC */}
        <div className="space-y-4 text-[14px] leading-relaxed text-neutral-300">
          <p>{problem.description.text}</p>
          {problem.description.notes.map((note, idx) => (
            <p key={idx}>{note}</p>
          ))}
        </div>

        {/* EXAMPLES SECTION */}
        <div className="space-y-6 pt-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileTextIcon className="size-4 text-emerald-400" />
            Examples
          </h2>

          <div className="space-y-6">
            {problem.examples.map((example, idx) => (
              <div key={idx} className="space-y-3">
                <p className="font-medium text-[13px] text-neutral-400">Example {idx + 1}:</p>
                <div className="bg-[#2d2d2d] border border-white/10 rounded-lg p-4 font-mono text-[13px] space-y-2 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/30 group-hover:bg-emerald-500/50 transition-colors" />

                  <div className="flex items-start gap-4">
                    <span className="text-neutral-500 font-semibold w-16 shrink-0">Input:</span>
                    <span className="text-neutral-300">{example.input}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-neutral-500 font-semibold w-16 shrink-0">Output:</span>
                    <span className="text-emerald-400">{example.output}</span>
                  </div>

                  {example.explanation && (
                    <div className="pt-3 mt-3 border-t border-white/5">
                      <div className="flex items-start gap-4">
                        <span className="text-neutral-500 font-semibold w-16 shrink-0">Explain:</span>
                        <span className="text-neutral-400 font-sans tracking-wide leading-relaxed">{example.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONSTRAINTS */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Code2Icon className="size-4 text-emerald-400" />
            Constraints
          </h2>
          <ul className="space-y-2">
            {problem.constraints.map((constraint, idx) => (
              <li key={idx} className="flex items-center gap-3 text-[13px]">
                <div className="size-1.5 rounded-full bg-neutral-600" />
                <code className="text-emerald-400/90 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{constraint}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProblemDescription;
