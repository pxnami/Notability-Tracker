import { Bell, Bug, ClipboardList, Gauge, Languages, LayoutDashboard, Menu, Moon, Newspaper, Rss, Search, Settings, Sparkles, Sun, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useMemo, useState } from "react";
import { clsx } from "clsx";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/bugs", label: "Bug Tracker", icon: Bug },
  { to: "/features", label: "Feature Requests", icon: Sparkles },
  { to: "/roadmap", label: "Roadmap", icon: ClipboardList },
  { to: "/releases", label: "Release Notes", icon: Newspaper },
  { to: "/community", label: "Community", icon: Users },
  { to: "/activity", label: "Activity Feed", icon: Rss },
  { to: "/sources", label: "Sources", icon: Gauge },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState("EN");
  const rootClass = useMemo(() => (dark ? "dark" : ""), [dark]);

  return (
    <div className={rootClass}>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <aside className={clsx("fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-notability-500 text-white shadow-soft">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="text-lg font-semibold">Notability Tracker</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Independent intelligence</p>
            </div>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition", isActive ? "bg-notability-50 text-notability-700 dark:bg-notability-500/15 dark:text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900")
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open navigation">
                <Menu size={20} />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-notability-500 dark:border-slate-800 dark:bg-slate-900" placeholder="Search bugs, features, releases, and sources" />
              </div>
              <button className="hidden rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 sm:inline-flex" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800 sm:inline-flex" onClick={() => setLanguage(language === "EN" ? "DE" : "EN")}>
                <Languages size={16} /> {language}
              </button>
              <button className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
