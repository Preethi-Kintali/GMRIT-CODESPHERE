import { Link, useLocation } from "react-router";
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  TerminalSquareIcon,
  UserCircleIcon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import NotificationBell from "./NotificationBell";

function Navbar({ children }) {
  const location = useLocation();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
            <TerminalSquareIcon className="size-4 text-white" />
          </div>

          <span className="font-semibold text-white tracking-wide text-sm hidden lg:inline">
            GMRIT CodeSphere
          </span>
        </Link>

        {children}

        <div className="flex items-center gap-1">
          {/* PROBLEMS PAGE LINK */}
          <Link
            to={"/problems"}
            className={`px-3 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2
              ${
                isActive("/problems")
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            <BookOpenIcon className="size-4" />
            <span className="hidden sm:inline">Problems</span>
          </Link>

          {/* DASHBOARD PAGE LINK */}
          <Link
            to={"/dashboard"}
            className={`px-3 py-2 flex items-center gap-2 rounded-md transition-colors text-sm font-medium
              ${
                isActive("/dashboard")
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            <LayoutDashboardIcon className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* PROFILE PAGE LINK */}
          <Link
            to={"/profile"}
            className={`px-3 py-2 flex items-center gap-2 rounded-md transition-colors text-sm font-medium
              ${
                isActive("/profile")
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            <UserCircleIcon className="size-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          {/* ADMIN PAGE LINK */}
          {isAdmin && (
            <Link
              to={"/admin"}
              className={`px-3 py-2 flex items-center gap-2 rounded-md transition-colors text-sm font-medium
                \${
                  location.pathname.startsWith("/admin")
                    ? "bg-purple-500/10 text-purple-400"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <LayoutDashboardIcon className="size-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="ml-1 sm:ml-4 sm:pl-4 sm:border-l border-white/10 flex items-center h-8 gap-3">
            <NotificationBell />
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
