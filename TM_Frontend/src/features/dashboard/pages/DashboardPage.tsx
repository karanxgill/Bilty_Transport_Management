import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, messageFromError } from "../../../shared/api/client";
import type { Bilty, User } from "../../../shared/types";
import {
  EmptyState,
  StatusPill,
  WorkspaceLayout,
} from "../../../shared/components/layout/WorkspaceLayout";

export function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    Promise.all([api.get("/me"), api.get("/dashboard")])
      .then(([u, b]) => {
        setUser(u.data.user);
        setBilties(b.data.getBilties);
      })
      .catch((e) => setError(messageFromError(e)))
      .finally(() => setLoading(false));
  }, []);
  const delivered = bilties.filter((b) => b.status === "Delivered").length;
  const pending = bilties.filter((b) => b.status === "Pending").length;
  const freight = bilties.reduce((sum, b) => sum + Number(b.freight), 0);
  return (
    <WorkspaceLayout
      title="Overview"
      user={user}
      subtitle="A clear view of what’s moving across your business."
    >
      {error && <div className="error-banner">{error}</div>}
      <div className="dashboard-banner">
        <div>
          <h2>{user ? `Good to see you, ${user.firstName}.` : "Your business, in motion."}</h2>
          <p>Create a bilty or check the latest movement across your fleet.</p>
        </div>
        <button className="btn" onClick={() => navigate("/bilties/create")}>
          ＋ &nbsp; Create a bilty
        </button>
      </div>
      <div className="stat-grid">
        {[
          ["Total bilties", bilties.length, "▤", "All records in your workspace"],
          ["In transit", pending, "↗", "Currently marked pending"],
          ["Delivered", delivered, "✓", "Completed consignments"],
          [
            "Total freight",
            `₹${freight.toLocaleString("en-IN")}`,
            "₹",
            "Across all recorded bilties",
          ],
        ].map(([label, value, icon, foot]) => (
          <div className="card stat-card" key={String(label)}>
            <div className="stat-top">
              <span>{label}</span>
              <span className="stat-icon">{icon}</span>
            </div>
            <div className="stat-value">{loading ? "—" : value}</div>
            <div className="stat-foot">{foot}</div>
          </div>
        ))}
      </div>
      <div className="two-col">
        <div className="card">
          <div className="panel-title">Recent bilties</div>
          <div className="panel-sub">Your latest transport records</div>
          {loading ? (
            <div className="loading">Loading your bilties…</div>
          ) : bilties.length === 0 ? (
            <EmptyState
              title="Your first bilty starts here"
              text="Add your first consignment to start tracking deliveries and freight in one place."
              action={
                <button className="btn" onClick={() => navigate("/bilties/create")}>
                  Create bilty
                </button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>BILTY</th>
                    <th>CONSIGNEE</th>
                    <th>VEHICLE</th>
                    <th>STATUS</th>
                    <th>FREIGHT</th>
                  </tr>
                </thead>
                <tbody>
                  {bilties
                    .slice()
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 6)
                    .map((b) => (
                      <tr key={b.id} onClick={() => navigate("/bilties")}>
                        <td className="bilty-id">BL-{String(b.biltyNumber).padStart(4, "0")}</td>
                        <td>{b.consigneeName}</td>
                        <td>{b.vehicleNumber}</td>
                        <td>
                          <StatusPill status={b.status} />
                        </td>
                        <td>₹{Number(b.freight).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <button className="action-link" onClick={() => navigate("/bilties")}>
              View all bilties →
            </button>
          </div>
        </div>
        <div className="card">
          <div className="panel-title">Quick actions</div>
          <div className="panel-sub">Common tasks for your workspace</div>
          <div className="activity-list">
            {[
              ["＋", "Create a bilty", "Record a new consignment", "/bilties/create"],
              ["▤", "Browse bilties", "Search and update records", "/bilties"],
              ["♧", "View customers", "See consignor & consignee history", "/customers"],
              ["▱", "View vehicles", "Review vehicles and drivers", "/vehicles"],
            ].map(([icon, label, detail, path]) => (
              <button
                className="activity-item"
                key={path}
                onClick={() => navigate(path)}
                style={{ width: "100%", background: "none", border: 0, textAlign: "left" }}
              >
                <span className="activity-dot">{icon}</span>
                <span className="activity-copy">
                  <b>{label}</b>
                  <small>{detail}</small>
                </span>
                <span className="muted">→</span>
              </button>
            ))}
          </div>
          <p className="stat-foot" style={{ marginTop: 14 }}>
            {pending} consignments currently pending
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
