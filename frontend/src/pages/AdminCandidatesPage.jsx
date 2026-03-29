import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { UserPlus, Users, LoaderIcon, ActivityIcon, TerminalSquareIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCandidatesPage() {
  const queryClient = useQueryClient();

  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["admin-candidates"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/candidates");
      return res.data;
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (email) => axiosInstance.post("/admin/interviewers", { email }),
    onSuccess: () => {
      toast.success("User promoted to Interviewer!");
      queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-interviewers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to promote user");
    },
  });

  const handlePromote = (email) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Promote <span className="text-blue-400 font-bold">{email}</span> to an Interviewer?</p>
        <div className="flex justify-end gap-2 text-xs">
          <button 
            className="btn btn-xs btn-ghost text-neutral-400"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-xs bg-blue-500 hover:bg-blue-600 border-none text-white"
            onClick={() => {
              promoteMutation.mutate(email);
              toast.dismiss(t.id);
            }}
          >
            Yes, Promote
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-right",
      style: {
        background: "#1e1e1e",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "16px",
        borderRadius: "12px",
        minWidth: "300px"
      }
    });
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-7xl">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
              <Users className="size-4 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Candidates
            </h1>
          </div>
          <p className="text-neutral-400 text-sm ml-11">Manage active users and promote to interviewers</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 mt-8 px-2">
        <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
          <ActivityIcon className="size-4 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white tracking-tight">All Users</h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-neutral-300 uppercase tracking-wider ml-auto shadow-sm">
          {candidates?.length || 0} Registered
        </div>
      </div>

      {isLoadingCandidates ? (
        <div className="flex justify-center p-20">
          <LoaderIcon className="w-10 h-10 animate-spin text-neutral-500" />
        </div>
      ) : candidates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 rounded-2xl border border-white/5 bg-[#1e1e1e]/50 shadow-xl">
          <div className="size-16 mb-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shadow-lg">
             <TerminalSquareIcon className="size-6 text-neutral-500" />
          </div>
          <p className="text-lg font-bold text-white tracking-tight mb-2">No candidates found</p>
          <p className="text-sm font-medium text-neutral-500">Registered users will seamlessly appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {candidates?.map((candidate) => (
            <div 
              key={candidate._id} 
              className="group relative flex flex-col p-5 rounded-2xl border border-white/10 bg-[#1e1e1e] hover:border-white/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Background ambient glow setup */}
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/[0.04] to-transparent z-0 pointer-events-none" />
              
              {/* Avatar & Header */}
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <div className="relative shrink-0">
                  <img 
                    src={candidate.profileImage || `https://ui-avatars.com/api/?name=${candidate.name}&background=random`} 
                    alt={candidate.name} 
                    className="w-14 h-14 rounded-full border-2 border-[#1e1e1e] ring-1 ring-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-shadow duration-300 object-cover bg-black/40"
                  />
                  <div className="absolute bottom-0 right-0 size-3.5 bg-emerald-500 border-2 border-[#1e1e1e] rounded-full z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white tracking-tight mb-0.5 truncate">{candidate.name}</h3>
                  <p className="text-xs font-medium text-neutral-400 truncate">{candidate.email}</p>
                </div>
              </div>
              
              {/* Info row */}
              <div className="relative z-10 flex items-center justify-between mb-5 bg-black/40 rounded-xl p-3 px-4 border border-white/5 group-hover:border-white/10 transition-colors">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Joined</span>
                    <span className="text-[11px] font-bold text-neutral-300">{new Date(candidate.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                 </div>
                 <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Access</span>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 uppercase tracking-widest shadow-sm">Candidate</span>
                 </div>
              </div>

              {/* Footer Action */}
              <div className="relative z-10 mt-auto pt-1">
                <button
                  onClick={() => handlePromote(candidate.email)}
                  disabled={promoteMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-200 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
                  title={`Promote ${candidate.name} to Interviewer`}
                >
                  {promoteMutation.isPending && promoteMutation.variables === candidate.email ? (
                    <LoaderIcon className="size-4 animate-spin" />
                  ) : (
                    <UserPlus className="size-4" />
                  )}
                  Promote to Interviewer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
