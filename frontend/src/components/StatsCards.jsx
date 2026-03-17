import { ActivityIcon, FolderIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      {/* Active Count */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#1e1e1e] hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <ActivityIcon className="size-5 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            Live
          </div>
        </div>
        <div className="text-3xl font-semibold text-white mb-1">{activeSessionsCount}</div>
        <div className="text-sm text-neutral-500 font-medium tracking-wide">Active Sessions</div>
      </div>

      {/* Recent Count */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#1e1e1e] hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <FolderIcon className="size-5 text-white" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-white mb-1">{recentSessionsCount}</div>
        <div className="text-sm text-neutral-500 font-medium">Total Sessions</div>
      </div>
    </div>
  );
}

export default StatsCards;
