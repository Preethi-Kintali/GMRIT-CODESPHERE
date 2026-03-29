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
  return (
    <div className="min-h-screen bg-[#000000] text-neutral-300 selection:bg-white/10 selection:text-white font-sans">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link
            to={"/"}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              <TerminalSquareIcon className="size-4 text-white" />
            </div>

            <span className="font-semibold text-white tracking-wide text-sm">
              GMRIT CodeSphere
            </span>
          </Link>

          {/* AUTH BTN */}
          <SignInButton mode="modal">
            <button className="btn btn-sm btn-ghost bg-white/10 hover:bg-white/20 text-white border-none flex items-center gap-2">
              Get Started
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400 font-medium tracking-wide">
            <SparklesIcon className="size-3" />
            <span>The new standard for pair programming</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.1]">
            Code together, <br className="hidden md:block" />
            <span className="text-neutral-500">master interviews.</span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
            Empowering Talent Through Real-Time Coding and Interactive
            Interviews
          </p>

          <div className="flex items-center gap-4 pt-4">
            <SignInButton mode="modal">
              <button className="btn btn-primary flex items-center gap-2">
                Start Coding Now
                <ArrowRightIcon className="size-4" />
              </button>
            </SignInButton>

            <button className="btn btn-outline border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-2">
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
      <div className="max-w-5xl mx-auto px-6 pb-32 w-full">
        <div className="rounded-2xl border border-white/10 bg-black overflow-hidden shadow-2xl relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <img
            src="/hero.png"
            alt="Code Interface"
            className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.02]"
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
            <div className="card bg-base-200 border border-base-content/10 hover:border-base-content/30 transition-colors group">
              <div className="card-body">
                <div className="size-10 rounded-lg bg-base-300 flex items-center justify-center mb-6">
                  <VideoIcon className="size-5 text-primary" />
                </div>
                <h3 className="card-title text-lg font-medium text-base-content mb-2">
                  HD Video Comm
                </h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  Crystal clear, low-latency video and audio. Talk face-to-face
                  while you code.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-200 border border-base-content/10 hover:border-base-content/30 transition-colors group">
              <div className="card-body">
                <div className="size-10 rounded-lg bg-base-300 flex items-center justify-center mb-6">
                  <Code2Icon className="size-5 text-primary" />
                </div>
                <h3 className="card-title text-lg font-medium text-base-content mb-2">
                  Real-time Editor
                </h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  Synchronized typing, syntax highlighting, and zero lag. Feel
                  like you are on the same machine.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-200 border border-base-content/10 hover:border-base-content/30 transition-colors group">
              <div className="card-body">
                <div className="size-10 rounded-lg bg-base-300 flex items-center justify-center mb-6">
                  <ZapIcon className="size-5 text-primary" />
                </div>
                <h3 className="card-title text-lg font-medium text-base-content mb-2">
                  Instant Setup
                </h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
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
