import { useEffect, useMemo, useState } from "react";
import { api } from "../../../shared/api/client";
import type { Bilty, User } from "../../../shared/types";
import { EmptyState, WorkspaceLayout } from "../../../shared/components/layout/WorkspaceLayout";
export function CustomersPage() {
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
  const customers = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        gst: string;
        role: Set<string>;
        bilties: Set<number>;
        freight: number;
        last: string;
      }
    >();
    for (const b of bilties) {
      for (const [name, gst, role] of [
        [b.consignorName, b.consignorGST ?? "", "Consignor"],
        [b.consigneeName, b.consigneeGST ?? "", "Consignee"],
      ] as [string, string, string][]) {
        const key = `${name.toLowerCase()}|${gst}`;
        const item = map.get(key) ?? {
          name,
          gst,
          role: new Set<string>(),
          bilties: new Set<number>(),
          freight: 0,
          last: b.createdAt,
        };
        item.role.add(role);
        item.bilties.add(b.id);
        item.freight += Number(b.freight);
        if (new Date(b.createdAt) > new Date(item.last)) item.last = b.createdAt;
        map.set(key, item);
      }
    }
    return [...map.values()]
      .filter((x) =>
        `${x.name} ${x.gst} ${[...x.role].join(" ")}`.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => b.bilties.size - a.bilties.size);
  }, [bilties, search]);
  return (
    <WorkspaceLayout
      title="Customers"
      subtitle="People and businesses appearing in your consignor and consignee records."
      user={user}
    >
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-top">
            Unique customers<span className="stat-icon">♧</span>
          </div>
          <div className="stat-value">{customers.length}</div>
          <div className="stat-foot">Derived from your bilty history</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            Consignors<span className="stat-icon">↗</span>
          </div>
          <div className="stat-value">{new Set(bilties.map((b) => b.consignorName)).size}</div>
          <div className="stat-foot">Distinct sending businesses</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            Consignees<span className="stat-icon">↘</span>
          </div>
          <div className="stat-value">{new Set(bilties.map((b) => b.consigneeName)).size}</div>
          <div className="stat-foot">Distinct receiving businesses</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            Bilty records<span className="stat-icon">▤</span>
          </div>
          <div className="stat-value">{bilties.length}</div>
          <div className="stat-foot">Source records for this directory</div>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div>
            <div className="panel-title">Customer directory</div>
            <div className="panel-sub">Customer records are built from existing consignments.</div>
          </div>
          <input
            className="field search-field"
            placeholder="Search name or GSTIN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="loading">Loading customer records…</div>
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customer records yet"
            text="Customers will appear here after you add your first bilty."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>BUSINESS / NAME</th>
                  <th>GSTIN</th>
                  <th>TYPE</th>
                  <th>BILTIES</th>
                  <th>RECORDED FREIGHT</th>
                  <th>LAST ACTIVE</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.name + c.gst + i}>
                    <td className="bilty-id">{c.name}</td>
                    <td>{c.gst || <span className="muted">Not provided</span>}</td>
                    <td>{[...c.role].join(" · ")}</td>
                    <td>{c.bilties.size}</td>
                    <td>₹{c.freight.toLocaleString("en-IN")}</td>
                    <td>{new Date(c.last).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
