import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { X, UsersIcon, MailIcon, LoaderIcon, ActivityIcon, TerminalSquareIcon, BadgeCheckIcon } from "lucide-react";
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
      queryClient.invalidateQueries({ queryKey: ["admin-interviewers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
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
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-7xl">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
              <UsersIcon className="size-4 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Interviewers
            </h1>
          </div>
          <p className="text-neutral-400 text-sm ml-11">Manage technical interviewers and expertise</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium rounded-md bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shrink-0 border border-transparent"
          >
            Add Interviewer
          </button>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-white/10 bg-[#1e1e1e] flex flex-col h-full mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
            <ActivityIcon className="size-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">All Interviewers</h2>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-neutral-300 uppercase tracking-wider ml-auto">
            {interviewers?.length || 0} Total
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <LoaderIcon className="size-8 animate-spin text-neutral-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewers?.map((interviewer) => (
              <div key={interviewer._id} className="p-5 rounded-xl border border-white/5 bg-black/40 hover:bg-white/[0.02] transition-colors group relative overflow-hidden flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center justify-center size-12 rounded-lg border border-white/10 bg-white/5 shrink-0 overflow-hidden">
                    <img 
                      src={interviewer.profileImage || `https://ui-avatars.com/api/?name=${interviewer.name}`} 
                      alt={interviewer.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate px-1">{interviewer.name}</h3>
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs mt-1 px-1">
                      <MailIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{interviewer.email}</span>
                    </div>
                  </div>
                </div>

                {interviewer.department && (
                  <div className="mt-4 flex flex-col gap-1 border-t border-white/5 pt-4">
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider">Department</span>
                    <div className="text-sm font-medium text-white">{interviewer.department}</div>
                  </div>
                )}

                <div className="mt-4 pb-2">
                  {interviewer.expertise?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {interviewer.expertise.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-neutral-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600">No expertise specified</p>
                  )}
                </div>
              </div>
            ))}

            {interviewers?.length === 0 && (
              <div className="col-span-full border border-dashed border-white/10 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-transparent mt-4">
                <TerminalSquareIcon className="size-8 text-neutral-600 mb-4" />
                <h3 className="text-sm font-medium text-neutral-300 mb-1">No interviewers found</h3>
                <p className="text-neutral-500 text-xs">Add your first interviewer to start scheduling sessions.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Interviewer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-md relative z-10 shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h3 className="text-xl font-semibold text-white tracking-tight">Add Interviewer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg p-1.5">
                <X className="size-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-3 bg-white/5 border border-white/10 p-4 rounded-xl items-start">
                <BadgeCheckIcon className="shrink-0 size-4 text-neutral-400 mt-0.5" />
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  The user must already be registered in CodeSphere as a candidate to be promoted.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">User Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="interviewer@example.com"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Department (Optional)</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Frontend, Data Science"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Expertise Tags (Optional)</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="Comma separated: React, Python..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg transition-colors font-medium text-sm border border-white/10">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoteMutation.isPending}
                  className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors font-semibold text-sm flex items-center justify-center disabled:opacity-50 min-w-[120px]"
                >
                  {promoteMutation.isPending ? (
                    <LoaderIcon className="size-4 animate-spin" />
                  ) : (
                    "Promote User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
