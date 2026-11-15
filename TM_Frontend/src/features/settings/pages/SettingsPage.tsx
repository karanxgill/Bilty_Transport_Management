import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, messageFromError } from "../../../shared/api/client";
import type { User } from "../../../shared/types";
import { WorkspaceLayout } from "../../../shared/components/layout/WorkspaceLayout";
export function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [values, setValues] = useState<User>({
    firstName: "",
    lastName: "",
    buisnessName: "",
    email: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api
      .get("/me")
      .then((r) => {
        setUser(r.data.user);
        setValues(r.data.user);
      })
      .catch((e) => setError(messageFromError(e)));
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const r = await api.patch("/me", values);
      setUser(r.data.user);
      setValues(r.data.user);
      setSuccess("Your profile has been updated.");
    } catch (e) {
      setError(messageFromError(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <WorkspaceLayout
      title="Settings"
      subtitle="Manage the business profile attached to your workspace."
      user={user}
    >
      <div
        className="two-col"
        style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(230px,.7fr)" }}
      >
        <form className="card" onSubmit={submit}>
          <div className="panel-title">Business profile</div>
          <div className="panel-sub">These details are linked to your account.</div>
          {error && <div className="error-banner">{error}</div>}
          {success && <div className="notice">{success}</div>}
          <div className="form-grid" style={{ marginTop: 20 }}>
            {[
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["buisnessName", "Business name"],
              ["email", "Email address"],
              ["phoneNumber", "Phone number"],
            ].map(([key, label]) => (
              <div className="form-field" key={key}>
                <label>{label}</label>
                <input
                  required
                  type={key === "email" ? "email" : "text"}
                  minLength={key === "phoneNumber" ? 10 : 3}
                  maxLength={key === "phoneNumber" ? 10 : undefined}
                  value={values[key as keyof User]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn" disabled={saving || !user}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
        <div className="card">
          <div className="panel-title">Account</div>
          <div className="panel-sub">Workspace identity and data</div>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-dot">✓</span>
              <span className="activity-copy">
                <b>Protected workspace</b>
                <small>Your records require your account token.</small>
              </span>
            </div>
            <div className="activity-item">
              <span className="activity-dot">▤</span>
              <span className="activity-copy">
                <b>Transport records</b>
                <small>
                  Your bilties, vehicle activity and customer history stay linked to this account.
                </small>
              </span>
            </div>
          </div>
          <div className="stat-foot" style={{ marginTop: 14 }}>
            Profile updates are saved to your account immediately.
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
