import { useState, useEffect } from "react";
import { ClockIcon, TimerIcon, AlertTriangleIcon } from "lucide-react";

export default function SessionTimer({ scheduledAt, duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!scheduledAt || !duration) return;

    const calculateTime = () => {
      const start = new Date(scheduledAt).getTime();
      const end = start + duration * 60000;
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      
      setTimeLeft(diff);
      setIsCritical(diff < 300); // Less than 5 minutes

      if (diff === 0 && onTimeUp) {
        onTimeUp();
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [scheduledAt, duration, onTimeUp]);

  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  if (timeLeft < 0) return null;

  return (
    <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-500 shadow-lg ${
      isCritical 
        ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" 
        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    }`}>
      {isCritical ? (
        <AlertTriangleIcon className="size-4 animate-bounce" />
      ) : (
        <TimerIcon className="size-4" />
      )}
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none">Time Remaining</span>
        <span className="text-sm font-mono font-black tabular-nums">{formatTime(timeLeft)}</span>
      </div>

      <div className="size-1.5 rounded-full bg-current opacity-30 mx-0.5" />
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none">Duration</span>
        <span className="text-xs font-bold">{duration}m</span>
      </div>
    </div>
  );
}
