import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, messageFromError } from "../../../shared/api/client";
import type { User } from "../../../shared/types";
import { WorkspaceLayout } from "../../../shared/components/layout/WorkspaceLayout";

const textGroups = [
  {
    title: "Consignor and consignee",
    fields: [
      ["consignorName", "Consignor name", "Business or sender name"],
      ["consignorGST", "Consignor GSTIN", "15 character GSTIN"],
      ["consignorAddress", "Consignor address", "Full pickup address"],
      ["consigneeName", "Consignee name", "Business or receiver name"],
      ["consigneeGST", "Consignee GSTIN", "15 character GSTIN"],
      ["consigneeAddress", "Consignee address", "Full delivery address"],
    ],
  },
  {
    title: "Route and transport",
    fields: [
      ["transportNumber", "Transport number", "LR / transport reference"],
      ["deliveryAt", "Delivery at", "Delivery location"],
      ["fromLocation", "From", "Origin city or depot"],
      ["toLocation", "To", "Destination city or depot"],
      ["vehicleNumber", "Vehicle number", "e.g. MH 12 AB 1234"],
      ["driverName", "Driver name", "Full name"],
      ["driverPhone", "Driver phone", "10 digit number"],
    ],
  },
  {
    title: "Goods and charges",
    fields: [
      ["goodsDescription", "Goods description", "What is being transported?"],
      ["quantity", "Number of packages", "Package count"],
      ["weight", "Weight (kg)", "Total weight"],
      ["chargedWeight", "Charged weight (kg)", "Optional"],
      ["actualWeight", "Actual weight (kg)", "Optional"],
      ["freightRate", "Rate (₹ / kg)", "Optional; used to calculate To pay"],
      [
        "freight",
        "To pay (₹)",
        "Calculated from chargeable weight × rate; enter manually when rate is blank",
      ],
      ["paidFreight", "Freight paid (₹)", "Optional"],
      ["biltyCharge", "Bilty charge (₹)", "Optional"],
      ["additionalCharge", "Additional charges (₹)", "Optional"],
      ["declaredValue", "Declared value (₹)", "Optional"],
    ],
  },
] as const;
const numeric = new Set([
  "quantity",
  "weight",
  "chargedWeight",
  "actualWeight",
  "freightRate",
  "freight",
  "paidFreight",
  "biltyCharge",
  "additionalCharge",
  "declaredValue",
]);
export function CreateBiltyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [values, setValues] = useState<Record<string, string>>({
    status: "Created",
    gstPaidBy: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const chargeableWeight = Number(values.chargedWeight || values.weight || 0);
  const calculatedFreight =
    values.freightRate && chargeableWeight
      ? Number((chargeableWeight * Number(values.freightRate)).toFixed(2))
      : null;
  useEffect(() => {
    api
      .get("/me")
      .then((r) => setUser(r.data.user))
      .catch(() => {});
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...values };
      for (const key of numeric) payload[key] = values[key] ? Number(values[key]) : undefined;
      if (calculatedFreight !== null) payload.freight = calculatedFreight;
      payload.gstPaidBy = values.gstPaidBy || undefined;
      const r = await api.post("/create-bilty", payload);
      navigate("/bilties", { state: { created: r.data.bilty?.biltyNumber } });
    } catch (e) {
      setError(messageFromError(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <WorkspaceLayout
      title="Create a bilty"
      subtitle="Capture the delivery and charge details that appear on your consignment note."
      user={user}
    >
      <form className="card" onSubmit={submit} style={{ maxWidth: 1040 }}>
        <div className="panel-title">New consignment</div>
        <div className="panel-sub">
          Your account’s PDF format will be applied when you print or download the bilty.
        </div>
        {error && <div className="error-banner">{error}</div>}
        {textGroups.map((group) => (
          <section key={group.title}>
            <div className="form-section">{group.title}</div>
            <div className="form-grid">
              {group.fields.map(([key, label, placeholder]) => (
                <div className="form-field" key={key}>
                  <label>
                    {label}
                    {[
                      "consignorName",
                      "consignorGST",
                      "consigneeName",
                      "consigneeGST",
                      "vehicleNumber",
                      "driverName",
                      "driverPhone",
                      "goodsDescription",
                      "quantity",
                      "weight",
                    ].includes(key) && " *"}
                  </label>
                  <input
                    type={numeric.has(key) ? "number" : "text"}
                    required={
                      [
                        "consignorName",
                        "consignorGST",
                        "consigneeName",
                        "consigneeGST",
                        "vehicleNumber",
                        "driverName",
                        "driverPhone",
                        "goodsDescription",
                        "quantity",
                        "weight",
                      ].includes(key) ||
                      (key === "freight" && calculatedFreight === null)
                    }
                    min={
                      numeric.has(key)
                        ? key === "quantity"
                          ? "1"
                          : key === "weight" || key === "freight"
                            ? "0.01"
                          : "0"
                        : undefined
                    }
                    maxLength={key.endsWith("GST") ? 15 : key === "driverPhone" ? 10 : undefined}
                    minLength={key.endsWith("GST") ? 15 : key === "driverPhone" ? 10 : undefined}
                    step={key === "quantity" ? "1" : numeric.has(key) ? "any" : undefined}
                    placeholder={placeholder}
                    value={
                      key === "freight" && calculatedFreight !== null
                        ? String(calculatedFreight)
                        : (values[key] ?? "")
                    }
                    readOnly={key === "freight" && calculatedFreight !== null}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [key]:
                          key.endsWith("GST") || key === "vehicleNumber"
                            ? e.target.value.toUpperCase()
                            : e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="form-field" style={{ maxWidth: 320, marginTop: 18 }}>
          <label>GST responsibility</label>
          <select
            value={values.gstPaidBy}
            onChange={(e) => setValues((v) => ({ ...v, gstPaidBy: e.target.value }))}
          >
            <option value="">Choose for this consignment</option>
            <option>Consignor</option>
            <option>Consignee</option>
          </select>
        </div>
        <div className="form-section">Status and remarks</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Initial status</label>
            <select
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
            >
              <option>Created</option>
              <option>Pending</option>
              <option>Delivered</option>
            </select>
          </div>
          <div className="form-field">
            <label>Remarks for the note</label>
            <input
              placeholder="Optional handling or delivery note"
              value={values.remarks ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, remarks: e.target.value }))}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn light" onClick={() => navigate("/bilties")}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Creating…" : "Create bilty"}
          </button>
        </div>
      </form>
    </WorkspaceLayout>
  );
}
