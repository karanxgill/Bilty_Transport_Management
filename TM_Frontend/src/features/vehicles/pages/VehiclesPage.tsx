import { useEffect, useMemo, useState } from "react";
import { api } from "../../../shared/api/client";
import type { Bilty, User } from "../../../shared/types";
import {
  EmptyState,
  StatusPill,
  WorkspaceLayout,
} from "../../../shared/components/layout/WorkspaceLayout";
export function VehiclesPage() {
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/me")])
      .then(([b, u]) => {
        setBilties(b.data.getBilties);
        setUser(u.data.user);
      })
      .finally(() => setLoading(false));
  }, []);
  const vehicles = useMemo(() => {
    const map = new Map<
      string,
      { vehicle: string; driver: string; phone: string; bilties: Bilty[]; freight: number }
    >();
    bilties.forEach((b) => {
      const v = map.get(b.vehicleNumber) ?? {
        vehicle: b.vehicleNumber,
        driver: b.driverName,
        phone: b.driverPhone,
        bilties: [],
        freight: 0,
      };
      v.bilties.push(b);
      v.driver = b.driverName;
      v.phone = b.driverPhone;
      v.freight += Number(b.freight);
      map.set(b.vehicleNumber, v);
    });
    return [...map.values()]
      .filter((v) =>
        `${v.vehicle} ${v.driver} ${v.phone}`.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => b.bilties.length - a.bilties.length);
  }, [bilties, search]);
  return (
    <WorkspaceLayout
      title="Vehicles"
      subtitle="Vehicle and driver activity recorded on your bilties."
      user={user}
    >
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-top">
            Vehicles in records<span className="stat-icon">▱</span>
          </div>
          <div className="stat-value">{new Set(bilties.map((b) => b.vehicleNumber)).size}</div>
          <div className="stat-foot">Distinct registration numbers</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            Drivers in records<span className="stat-icon">♙</span>
          </div>
          <div className="stat-value">{new Set(bilties.map((b) => b.driverPhone)).size}</div>
          <div className="stat-foot">Distinct driver phone numbers</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            Transport records<span className="stat-icon">▤</span>
          </div>
          <div className="stat-value">{bilties.length}</div>
          <div className="stat-foot">Bilties linked to vehicles</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            Freight recorded<span className="stat-icon">₹</span>
          </div>
          <div className="stat-value">
            ₹{bilties.reduce((s, b) => s + Number(b.freight), 0).toLocaleString("en-IN")}
          </div>
          <div className="stat-foot">Across recorded vehicle trips</div>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div>
            <div className="panel-title">Fleet activity</div>
            <div className="panel-sub">Vehicles are grouped from your bilty records.</div>
          </div>
          <input
            className="field search-field"
            placeholder="Search vehicle or driver…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="loading">Loading vehicle records…</div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="No vehicle activity yet"
            text="Vehicle details will appear after you create a bilty."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>DRIVER</th>
                  <th>PHONE</th>
                  <th>TRIPS</th>
                  <th>RECORDED FREIGHT</th>
                  <th>LATEST STATUS</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => {
                  const latest = v.bilties
                    .slice()
                    .sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    )[0];
                  return (
                    <tr key={v.vehicle}>
                      <td className="bilty-id">{v.vehicle}</td>
                      <td>{v.driver}</td>
                      <td>{v.phone}</td>
                      <td>{v.bilties.length}</td>
                      <td>₹{v.freight.toLocaleString("en-IN")}</td>
                      <td>
                        <StatusPill status={latest.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
