import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../../shared/api/client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    api.get("/me").then(
      () => active && setAuthorized(true),
      () => active && setAuthorized(false),
    );
    return () => { active = false; };
  }, []);

  if (authorized === null) return <main className="loading">Checking your session…</main>;
  return authorized ? children : <Navigate to="/signin" replace />;
}
