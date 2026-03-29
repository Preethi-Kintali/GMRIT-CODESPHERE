import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, TerminalSquareIcon } from "lucide-react";

function WelcomeSection() {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-[#000000]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 py-10 sm:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
                <TerminalSquareIcon className="size-4 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Welcome back, {user?.firstName || "there"}.
              </h1>
            </div>
            <p className="text-neutral-400 text-sm ml-11">
              Ready to write some clean code today?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
