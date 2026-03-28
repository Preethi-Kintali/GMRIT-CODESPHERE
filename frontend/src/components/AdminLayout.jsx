import { useState } from "react";
import { Link, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Users, Code, Calendar, Menu, X, ArrowLeft, UserPlus } from "lucide-react";

const NAV_LINKS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Create Session", href: "/admin/sessions/create", icon: Calendar },
  { name: "Interviewers", href: "/admin/interviewers", icon: Users },
  { name: "Candidates", href: "/admin/candidates", icon: UserPlus },
  { name: "Add Problem", href: "/admin/problems/new", icon: Code },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base-100 flex font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-200 border-r border-base-300 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-base-300 bg-base-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-content shadow-sm">
              C
            </div>
            <span className="font-semibold text-lg tracking-tight text-base-content">Admin System</span>
          </div>
          <button className="lg:hidden btn btn-ghost btn-sm btn-circle" onClick={() => setSidebarOpen(false)}>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? "bg-primary text-primary-content shadow-sm shadow-primary/20"
                    : "text-base-content/70 hover:bg-base-300/50 hover:text-base-content"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-base-300/50">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base-content/60 hover:bg-base-300/50 hover:text-base-content transition-all font-medium text-sm"
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
        <header className="h-16 flex items-center justify-between px-6 border-b border-base-300 bg-base-100/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <button
            className="lg:hidden btn btn-ghost btn-sm btn-circle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-base-100 text-base-content">
          {children}
        </main>
      </div>
    </div>
  );
}
