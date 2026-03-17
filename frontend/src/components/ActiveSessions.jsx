import {
  ArrowRightIcon,
  Code2Icon,
  CrownIcon,
  UsersIcon,
  ActivityIcon,
  LoaderIcon,
  TerminalSquareIcon
} from "lucide-react";
import { Link } from "react-router";
import { getDifficultyBadgeClass } from "../lib/utils";

function ActiveSessions({ sessions, isLoading, isUserInSession }) {
  return (
    <div className="lg:col-span-2 p-6 rounded-xl border border-white/10 bg-[#1e1e1e] flex flex-col h-full">
      {/* HEADERS SECTION */}
      <div className="flex items-center justify-between mb-8">
        {/* TITLE AND ICON */}
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
            <ActivityIcon className="size-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Live Sessions</h2>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300">
          <div className="size-1.5 bg-emerald-400 rounded-full" />
          {sessions.length} active
        </div>
      </div>

      {/* SESSIONS LIST */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-neutral-500">
            <LoaderIcon className="size-6 animate-spin" />
          </div>
        ) : sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session._id}
              className="p-5 rounded-xl border border-white/5 bg-black/40 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative size-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                    <Code2Icon className="size-5 text-neutral-400 group-hover:text-white transition-colors" />
                    <div className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-black" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-medium text-white text-base truncate">{session.problem}</h3>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getDifficultyBadgeClass(
                          session.difficulty
                        )}`}
                      >
                        {session.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <CrownIcon className="size-3.5" />
                        <span className="font-medium text-neutral-400">{session.host?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="size-3.5" />
                        <span>{session.participant ? "2/2" : "1/2"}</span>
                      </div>
                      {session.participant && !isUserInSession(session) ? (
                        <span className="text-[10px] font-semibold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Full</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Open</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE BTN */}
                {session.participant && !isUserInSession(session) ? (
                  <button className="px-4 py-2 text-xs font-medium rounded-md bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5 shrink-0">
                    Room Full
                  </button>
                ) : (
                  <Link
                    to={`/session/${session._id}`}
                    className="px-4 py-2 text-xs font-medium rounded-md bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shrink-0"
                  >
                    {isUserInSession(session) ? "Rejoin" : "Join"}
                    <ArrowRightIcon className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="size-12 mb-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
              <TerminalSquareIcon className="size-5 text-neutral-500" />
            </div>
            <p className="text-sm font-medium text-neutral-300 mb-1">No active sessions</p>
            <p className="text-xs text-neutral-500">Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ActiveSessions;
