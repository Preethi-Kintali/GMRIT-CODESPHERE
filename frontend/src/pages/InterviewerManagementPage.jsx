import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Plus, X, Users, Mail, BadgeCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function InterviewerManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", department: "", expertise: "" });

  const { data: interviewers, isLoading } = useQuery({
    queryKey: ["admin-interviewers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/interviewers");
      return res.data;
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (data) => axiosInstance.post("/admin/interviewers", data),
    onSuccess: () => {
      toast.success("Interviewer added successfully!");
      queryClient.invalidateQueries(["admin-interviewers"]);
      setIsModalOpen(false);
      setFormData({ email: "", department: "", expertise: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add interviewer");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    promoteMutation.mutate({
      email: formData.email,
      department: formData.department,
      expertise: formData.expertise.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Interviewers</h1>
          <p className="text-base-content/70 mt-1">Manage technical interviewers and expertise</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Interviewer</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewers?.map((interviewer) => (
            <div key={interviewer._id} className="card bg-base-200 shadow-sm border border-base-300 relative group">
              <div className="card-body p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="avatar">
                    <div className="w-14 h-14 rounded-full ring ring-primary/30 ring-offset-base-100 ring-offset-2">
                      <img src={interviewer.profileImage || `https://ui-avatars.com/api/?name=${interviewer.name}`} alt={interviewer.name} />
                    </div>
                  </div>
                  <div>
                    <h3 className="card-title text-lg">{interviewer.name}</h3>
                    <div className="flex items-center gap-1.5 text-base-content/70 text-sm">
                      <Mail size={14} className="opacity-70" />
                      <span>{interviewer.email}</span>
                    </div>
                  </div>
                </div>

                {interviewer.department && (
                  <div className="mt-3">
                    <span className="text-sm">
                      <span className="text-base-content/60">Dept: </span>
                      <strong className="font-semibold text-base-content/90">{interviewer.department}</strong>
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  {interviewer.expertise?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {interviewer.expertise.map((tag, idx) => (
                        <div key={idx} className="badge badge-accent badge-outline badge-sm">
                          {tag}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-base-content/50 italic">No expertise tags</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {interviewers?.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-base-300 rounded-box p-12 text-center flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-base-content/30 mb-4" />
              <h3 className="text-lg font-medium text-base-content/80 mb-1">No interviewers found</h3>
              <p className="text-base-content/50">Add someone to your team to see them here.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Interviewer Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-200">
            <h3 className="font-bold text-xl mb-6 flex items-center justify-between">
              Add Interviewer
              <button onClick={() => setIsModalOpen(false)} className="btn btn-sm btn-ghost btn-circle">
                <X size={20} />
              </button>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="alert alert-info bg-info/10 text-info border-info/20 shadow-none py-3">
                <BadgeCheck className="shrink-0 w-5 h-5" />
                <span className="text-sm">The user must already be signed up in CodeSphere to be promoted.</span>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">User Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="interviewer@example.com"
                  className="input input-bordered w-full bg-base-100 focus:outline-none"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">Department</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering, HR"
                  className="input input-bordered w-full bg-base-100 focus:outline-none"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">Expertise Tags</span>
                </label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="Comma separated: React, Node, DSA"
                  className="input input-bordered w-full bg-base-100 focus:outline-none"
                />
              </div>

              <div className="modal-action mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoteMutation.isPending}
                  className="btn btn-primary"
                >
                  {promoteMutation.isPending && <span className="loading loading-spinner loading-sm"></span>}
                  Promote
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
