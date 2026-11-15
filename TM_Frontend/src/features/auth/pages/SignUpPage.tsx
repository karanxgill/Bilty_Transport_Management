import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../../shared/components/brand/Logo";
import { api, messageFromError } from "../../../shared/api/client";
import signupImage from "../../../shared/assets/auth/signup-visual.png";
export function SignUpPage() {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    buisnessName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/signup", values);
      navigate("/signin", { state: { registered: true } });
    } catch (e) {
      setError(messageFromError(e));
    } finally {
      setLoading(false);
    }
  }
  const update = (key: keyof typeof values, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));
  return (
    <div className="auth-page">
      <section className="auth-form">
        <Link className="auth-brand" to="/">
          <Logo size={165} />
        </Link>
        <div className="auth-content">
          <p className="eyebrow">GET STARTED</p>
          <h1>Create your account</h1>
          <p>Set up your workspace for digital transport records.</p>
          <form onSubmit={submit}>
            {error && <div className="error-banner">{error}</div>}
            <div className="form-grid">
              <div className="form-field">
                <label>First name</label>
                <input
                  required
                  minLength={3}
                  autoComplete="given-name"
                  placeholder="First name"
                  value={values.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Last name</label>
                <input
                  required
                  minLength={3}
                  autoComplete="family-name"
                  placeholder="Last name"
                  value={values.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="form-field">
              <label>Business name</label>
              <input
                required
                minLength={3}
                placeholder="Your transport business"
                value={values.buisnessName}
                onChange={(e) => update("buisnessName", e.target.value)}
              />
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Email address</label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@business.com"
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Phone number (+91)</label>
                <input
                  required
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="10 digit number"
                  inputMode="numeric"
                  value={values.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
            </div>
            <div className="form-field">
              <label>Password</label>
              <input
                required
                type="password"
                minLength={12}
                maxLength={72}
                pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,72}"
                autoComplete="new-password"
                placeholder="12–72 characters, upper, lower, number & symbol"
                value={values.password}
                onChange={(e) => update("password", e.target.value)}
              />
              <small className="muted">Use uppercase, lowercase, a number and a symbol.</small>
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <div className="auth-foot">
            Already have an account? <Link to="/signin">Sign in</Link>
          </div>
        </div>
        <div className="auth-foot">© 2026 BiltyFlow · Transport, made clearer.</div>
      </section>
      <aside className="auth-visual">
        <img src={signupImage} alt="BiltyFlow workspace preview" />
        <div className="auth-quote">Less paperwork. More time to keep your business moving.</div>
      </aside>
    </div>
  );
}
