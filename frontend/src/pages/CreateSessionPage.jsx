import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { LoaderIcon, CalendarIcon, TerminalSquareIcon, ArrowRightIcon, ClockIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router";

export default function CreateSessionPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [formData, setFormData] = useState({
    candidate: "",
    interviewer: "",
    problem: "",
    duration: 60,
  });

  // Calculate local minimum date for restriction
  const todayStr = new Date().toISOString().split('T')[0];

  const availableTimeSlots = useMemo(() => {
    if (!date) return [];
    
    const [y, m, d] = date.split('-');
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (dayOfWeek === 0) return []; // Fast early-return constraint

    const slots = [];
    const isToday = date === todayStr;
    const now = new Date();
    const nowDecimal = now.getHours() + now.getMinutes() / 60;

    for (let h = 9; h <= 20; h++) {
      for (let m = 0; m < 60; m += 30) {
         const startTimeDecimal = h + m / 60;
         const endTimeDecimal = startTimeDecimal + (formData.duration / 60);

         // Bounds
         if (startTimeDecimal < 9 || endTimeDecimal > 21) continue;

         // Lunch (13:00 to 14:30) (1:00 PM to 2:30 PM)
         if (startTimeDecimal < 14.5 && endTimeDecimal > 13) continue;

         // Past Time Check
         if (isToday && startTimeDecimal < nowDecimal) continue;

         const hh = h.toString().padStart(2, '0');
         const mm = m.toString().padStart(2, '0');
         const ampm = h >= 12 ? 'PM' : 'AM';
         const h12 = h % 12 === 0 ? 12 : h % 12;
         const label = `${h12.toString().padStart(2, '0')}:${mm} ${ampm}`;

         slots.push({ value: `${hh}:${mm}`, label });
      }
    }
    return slots;
  }, [date, formData.duration, todayStr]);

  // Clean currently selected time if it becomes invalid (e.g. they changed duration or changed day to today)
  useEffect(() => {
     if (time && !availableTimeSlots.find(s => s.value === time)) {
        setTime(""); 
     }
  }, [time, availableTimeSlots]);

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
    mutationFn: async (payload) => axiosInstance.post("/sessions/schedule", payload),
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
    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    const localDateTimeString = `${date}T${time}:00`;
    const selectedDate = new Date(localDateTimeString);
    const now = new Date();

    if (selectedDate.getDay() === 0) {
      toast.error("Interviews cannot be scheduled on Sundays.");
      return;
    }
    
    if (selectedDate < now) {
      toast.error("Cannot schedule interviews in the past.");
      return;
    }
    
    // Validate 9 AM to 9 PM working bounds
    const startHour = selectedDate.getHours();
    const startMin = selectedDate.getMinutes();
    const startTimeDecimal = startHour + startMin / 60;
    const endTimeDecimal = startTimeDecimal + (formData.duration / 60);

    if (startTimeDecimal < 9 || endTimeDecimal > 21) {
      toast.error(`Sessions must be strictly within 9:00 AM and 9:00 PM. (Selected slot ends at ${Math.floor(endTimeDecimal)}:${(endTimeDecimal % 1 * 60).toString().padStart(2, '0')})`);
      return;
    }

    // Validate 1:00 PM to 2:30 PM Lunch Block Overlay
    if (startTimeDecimal < 14.5 && endTimeDecimal > 13) {
      toast.error("Interviews cannot overlap with the 1:00 PM to 2:30 PM lunch break.");
      return;
    }

    const scheduledAt = selectedDate.toISOString();
    const timezoneOffset = new Date().getTimezoneOffset();
    scheduleMutation.mutate({ ...formData, scheduledAt, timezoneOffset });
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-4xl">
      <style>{`
        /* Hide native datetime indicator and stretch it to make the whole field heavily clickable */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          opacity: 0;
          cursor: pointer;
        }
        
        /* Firefox support for hiding the native calendar icon */
        input[type="date"]::-moz-calendar-picker-indicator,
        input[type="time"]::-moz-calendar-picker-indicator {
          display: none;
        }
      `}</style>
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
              <CalendarIcon className="size-4 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Schedule Interview
            </h1>
          </div>
          <p className="text-neutral-400 text-sm ml-11">Set up a session and send secure invites</p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
        <ClockIcon className="size-5 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-200/80 leading-relaxed">
          <p className="font-semibold text-blue-300 mb-1">Scheduling Policy:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Interviews are available from <strong>9:00 AM to 9:00 PM</strong>.</li>
            <li>Working days: <strong>Monday to Saturday</strong> (Closed on Sundays).</li>
            <li><strong>Lunch Break:</strong> 1:00 PM to 2:30 PM (Unavailable)</li>
            <li><strong>Maximum Limit:</strong> 2 interviews per day (Morning + Afternoon limit).</li>
            <li><strong>Required Gap:</strong> Minimum 1.5 hours between two same-day sessions.</li>
            <li>No overlapping sessions allowed for either participant.</li>
          </ul>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-[#1e1e1e]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Interviewer</label>
              <select 
                required
                value={formData.interviewer}
                onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium appearance-none [color-scheme:dark]"
              >
                <option value="" className="bg-[#1e1e1e] text-neutral-400">Select an Interviewer</option>
                {interviewers?.map((user) => (
                  <option key={user._id} value={user._id} className="bg-[#1e1e1e] text-white">{user.name} ({user.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Candidate</label>
              <select 
                required
                value={formData.candidate}
                onChange={(e) => setFormData({...formData, candidate: e.target.value})}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium appearance-none [color-scheme:dark]"
              >
                <option value="" className="bg-[#1e1e1e] text-neutral-400">Select a Candidate</option>
                {candidates?.map((user) => (
                  <option key={user._id} value={user._id} className="bg-[#1e1e1e] text-white">{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Coding Problem</label>
             <select 
              required
              value={formData.problem}
              onChange={(e) => setFormData({...formData, problem: e.target.value})}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium appearance-none [color-scheme:dark]"
            >
              <option value="" className="bg-[#1e1e1e] text-neutral-400">Select a Problem</option>
              {problems?.map((prob) => (
                <option key={prob._id} value={prob._id} className="bg-[#1e1e1e] text-white">{prob.title} - {prob.difficulty}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">Date</label>
              <div className="relative flex items-center w-full">
                <input 
                  type="date" 
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all [color-scheme:dark]" 
                />
                <CalendarIcon className="size-4 text-neutral-500 absolute left-4 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Time Slot</label>
              <div className="relative flex items-center w-full">
                <select 
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!date || availableTimeSlots.length === 0}
                  className="w-full pl-11 pr-10 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none [color-scheme:dark] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-[#1e1e1e] text-neutral-400">
                    {!date ? "Select a date first" : (date && new Date(date.split('-')[0], date.split('-')[1] - 1, date.split('-')[2]).getDay() === 0 ? "Unavailable on Sundays" : (availableTimeSlots.length === 0 ? "No slots available" : "Pick a time"))}
                  </option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value} className="bg-[#1e1e1e] text-white">
                      {slot.label}
                    </option>
                  ))}
                </select>
                <ClockIcon className="size-4 text-neutral-500 absolute left-4 group-focus-within:text-emerald-400 transition-colors pointer-events-none z-0" />
                <div className="absolute right-4 pointer-events-none text-neutral-500 group-hover:text-neutral-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 group-focus-within:text-purple-400 transition-colors">Duration</label>
              <div className="relative flex items-center w-full">
                <select 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                  className="w-full pl-11 pr-10 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none [color-scheme:dark]"
                >
                  <option value={45} className="bg-[#1e1e1e] text-white">45 Minutes</option>
                  <option value={60} className="bg-[#1e1e1e] text-white">60 Minutes</option>
                  <option value={90} className="bg-[#1e1e1e] text-white">90 Minutes</option>
                </select>
                <ClockIcon className="size-4 text-neutral-500 absolute left-4 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                <div className="absolute right-4 pointer-events-none text-neutral-500 group-hover:text-neutral-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 mt-8">
            <Link to="/admin" className="px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors w-full md:w-auto text-center">
               Cancel
            </Link>
            <button 
              type="submit" 
              disabled={scheduleMutation.isPending}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors font-semibold text-sm disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
            >
              {scheduleMutation.isPending && <LoaderIcon className="size-4 animate-spin" />}
              Schedule & Send Invites
              {!scheduleMutation.isPending && <ArrowRightIcon className="size-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
