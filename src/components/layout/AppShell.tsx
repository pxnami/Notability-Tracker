import { Github, Menu, Moon, Search, Sun, X } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LiveDataProvider } from "../../data/live";
import { useTheme } from "../../lib/preferences";

const NAV_ITEMS = [
  ["/", "Overview"],
  ["/bugs", "Bugs & fixes"],
  ["/features", "Features"],
  ["/roadmap", "Roadmap"],
  ["/releases", "Releases"],
  ["/activity", "Updates"],
  ["/sources", "Sources"],
  ["/settings", "Settings"],
];
export function AppShell() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
          document.getElementById("main")?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      <div className="announcement">
        An independent view of what's next.{" "}
        <a href="https://notability.com" target="_blank" rel="noreferrer">
          Not affiliated with Notability ↗
        </a>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <NavLink
            to="/"
            className="brand"
            aria-label="Notability Tracker home"
          >
            <img
              src={`${import.meta.env.BASE_URL}notability.png`}
              width="36"
              height="36"
              alt=""
            />
            <span>
              notability<span className="brand-tracker">tracker</span>
            </span>
          </NavLink>
          <form
            className="global-search"
            onSubmit={(event) => {
              event.preventDefault();
              navigate(`/activity?q=${encodeURIComponent(search)}`);
            }}
          >
            <Search size={18} />
            <input
              type="search"
              aria-label="Search everything"
              placeholder="Search the tracker"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>
          <div className="header-actions">
            <a
              className="icon-button"
              href="https://github.com/pxnami/Notability-Tracker"
              title="GitHub repository"
              aria-label="GitHub repository"
            >
              <Github size={20} />
            </a>
            <button
              className="icon-button"
              title="Toggle theme"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="icon-button menu-button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="main-nav"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav
          id="main-nav"
          aria-label="Main navigation"
          className={`main-nav ${open ? "is-open" : ""}`}
        >
          {NAV_ITEMS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main" tabIndex={-1} className="main-content">
        <LiveDataProvider>
          <Outlet />
        </LiveDataProvider>
      </main>
      <footer className="site-footer">
        <div>
          <strong>notability tracker.</strong>
          <p>Community-built. Source-backed.</p>
        </div>
        <p>
          Independent project by <a href="https://github.com/pxnami">pxnami</a>.
          <br />
          Notability is a trademark of Ginger Labs.
        </p>
        <div>
          <NavLink to="/sources">Our sources</NavLink>
          <NavLink to="/settings">Preferences</NavLink>
        </div>
      </footer>
    </div>
  );
}
