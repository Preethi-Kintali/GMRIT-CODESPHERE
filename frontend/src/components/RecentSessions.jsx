import { useState } from "react";
import { Code2Icon, Clock, Users, LoaderIcon, HistoryIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

function RecentSessions({ sessions, isLoading }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSessions = sessions?.filter((session) => {
    if (statusFilter === "all") return true;
    return session.status === statusFilter;
  }) || [];

  return (
    <div className="mt-8 p-6 rounded-xl border border-white/10 bg-[#1e1e1e]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
            <HistoryIcon className="size-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Past Sessions</h2>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider hidden sm:block">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-white/20 focus:border-white/20 block p-2 custom-scrollbar outline-none"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-white/5 bg-black/40 flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  <div className="size-10 rounded-lg bg-white/5 animate-pulse shrink-0"></div>
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded-md"></div>
                    <div className="h-3 w-1/3 bg-white/5 animate-pulse rounded-md"></div>
                  </div>
                </div>
                <div className="space-y-2.5 mb-5 pl-14">
                  <div className="h-3 w-1/2 bg-white/5 animate-pulse rounded-md"></div>
                  <div className="h-3 w-1/3 bg-white/5 animate-pulse rounded-md"></div>
                </div>
                <div className="pt-4 border-t border-white/5 mt-auto flex justify-between items-center">
                  <div className="h-3 w-12 bg-white/5 animate-pulse rounded-md"></div>
                  <div className="h-3 w-20 bg-white/5 animate-pulse rounded-md"></div>
                </div>
              </div>
            ))}
          </>
        ) : filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div
              key={session._id}
              className={`relative p-5 rounded-xl border transition-colors group ${session.status === "active"
                ? "border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/40"
                : "border-white/5 bg-black/40 hover:bg-white/[0.04]"
                }`}
            >
              {session.status === "active" && (
                <div className="absolute top-4 right-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                    <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    ACTIVE
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 mb-5">
                <div
                  className={`size-10 rounded-lg border flex items-center justify-center shrink-0 ${session.status === "active"
                    ? "bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors"
                    : "bg-white/5 border-white/10 group-hover:border-white/20 transition-colors"
                    }`}
                >
                  <Code2Icon className={`size-4 ${session.status === "active" ? "text-emerald-400" : "text-neutral-400 group-hover:text-white"}`} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-medium text-white text-sm truncate mb-2">{session.problem?.title}</h3>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getDifficultyBadgeClass(
                      session.problem?.difficulty || 'easy'
                    )}`}
                  >
                    {session.problem?.difficulty || 'easy'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-500 mb-5 pl-14">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5" />
                  <span>
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-3.5" />
                  <span>2 participants</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Date</span>
                <span className="text-[10px] text-neutral-400">
                  {new Date(session.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-16 border border-dashed border-white/10 rounded-xl bg-black/20">
            <HistoryIcon className="size-8 text-neutral-600 mb-4" />
            <p className="text-sm font-medium text-neutral-300 mb-1">No sessions yet</p>
            <p className="text-xs text-neutral-500">Your past coding sessions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentSessions;
