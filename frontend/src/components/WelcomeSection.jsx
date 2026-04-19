import { useUser } from "@clerk/clerk-react";
import { TerminalSquareIcon } from "lucide-react";

function WelcomeSection() {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden border-b border-white/5 bg-black">
      <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 py-10 sm:py-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="flex items-center gap-4 mb-3">
              <div className="size-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shadow-2xl glass transform rotate-3">
                <TerminalSquareIcon className="size-6 text-emerald-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter text-gradient leading-none">
                Welcome back, {user?.firstName || "there"}.
              </h1>
            </div>
            <p className="text-neutral-500 text-lg ml-16 font-medium animate-in fade-in slide-in-from-left-4 duration-1000 delay-500">
              Ready to write some <span className="text-emerald-500 font-bold">clean code</span> today?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
