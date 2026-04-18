import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { LoaderIcon, Trash2, LayoutDashboardIcon, ActivityIcon, UsersIcon, TerminalSquareIcon, Code2Icon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/stats");
      return res.data;
    },
  });

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/sessions");
      return res.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time visibility
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(`/sessions/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Session cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel session");
    },
  });

  const handleCancelSession = (id) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Are you sure you want to cancel this session?</p>
        <div className="flex justify-end gap-2">
          <button 
            className="btn btn-xs btn-ghost text-neutral-400"
            onClick={() => toast.dismiss(t.id)}
          >
            Go Back
          </button>
          <button 
            className="btn btn-xs btn-error"
            onClick={() => {
              cancelSessionMutation.mutate(id);
              toast.dismiss(t.id);
            }}
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center",
      style: {
        background: "#1e1e1e",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "16px",
        borderRadius: "12px",
        minWidth: "280px"
      }
    });
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-7xl">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
              <LayoutDashboardIcon className="size-4 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-neutral-400 text-sm ml-11">Platform overview and quick actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/problems/new"
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#1e1e1e] border border-white/10 hover:bg-white/5 text-white transition-colors flex items-center gap-2 shrink-0"
          >
            Add Problem
          </Link>
          <Link
            to="/admin/sessions/create"
            className="px-4 py-2 text-sm font-medium rounded-md bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shrink-0 border border-transparent"
          >
            Create Session
          </Link>
        </div>
      </div>

      {isLoadingStats ? (
        <div className="flex justify-center p-10">
          <LoaderIcon className="size-6 animate-spin text-neutral-500" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <ActivityIcon className="size-4 text-neutral-400" />
                <h3 className="text-sm font-medium text-neutral-400 tracking-tight">Active Sessions</h3>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{stats?.activeSessions || 0}</p>
            </div>
            <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                 <UsersIcon className="size-4 text-neutral-400" />
                 <h3 className="text-sm font-medium text-neutral-400 tracking-tight">Total Interviewers</h3>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{stats?.totalInterviewers || 0}</p>
            </div>
            <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                 <UsersIcon className="size-4 text-neutral-400" />
                 <h3 className="text-sm font-medium text-neutral-400 tracking-tight">Candidates Today</h3>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{stats?.candidatesToday || 0}</p>
            </div>
            <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                 <Code2Icon className="size-4 text-neutral-400" />
                 <h3 className="text-sm font-medium text-neutral-400 tracking-tight">Published Problems</h3>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{stats?.publishedProblems || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 rounded-xl border border-white/10 bg-[#1e1e1e] flex flex-col h-full mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
            <ActivityIcon className="size-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">All Sessions</h2>
        </div>

        <div className="rounded-xl border border-white/5 overflow-hidden">
          {isLoadingSessions ? (
            <div className="flex justify-center p-10">
              <LoaderIcon className="size-6 animate-spin text-neutral-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 border-b border-white/10 text-neutral-400 text-[10px] uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Problem</th>
                    <th className="px-5 py-3">Interviewer</th>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Scheduled</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/40">
                  {sessionsData?.sessions?.map((session) => (
                    <tr key={session._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-neutral-300 uppercase tracking-wider`}>
                          <div className={`size-1.5 rounded-full ${
                             session.status === 'active' ? 'bg-emerald-400' :
                             session.status === 'scheduled' ? 'bg-blue-400' :
                             session.status === 'completed' ? 'bg-neutral-400' :
                             'bg-red-400'
                          }`} />
                          {session.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-white truncate max-w-[200px]">
                        {session.problem?.title || "Unknown Problem"}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-300">
                        {session.interviewer?.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-300">
                        {session.candidate?.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-400">
                        {new Date(session.scheduledAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelSession(session._id)}
                            disabled={cancelSessionMutation.isPending}
                            className="text-neutral-500 hover:text-white p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                            title="Cancel Session"
                          >
                            {cancelSessionMutation.isPending && cancelSessionMutation.variables === session._id ? (
                              <LoaderIcon className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sessionsData?.sessions?.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center h-full text-center py-4">
                          <div className="size-12 mb-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                             <TerminalSquareIcon className="size-5 text-neutral-500" />
                          </div>
                          <p className="text-sm font-medium text-neutral-300 mb-1">No sessions yet</p>
                          <p className="text-xs text-neutral-500">Scheduled sessions will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
