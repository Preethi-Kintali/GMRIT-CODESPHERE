import { Code2Icon, LoaderIcon, PlusIcon, XIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">New Session</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* PROBLEM SELECTION */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 flex items-center gap-1">
              Select Problem <span className="text-red-400">*</span>
            </label>

            <select
              className="w-full bg-[#2d2d2d] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
              value={roomConfig.problem}
              onChange={(e) => {
                const selectedProblem = problems.find((p) => p.title === e.target.value);
                setRoomConfig({
                  difficulty: selectedProblem.difficulty,
                  problem: e.target.value,
                });
              }}
            >
              <option value="" disabled className="text-neutral-500">
                Choose a coding problem...
              </option>

              {problems.map((problem) => (
                <option key={problem.id} value={problem.title} className="bg-[#1e1e1e] text-neutral-300">
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* ROOM SUMMARY */}
          {roomConfig.problem && (
            <div className="p-4 rounded-xl border border-white/5 bg-[#2d2d2d]/50">
              <div className="flex items-start gap-3">
                <Code2Icon className="size-5 text-neutral-400 mt-0.5" />
                <div className="space-y-1 w-full">
                  <p className="text-sm font-medium text-white mb-2">Room Details</p>

                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Problem</span>
                    <span className="text-neutral-300 font-medium truncate max-w-[200px]">{roomConfig.problem}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Participants</span>
                    <span className="text-neutral-300 font-medium">1-on-1 (Max 2)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/10 bg-[#1e1e1e] flex justify-end gap-3 rounded-b-2xl">
          <button
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.problem}
          >
            {isCreating ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}

            {isCreating ? "Creating..." : "Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default CreateSessionModal;
