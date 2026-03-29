import { useState, useRef, useEffect } from "react";
import { BellIcon, CheckCircle2Icon, CalendarIcon, UserIcon, XIcon, InfoIcon, ShieldAlertIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import axiosInstance from "../lib/axios";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/notifications");
      return res.data;
    },
    refetchInterval: 30000 // Poll every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const getIcon = (type) => {
    switch (type) {
      case "role_change": return <UserIcon className="size-4 text-emerald-400" />;
      case "session_scheduled": return <CalendarIcon className="size-4 text-blue-400" />;
      case "session_cancelled": return <ShieldAlertIcon className="size-4 text-red-400" />;
      default: return <InfoIcon className="size-4 text-neutral-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-neutral-400 hover:text-white"
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full ring-2 ring-black"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 bg-neutral-900/90 backdrop-blur-sm z-10">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => handleMarkAsRead("all", e)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                disabled={markAsReadMutation.isPending}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`relative p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-1 ${!notif.isRead ? 'text-white font-medium' : 'text-neutral-300'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-1.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-neutral-600 font-medium tracking-wider uppercase">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      {notif.link && (
                        <Link 
                          to={notif.link} 
                          onClick={() => { setIsOpen(false); if(!notif.isRead) markAsReadMutation.mutate(notif._id); }}
                          className="text-[11px] text-blue-400 hover:underline inline-flex items-center"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(notif._id, e)}
                      className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                      title="Mark as read"
                    >
                      <span className="size-2 rounded-full bg-blue-500 block"></span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
