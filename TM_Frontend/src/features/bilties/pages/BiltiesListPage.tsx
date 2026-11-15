import { useCallback, useEffect, useState } from "react";
import { api, messageFromError } from "../../../shared/api/client";
import type { Bilty, User } from "../../../shared/types";
import { downloadBiltyPdf } from "../pdf/downloadBiltyPdf";
import type { DocumentTemplate } from "../pdf/documentTemplate";
import { StatusPill, WorkspaceLayout } from "../../../shared/components/layout/WorkspaceLayout";

export function BiltiesListPage() {
  const [rows, setRows] = useState<Bilty[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [template, setTemplate] = useState<Partial<DocumentTemplate> | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/bilties", {
        params: { page, limit: 10, search, status: status || undefined, sort, order: "desc" },
      })
      .then((r) => {
        setRows(r.data.bilties);
        setPages(r.data.paginationData.totalPages || 1);
        setTotal(r.data.paginationData.totalBilties);
        setError("");
      })
      .catch((e) => setError(messageFromError(e)))
      .finally(() => setLoading(false));
  }, [page, search, status, sort]);
  useEffect(() => {
    Promise.all([api.get("/me"), api.get("/bilty-template")])
      .then(([u, t]) => {
        setUser(u.data.user);
        setTemplate({
          ...t.data.template,
          carrierName: t.data.template?.carrierName || u.data.user.buisnessName,
          phone: t.data.template?.phone || u.data.user.phoneNumber,
          email: t.data.template?.email || u.data.user.email,
        });
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);
  async function remove(id: number) {
    if (!window.confirm("Delete this bilty? This cannot be undone.")) return;
    try {
      await api.delete(`/bilties/${id}`);
      load();
    } catch (e) {
      setError(messageFromError(e));
    }
  }
  async function setBiltyStatus(b: Bilty, value: string) {
    try {
      await api.patch(`/bilties/${b.id}`, { status: value });
      load();
    } catch (e) {
      setError(messageFromError(e));
    }
  }
  return (
    <WorkspaceLayout
      title="All bilties"
      subtitle="Search, sort and update every consignment in your records."
      user={user}
    >
      <div className="card">
        <div className="toolbar">
          <input
            className="field search-field"
            placeholder="Search vehicle, consignee, driver or GSTIN…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <select
            className="select"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option>Created</option>
            <option>Pending</option>
            <option>Delivered</option>
          </select>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt">Newest first</option>
            <option value="biltyNumber">Bilty number</option>
            <option value="freight">Freight amount</option>
          </select>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <div className="panel-sub" style={{ marginTop: 15 }}>
          {total} {total === 1 ? "record" : "records"}
        </div>
        {loading ? (
          <div className="loading">Loading records…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No bilties found</h3>
            <p>Try a different search or create a bilty to get started.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>BILTY NO.</th>
                  <th>DATE</th>
                  <th>CONSIGNOR → CONSIGNEE</th>
                  <th>GOODS</th>
                  <th>VEHICLE / DRIVER</th>
                  <th>QTY / WEIGHT</th>
                  <th>FREIGHT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td className="bilty-id">BL-{String(b.biltyNumber).padStart(4, "0")}</td>
                    <td>{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      {b.consignorName}
                      <div className="muted">→ {b.consigneeName}</div>
                    </td>
                    <td>{b.goodsDescription}</td>
                    <td>
                      {b.vehicleNumber}
                      <div className="muted">
                        {b.driverName} · {b.driverPhone}
                      </div>
                    </td>
                    <td>
                      {b.quantity} · {b.weight} kg
                    </td>
                    <td>₹{Number(b.freight).toLocaleString("en-IN")}</td>
                    <td>
                      <select
                        aria-label={`Status for bilty ${b.biltyNumber}`}
                        className="select"
                        value={b.status}
                        onChange={(e) => setBiltyStatus(b, e.target.value)}
                      >
                        <option>Created</option>
                        <option>Pending</option>
                        <option>Delivered</option>
                      </select>
                      <div style={{ marginTop: 5 }}>
                        <StatusPill status={b.status} />
                      </div>
                    </td>
                    <td>
                      <button className="action-link" onClick={() => downloadBiltyPdf(b, template)}>
                        ↓ Download PDF
                      </button>
                      <button className="action-link" onClick={() => remove(b.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pager">
          <span>
            Page {page} of {pages}
          </span>
          <div className="toolbar">
            <button
              className="btn light"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="btn light"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
