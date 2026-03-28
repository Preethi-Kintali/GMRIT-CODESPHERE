import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Loader2, Trash2, CheckCircle, Clock } from "lucide-react";
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
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(`/sessions/\${id}/cancel`);
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
    if (confirm("Are you sure you want to cancel this session?")) {
      cancelSessionMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Platform overview and quick actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/sessions/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create Session
          </Link>
          <Link
            to="/admin/problems/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Add Problem
          </Link>
        </div>
      </div>

      {isLoadingStats ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1e1e2e] rounded-xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Active Sessions</h3>
              <p className="text-3xl font-bold text-white">{stats?.activeSessions || 0}</p>
            </div>
            <div className="bg-[#1e1e2e] rounded-xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Total Interviewers</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalInterviewers || 0}</p>
            </div>
            <div className="bg-[#1e1e2e] rounded-xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Candidates Today</h3>
              <p className="text-3xl font-bold text-white">{stats?.candidatesToday || 0}</p>
            </div>
            <div className="bg-[#1e1e2e] rounded-xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Published Problems</h3>
              <p className="text-3xl font-bold text-white">{stats?.publishedProblems || 0}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white pt-4">Feedback Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Total Hired</h3>
              <p className="text-3xl font-bold text-white">{stats?.feedbackStats?.hired || 0}</p>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20">
              <h3 className="text-sm font-medium text-amber-400 mb-2">Total Considered</h3>
              <p className="text-3xl font-bold text-white">{stats?.feedbackStats?.considered || 0}</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
              <h3 className="text-sm font-medium text-red-400 mb-2">Total Rejected</h3>
              <p className="text-3xl font-bold text-white">{stats?.feedbackStats?.rejected || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">All Sessions</h2>
        <div className="bg-[#1e1e2e] border border-white/5 rounded-xl overflow-hidden">
          {isLoadingSessions ? (
            <div className="flex justify-center p-10">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-400">Problem</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-400">Interviewer</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-400">Candidate</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-400">Scheduled</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessionsData?.sessions?.map((session) => (
                    <tr key={session._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full \${
                          session.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                          session.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                          session.status === 'completed' ? 'bg-slate-500/10 text-slate-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {session.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {session.problem?.title || "Unknown Problem"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {session.interviewer?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {session.candidate?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(session.scheduledAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelSession(session._id)}
                            disabled={cancelSessionMutation.isPending}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded transition-colors"
                            title="Cancel Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sessionsData?.sessions?.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                        No sessions found
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
