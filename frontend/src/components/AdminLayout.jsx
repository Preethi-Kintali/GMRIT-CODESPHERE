import { useState } from "react";
import { Link, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Users, Code, Calendar, Menu, X, ArrowLeft, UserPlus, TerminalSquareIcon } from "lucide-react";

const NAV_LINKS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Create Session", href: "/admin/sessions/create", icon: Calendar },
  { name: "Interviewers", href: "/admin/interviewers", icon: Users },
  { name: "Candidates", href: "/admin/candidates", icon: UserPlus },
  { name: "Availability", href: "/admin/calendar", icon: Calendar },
  { name: "Problems", href: "/admin/problems", icon: Code },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-300 font-sans flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/40 border-r border-white/5 backdrop-blur-xl transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-transparent">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              <TerminalSquareIcon className="size-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-wide text-sm">GMRIT CodeSphere</span>
          </Link>
          <button className="lg:hidden text-neutral-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href || (location.pathname.startsWith(link.href) && link.href !== '/admin');
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium text-sm ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-white/5">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-md text-neutral-400 hover:bg-white/5 hover:text-white transition-colors font-medium text-sm"
            >
              <ArrowLeft size={18} />
              <span>Return to normal</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30 shrink-0">
          <button
            className="lg:hidden text-neutral-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-xs font-semibold px-2 py-1 bg-white/10 text-white rounded border border-white/5 tracking-widest uppercase">
              Admin
            </span>
            <div className="border-l border-white/10 h-8 pl-4 flex items-center">
               <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#000000] text-neutral-300">
          {children}
        </main>
      </div>
    </div>
  );
}
