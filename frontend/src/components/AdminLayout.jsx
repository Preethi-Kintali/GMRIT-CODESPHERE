import { useState } from "react";
import { Link, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Users, Code, Calendar, Menu, X, ArrowLeft } from "lucide-react";

const NAV_LINKS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Create Session", href: "/admin/sessions/create", icon: Calendar },
  { name: "Interviewers", href: "/admin/interviewers", icon: Users },
  { name: "Add Problem", href: "/admin/problems/new", icon: Code },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e1e2e] border-r border-white/5 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 \${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
              C
            </div>
            <span className="font-semibold text-lg tracking-tight">Admin System</span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href || (location.pathname.startsWith(link.href) && link.href !== '/admin');
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all \${
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
              <span className="font-medium text-sm">Return to normal</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#1e1e2e]">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
