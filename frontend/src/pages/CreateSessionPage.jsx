import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function CreateSessionPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    candidate: "",
    interviewer: "",
    problem: "",
    scheduledAt: "",
    duration: 60,
  });

  const { data: interviewers } = useQuery({
    queryKey: ["admin-interviewers"],
    queryFn: async () => (await axiosInstance.get("/admin/interviewers")).data,
  });

  const { data: candidates } = useQuery({
    queryKey: ["admin-candidates"],
    queryFn: async () => (await axiosInstance.get("/admin/candidates")).data,
  });

  const { data: problems } = useQuery({
    queryKey: ["admin-problems"],
    queryFn: async () => (await axiosInstance.get("/admin/problems")).data,
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data) => axiosInstance.post("/sessions/schedule", data),
    onSuccess: () => {
      toast.success("Session scheduled & invites sent!");
      queryClient.invalidateQueries(["admin-stats"]);
      navigate("/admin");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to schedule session");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    scheduleMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Calendar className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule Interview</h1>
          <p className="text-slate-400">Set up a session and send secure invites</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1e1e2e] rounded-xl p-6 border border-white/5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Interviewer</label>
          <select 
            required
            value={formData.interviewer}
            onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none"
          >
            <option value="">Select an Interviewer</option>
            {interviewers?.map((user) => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Candidate</label>
          <select 
            required
            value={formData.candidate}
            onChange={(e) => setFormData({...formData, candidate: e.target.value})}
            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none"
          >
            <option value="">Select a Candidate</option>
            {candidates?.map((user) => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-300 mb-1">Coding Problem</label>
           <select 
            required
            value={formData.problem}
            onChange={(e) => setFormData({...formData, problem: e.target.value})}
            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none"
          >
            <option value="">Select a Problem</option>
            {problems?.map((prob) => (
              <option key={prob._id} value={prob._id}>{prob.title} - {prob.difficulty}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Scheduled Date & Time</label>
            <input 
              type="datetime-local" 
              required
              value={formData.scheduledAt}
              onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Duration (minutes)</label>
            <select 
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
            >
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={scheduleMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {scheduleMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Schedule & Send Invites
          </button>
        </div>
      </form>
    </div>
  );
}
