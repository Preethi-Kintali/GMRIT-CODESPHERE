import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axiosInstance from "../lib/axios";
import { CalendarIcon, LoaderIcon, MapPinIcon, ClockIcon, UserIcon } from "lucide-react";

export default function InterviewerCalendarPage() {
  const [date, setDate] = useState(new Date());

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => (await axiosInstance.get("/admin/sessions")).data,
  });

  const bookedDates = sessions?.sessions?.map(s => new Date(s.scheduledAt).toDateString()) || [];
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && bookedDates.includes(date.toDateString())) {
      return 'booked-date';
    }
  };

  const filteredSessions = sessions?.sessions?.filter(s => new Date(s.scheduledAt).toDateString() === date.toDateString());

  return (
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-7xl">
      <style>{`
        .react-calendar {
          background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          border-radius: 1rem;
          padding: 1rem;
          width: 100% !important;
        }
        .react-calendar__tile { color: #a3a3a3; font-weight: 500; height: 80px !important; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 0.5rem; transition: all 0.2s; }
        .react-calendar__tile:hover { background: rgba(255,255,255,0.05) !important; color: white !important; }
        .react-calendar__tile--now { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.2) !important; }
        .react-calendar__tile--active { background: #ffffff !important; color: #000000 !important; }
        .booked-date { background: rgba(16, 185, 129, 0.1) !important; color: #10b981 !important; position: relative; }
        .booked-date::after { content: ''; position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: currentColor; border-radius: 50%; }
        .react-calendar__navigation button { color: white; min-width: 44px; background: none; font-size: 1.1rem; border-radius: 0.5rem; }
        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: rgba(255,255,255,0.05); }
        .react-calendar__month-view__weekdays__weekday { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: #525252; text-decoration: none; display: flex; justify-content: center; padding: 10px 0; }
        abbr[title] { text-decoration: none; border-bottom: none; }
      `}</style>

      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
              <CalendarIcon className="size-4 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Availability</h1>
          </div>
          <p className="text-neutral-400 text-sm ml-11">View scheduled sessions and manage gaps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Calendar 
            onChange={setDate} 
            value={date} 
            tileClassName={tileClassName}
          />
        </div>

        <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 h-full min-h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
             <ClockIcon className="size-4 text-neutral-400" />
             {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}
          </h3>
          
          <div className="space-y-4">
            {isLoading ? (
               <div className="flex justify-center p-12"><LoaderIcon className="size-6 animate-spin text-neutral-500" /></div>
            ) : filteredSessions?.length > 0 ? (
               filteredSessions.map(s => (
                 <div key={s._id} className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-white uppercase tracking-wider">{new Date(s.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Active</span>
                   </div>
                   <h4 className="font-semibold text-white truncate px-0">{s.problem?.title}</h4>
                   <div className="flex items-center gap-3 text-xs text-neutral-400">
                     <div className="flex items-center gap-1.5"><UserIcon className="size-3" /> {s.interviewer?.name}</div>
                     <div className="flex items-center gap-1.5"><MapPinIcon className="size-3" /> Remote</div>
                   </div>
                   <Link to={`/session/${s._id}`} className="block w-full text-center py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-medium transition-colors">Join Session</Link>
                 </div>
               ))
            ) : (
              <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-12 text-center">
                 <p className="text-neutral-500 text-sm">No sessions scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
