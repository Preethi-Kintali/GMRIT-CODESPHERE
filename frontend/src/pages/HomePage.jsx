import { Link } from "react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  Code2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
  TerminalSquareIcon,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

function HomePage() {
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect_url") || "/dashboard";

  return (
    <div className="min-h-screen bg-black text-neutral-300 selection:bg-emerald-500/30 selection:text-white font-sans overflow-x-hidden">
      {/* BACKGROUND MESH */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none opacity-50 z-0" />
      {/* NAVBAR */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link
            to={"/"}
            className="flex items-center gap-3 transition-all hover:opacity-80 group"
          >
            <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-colors">
              <TerminalSquareIcon className="size-4 text-white group-hover:text-emerald-400 transition-colors" />
            </div>

            <span className="font-semibold text-white tracking-wide text-sm">
              GMRIT <span className="text-emerald-500">CodeSphere</span>
            </span>
          </Link>

          {/* AUTH BTN */}
          <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
            <button className="px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Get Started
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-[2px] animate-in fade-in slide-in-from-top-4 duration-1000">
            <SparklesIcon className="size-3" />
            <span>The new standard for pair programming</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-[1] text-gradient animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Code together, <br className="hidden md:block" />
            <span className="text-neutral-600 block mt-2">master interviews.</span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed animate-in fade-in zoom-in duration-1000 delay-300">
            Empowering Talent Through Real-Time Coding and Interactive
            Interviews
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.35)] flex items-center gap-2 group">
                Start Coding Now
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignInButton>

            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2">
              <VideoIcon className="size-4" />
              Watch Demo
            </button>
          </div>

          {/* STATS */}
          <div className="flex items-center gap-12 pt-16 border-t border-white/5 w-full justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-medium text-white">10K+</span>
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                Developers
              </span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-medium text-white">50K+</span>
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                Sessions
              </span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-medium text-white">99.9%</span>
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                Uptime
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REPOSITORY PREVIEW / HERO IMAGE */}
      <div className="relative max-w-5xl mx-auto px-6 pb-32 w-full z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
        <div className="rounded-2xl border border-white/10 bg-black overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <img
            src="/hero.png"
            alt="Code Interface"
            className="w-full h-auto object-cover rounded-2xl transition-all duration-1000 group-hover:scale-[1.01]"
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="border-t border-white/5 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Everything you need. <br /> Nothing you don't.
            </h2>
            <p className="text-neutral-400">
              A distraction-free environment designed for peak focus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card hover:border-emerald-500/30 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <VideoIcon className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  HD Video Comm
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Crystal clear, low-latency video and audio. Talk face-to-face
                  while you code.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card hover:border-blue-500/30 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="size-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Code2Icon className="size-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Real-time Editor
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Synchronized typing, syntax highlighting, and zero lag. Feel
                  like you are on the same machine.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card hover:border-purple-500/30 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="size-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ZapIcon className="size-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Instant Setup
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  No environment configuration. Generate a link and start coding
                  immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HomePage;
