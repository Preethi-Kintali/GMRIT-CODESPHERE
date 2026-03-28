import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Trash2 } from "lucide-react";
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
    if (confirm("Are you sure you want to cancel this session?")) {
      cancelSessionMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 p-6 mx-auto max-w-7xl">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            Admin Dashboard
          </h1>
          <p className="text-base-content/70 mt-1">Platform overview and quick actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/sessions/create" className="btn btn-primary">
            Create Session
          </Link>
          <Link to="/admin/problems/new" className="btn btn-accent">
            Add Problem
          </Link>
        </div>
      </div>

      {isLoadingStats ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-200/50 w-full overflow-hidden border border-base-300">
            <div className="stat place-items-center">
              <div className="stat-title text-base-content/80">Active Sessions</div>
              <div className="stat-value text-primary">{stats?.activeSessions || 0}</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title text-base-content/80">Total Interviewers</div>
              <div className="stat-value text-secondary">{stats?.totalInterviewers || 0}</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title text-base-content/80">Candidates Today</div>
              <div className="stat-value text-accent">{stats?.candidatesToday || 0}</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title text-base-content/80">Published Problems</div>
              <div className="stat-value text-base-content">{stats?.publishedProblems || 0}</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Feedback Breakdown</h2>
            <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-200/50 w-full overflow-hidden border border-base-300">
              <div className="stat place-items-center">
                <div className="stat-title text-base-content/80">Total Hired</div>
                <div className="stat-value text-success">{stats?.feedbackStats?.hired || 0}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title text-base-content/80">Total Considered</div>
                <div className="stat-value text-warning">{stats?.feedbackStats?.considered || 0}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title text-base-content/80">Total Rejected</div>
                <div className="stat-value text-error">{stats?.feedbackStats?.rejected || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">All Sessions</h2>
        <div className="overflow-x-auto bg-base-200/50 rounded-box border border-base-300 shadow-sm">
          {isLoadingSessions ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-300/40 text-base-content/70 uppercase text-xs tracking-wider">
                  <th className="py-4">Status</th>
                  <th className="py-4">Problem</th>
                  <th className="py-4">Interviewer</th>
                  <th className="py-4">Candidate</th>
                  <th className="py-4">Scheduled</th>
                  <th className="py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessionsData?.sessions?.map((session) => (
                  <tr key={session._id} className="hover">
                    <td>
                      <div className={`badge badge-sm font-semibold uppercase tracking-wider ${
                        session.status === 'scheduled' ? 'badge-info' :
                        session.status === 'active' ? 'badge-success' :
                        session.status === 'completed' ? 'badge-neutral' :
                        'badge-error'
                      }`}>
                        {session.status}
                      </div>
                    </td>
                    <td className="font-medium">{session.problem?.title || "Unknown Problem"}</td>
                    <td>{session.interviewer?.name}</td>
                    <td>{session.candidate?.name}</td>
                    <td className="text-sm">
                      {new Date(session.scheduledAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="text-right">
                      {session.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelSession(session._id)}
                          disabled={cancelSessionMutation.isPending}
                          className="btn btn-ghost btn-circle btn-sm text-error"
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
                    <td colSpan="6" className="text-center py-8 text-base-content/50">
                      No sessions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
