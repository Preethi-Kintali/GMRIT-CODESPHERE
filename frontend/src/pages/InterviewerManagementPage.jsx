import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Loader2, Plus, X, Users, Mail, BadgeCheck, ShieldAlert } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Interviewers</h1>
          <p className="text-slate-400">Manage technical interviewers and expertise</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Add Interviewer</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewers?.map((interviewer) => (
            <div key={interviewer._id} className="bg-[#1e1e2e] rounded-xl p-5 border border-white/5 relative group">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={interviewer.profileImage || `https://ui-avatars.com/api/?name=\${interviewer.name}`}
                  alt={interviewer.name}
                  className="w-14 h-14 rounded-full border-2 border-slate-700"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{interviewer.name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <Mail size={14} />
                    <span>{interviewer.email}</span>
                  </div>
                </div>
              </div>

              {interviewer.department && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-white/5 text-slate-300 text-xs rounded-md">
                    Dept: {interviewer.department}
                  </span>
                </div>
              )}

              {interviewer.expertise?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interviewer.expertise.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No expertise tags</p>
              )}
            </div>
          ))}

          {interviewers?.length === 0 && (
            <div className="col-span-full border border-dashed border-white/10 rounded-xl p-10 text-center">
              <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No interviewers added yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Interviewer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e1e2e] w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Add Interviewer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 text-sm text-blue-200">
                <BadgeCheck className="shrink-0 w-5 h-5 text-blue-400" />
                <p>The user must already be signed up in CodeSphere to be promoted to Interviewer.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">User Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="interviewer@example.com"
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering, HR"
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expertise Tags</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="Comma separated: React, Node, DSA"
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoteMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {promoteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
                  Promote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
