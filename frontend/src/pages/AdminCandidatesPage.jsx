import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { UserPlus, Users } from "lucide-react";
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
    if (confirm(`Are you sure you want to promote ${email} to an Interviewer?`)) {
      promoteMutation.mutate(email);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Candidates (All Users)</h1>
          <p className="text-base-content/70 mt-1">Manage users and promote candidates to interviewers</p>
        </div>
      </div>

      <div>
        <div className="overflow-x-auto bg-base-200/50 rounded-box border border-base-300 shadow-sm">
          {isLoadingCandidates ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-300/40 text-base-content/70 uppercase text-xs tracking-wider">
                  <th className="py-4">User</th>
                  <th className="py-4">Email</th>
                  <th className="py-4">Joined</th>
                  <th className="py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates?.map((candidate) => (
                  <tr key={candidate._id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-300">
                            <img src={candidate.profileImage || `https://ui-avatars.com/api/?name=${candidate.name}`} alt="Avatar" />
                          </div>
                        </div>
                        <div className="font-medium">{candidate.name}</div>
                      </div>
                    </td>
                    <td>{candidate.email}</td>
                    <td className="text-sm">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handlePromote(candidate.email)}
                        disabled={promoteMutation.isPending}
                        className="btn btn-sm btn-outline btn-primary"
                        title="Promote to Interviewer"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Promote
                      </button>
                    </td>
                  </tr>
                ))}
                {candidates?.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-base-content/50">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-base-content/30 mb-4" />
                        No candidates found
                      </div>
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
