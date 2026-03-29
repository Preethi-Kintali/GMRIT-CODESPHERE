import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "../api/problems";
import { ChevronRightIcon, Code2Icon, CheckCircle2Icon, CircleDotIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["published-problems"],
    queryFn: problemsApi.getPublishedProblems,
  });

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  if (isLoading) {
     return (
        <div className="min-h-screen bg-black">
           <Navbar />
           <div className="flex items-center justify-center p-20">
              <Loader2Icon className="size-10 text-emerald-500 animate-spin" />
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-300 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Practice Problems</h1>
          <p className="text-neutral-400">
            Sharpen your coding skills with these curated scenarios.
          </p>
        </div>

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {problems.map((problem) => (
            <Link
              key={problem._id}
              to={`/problem/${problem.slug}`}
              className="block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                {/* LEFT SIDE */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="size-10 shrink-0 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                      <Code2Icon className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h2 className="text-lg font-medium text-white truncate">{problem.title}</h2>
                        <span className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full ${getDifficultyBadgeClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">
                        {Array.isArray(problem.category) ? problem.category.join(", ") : problem.category}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-400 line-clamp-2 pl-14">
                    {problem.description?.text}
                  </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-2 pl-14 sm:pl-0 shrink-0">
                  <span className="text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
                    Solve it
                  </span>
                  <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white text-neutral-400 group-hover:text-black transition-colors">
                    <ChevronRightIcon className="size-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
            <div className="text-sm text-neutral-500 mb-2 font-medium">Total Problems</div>
            <div className="text-3xl font-semibold text-white">{problems.length}</div>
          </div>

          <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02]">
            <div className="flex items-center gap-2 text-sm text-emerald-400/80 mb-2 font-medium">
              <CheckCircle2Icon className="size-4" /> Easy
            </div>
            <div className="text-3xl font-semibold text-emerald-400">{easyProblemsCount}</div>
          </div>

          <div className="p-6 rounded-2xl border border-amber-500/10 bg-amber-500/[0.02]">
            <div className="flex items-center gap-2 text-sm text-amber-400/80 mb-2 font-medium">
              <CircleDotIcon className="size-4" /> Medium
            </div>
            <div className="text-3xl font-semibold text-amber-400">{mediumProblemsCount}</div>
          </div>

          <div className="p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.02]">
            <div className="flex items-center gap-2 text-sm text-red-400/80 mb-2 font-medium">
              <AlertCircleIcon className="size-4" /> Hard
            </div>
            <div className="text-3xl font-semibold text-red-400">{hardProblemsCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;
