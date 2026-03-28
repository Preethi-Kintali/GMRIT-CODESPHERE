import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Calendar } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Schedule Interview</h1>
          <p className="text-base-content/70 mt-1">Set up a session and send secure invites</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-base-200/50 rounded-2xl p-8 border border-base-300 shadow-sm space-y-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium text-base-content/80">Interviewer</span>
          </label>
          <select 
            required
            value={formData.interviewer}
            onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
            className="select select-bordered w-full bg-base-100 focus:outline-none"
          >
            <option value="">Select an Interviewer</option>
            {interviewers?.map((user) => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium text-base-content/80">Candidate</span>
          </label>
          <select 
            required
            value={formData.candidate}
            onChange={(e) => setFormData({...formData, candidate: e.target.value})}
            className="select select-bordered w-full bg-base-100 focus:outline-none"
          >
            <option value="">Select a Candidate</option>
            {candidates?.map((user) => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>

        <div className="form-control w-full">
           <label className="label">
             <span className="label-text font-medium text-base-content/80">Coding Problem</span>
           </label>
           <select 
            required
            value={formData.problem}
            onChange={(e) => setFormData({...formData, problem: e.target.value})}
            className="select select-bordered w-full bg-base-100 focus:outline-none"
          >
            <option value="">Select a Problem</option>
            {problems?.map((prob) => (
              <option key={prob._id} value={prob._id}>{prob.title} - {prob.difficulty}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-base-content/80">Scheduled Date & Time</span>
            </label>
            <input 
              type="datetime-local" 
              required
              value={formData.scheduledAt}
              onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
              className="input input-bordered w-full bg-base-100 focus:outline-none" 
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-base-content/80">Duration (minutes)</span>
            </label>
            <select 
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
              className="select select-bordered w-full bg-base-100 focus:outline-none"
            >
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={scheduleMutation.isPending}
            className="btn btn-primary w-full md:w-auto"
          >
            {scheduleMutation.isPending && <span className="loading loading-spinner loading-sm"></span>}
            Schedule & Send Invites
          </button>
        </div>
      </form>
    </div>
  );
}
