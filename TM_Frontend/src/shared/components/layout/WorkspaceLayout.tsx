import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "../brand/Logo";
import type { User } from "../../types";
import { api } from "../../api/client";

const links = [
  ["Overview", "/dashboard", "▦"],
  ["Bilties", "/bilties", "▤"],
  ["Create bilty", "/bilties/create", "+"],
  ["Customers", "/customers", "♧"],
  ["Vehicles", "/vehicles", "▱"],
  ["Settings", "/settings", "⚙"],
  ["PDF design", "/settings/document", "▧"],
];
export function WorkspaceLayout({
  title,
  subtitle,
  user,
  children,
}: {
  title: string;
  subtitle?: string;
  user?: User | null;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="workspace">
      <aside className="side-rail">
        <div className="brand">
          <Logo size={156} />
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {links.map(([label, to, icon]) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
            >
              <span className="side-icon">{icon}</span>
              {label}
              {label === "Create bilty" && <span className="side-plus">↗</span>}
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="help-card">
            <span className="help-mark">?</span>
            <b>Need a hand?</b>
            <small>We’re here to help you move forward.</small>
            <a href="mailto:support@biltyflow.com">Contact support ↗</a>
          </div>
          <button
            className="side-link signout"
            onClick={async () => {
              await api.post("/signout").catch(() => undefined);
              navigate("/signin");
            }}
          >
            ↪ <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="topbar">
          <div className="crumb">
            BiltyFlow <span>/</span> {title}
          </div>
          <div className="top-actions">
            <span className="secure-label">
              ● <span>Workspace synced</span>
            </span>
            <button className="avatar" onClick={() => navigate("/settings")}>
              {user?.firstName?.[0] ?? "B"}
            </button>
            <div className="profile-name">
              {user ? `${user.firstName} ${user.lastName}` : "Your workspace"}
              <small>{user?.buisnessName ?? "Transport business"}</small>
            </div>
          </div>
        </header>
        <section className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR TRANSPORT DESK</p>
              <h1>{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {children && title !== "Overview" && null}
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`status-pill status-${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">▤</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
