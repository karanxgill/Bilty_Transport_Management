import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../../shared/components/brand/Logo";
import { api, messageFromError } from "../../../shared/api/client";
import signupImage from "../../../shared/assets/auth/signup-visual.png";
export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/signin", { email, password });
      navigate("/dashboard");
    } catch (e) {
      setError(messageFromError(e));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-form">
        <Link className="auth-brand" to="/">
          <Logo size={165} />
        </Link>
        <div className="auth-content">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Sign in to BiltyFlow</h1>
          <p>Your transport desk is ready when you are.</p>
          <form onSubmit={submit}>
            {error && <div className="error-banner">{error}</div>}
            <div className="form-field">
              <label>Email address</label>
              <input
                required
                type="email"
                autoComplete="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input
                required
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="auth-foot">
            New to BiltyFlow? <Link to="/signup">Create an account</Link>
          </div>
        </div>
        <div className="auth-foot">© 2026 BiltyFlow · Transport, made clearer.</div>
      </section>
      <aside className="auth-visual">
        <img src={signupImage} alt="BiltyFlow workspace preview" />
        <div className="auth-quote">One calm place for every consignment, customer, and trip.</div>
      </aside>
    </div>
  );
}
