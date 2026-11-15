import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, messageFromError } from "../../../shared/api/client";
import type { User } from "../../../shared/types";
import { defaultDocumentTemplate, type DocumentTemplate } from "../../bilties/pdf/documentTemplate";
import { downloadBiltyPdf } from "../../bilties/pdf/downloadBiltyPdf";
import type { Bilty } from "../../../shared/types";
import { WorkspaceLayout } from "../../../shared/components/layout/WorkspaceLayout";

const settingFields: [keyof DocumentTemplate, string][] = [
  ["carrierName", "Carrier / company name"],
  ["tagline", "Business description"],
  ["address", "Business address"],
  ["phone", "Phone number"],
  ["email", "Email address"],
  ["gstin", "Carrier GSTIN"],
  ["title", "Document title"],
  ["copyLabel", "Copy label"],
  ["riskNotice", "Risk notice"],
  ["accent", "Brand color"],
  ["terms", "Terms and conditions"],
];
const labelFields = Object.entries(defaultDocumentTemplate.labels) as [
  keyof DocumentTemplate["labels"],
  string,
][];
const visibilityFields: [string, string][] = [
  ["consignorGst", "Show consignor GSTIN"],
  ["consigneeGst", "Show consignee GSTIN"],
  ["vehicle", "Show vehicle number"],
  ["driver", "Show driver details"],
  ["delivery", "Show delivery location"],
  ["transport", "Show transport number"],
  ["from", "Show origin"],
  ["to", "Show destination"],
  ["chargedWeight", "Show charged weight"],
  ["actualWeight", "Show actual weight"],
  ["rate", "Show freight rate"],
  ["biltyCharge", "Show bilty charge"],
  ["additional", "Show additional charges"],
  ["declaredValue", "Show declared goods value"],
  ["remarks", "Show remarks"],
  ["gstPayer", "Show GST responsibility"],
];
export function DocumentSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [template, setTemplate] = useState<DocumentTemplate>(defaultDocumentTemplate);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get("/me"), api.get("/bilty-template")])
      .then(([u, t]) => {
        setUser(u.data.user);
        const saved = t.data.template || {};
        setTemplate({
          ...defaultDocumentTemplate,
          carrierName: saved.carrierName || u.data.user.buisnessName,
          phone: saved.phone || u.data.user.phoneNumber,
          email: saved.email || u.data.user.email,
          ...saved,
          labels: { ...defaultDocumentTemplate.labels, ...saved.labels },
          visible: { ...defaultDocumentTemplate.visible, ...saved.visible },
        });
      })
      .catch((e) => setError(messageFromError(e)))
      .finally(() => setLoading(false));
  }, []);
  const set = (key: keyof DocumentTemplate, value: string) =>
    setTemplate((t) => ({ ...t, [key]: value }));
  async function logo(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPEG, or WebP image for the logo.");
      return;
    }
    if (file.size > 1000000) {
      setError("Logo file must be smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("logoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  }
  function preview() {
    const sample: Bilty = {
      id: 0,
      biltyNumber: 101,
      consignorName: "Sample consignor",
      consignorGST: "27ABCDE1234F1Z5",
      consignorAddress: "Industrial Area, Pune",
      consigneeName: "Sample consignee",
      consigneeGST: "24ABCDE1234F1Z4",
      consigneeAddress: "Market Road, Surat",
      vehicleNumber: "MH 12 AB 4821",
      driverName: "Demo Driver",
      driverPhone: "9876543210",
      deliveryAt: "Surat Depot",
      transportNumber: "LR-101",
      fromLocation: "Pune",
      toLocation: "Surat",
      goodsDescription: "Machine components",
      quantity: 18,
      weight: 740,
      chargedWeight: 760,
      actualWeight: 740,
      freightRate: 11,
      freight: 8450,
      paidFreight: 1000,
      biltyCharge: 50,
      additionalCharge: 0,
      declaredValue: 125000,
      gstPaidBy: "Consignor",
      remarks: "Handle with care",
      status: "Created",
      createdAt: new Date().toISOString(),
    };
    downloadBiltyPdf(sample, template);
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await api.put("/bilty-template", { template });
      setNotice("Your document template is saved to your account.");
    } catch (e) {
      setError(messageFromError(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <WorkspaceLayout
      title="Bilty PDF design"
      subtitle="Set the carrier details, labels, terms and fields printed on every consignment note."
      user={user}
    >
      <form className="card" onSubmit={save} style={{ maxWidth: 1020 }}>
        {loading ? (
          <div className="loading">Loading your saved document settings…</div>
        ) : (
          <>
            <div className="panel-title">Your document identity</div>
            <div className="panel-sub">
              These settings belong to your account and are used for your bilties only.
            </div>
            {error && <div className="error-banner">{error}</div>}
            {notice && <div className="notice">{notice}</div>}
            <div className="form-grid" style={{ marginTop: 18 }}>
              {settingFields.slice(0, 6).map(([key, label]) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <input
                    required={key === "carrierName"}
                    type={key === "accent" ? "color" : "text"}
                    value={String(template[key])}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </div>
              ))}
              <div className="form-field">
                <label>Document title</label>
                <input value={template.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="form-field">
                <label>Copy label</label>
                <input
                  value={template.copyLabel}
                  onChange={(e) => set("copyLabel", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Risk notice</label>
                <input
                  value={template.riskNotice}
                  onChange={(e) => set("riskNotice", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Brand color</label>
                <input
                  type="color"
                  value={template.accent}
                  onChange={(e) => set("accent", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Number prefix</label>
                <input
                  value={template.numberPrefix}
                  onChange={(e) => set("numberPrefix", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Currency marker</label>
                <input
                  value={template.currency}
                  onChange={(e) => set("currency", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Paper size</label>
                <select
                  value={template.paperSize}
                  onChange={(e) => set("paperSize", e.target.value)}
                >
                  <option>A4</option>
                  <option>Letter</option>
                  <option>Legal</option>
                </select>
              </div>
              <div className="form-field">
                <label>Page orientation</label>
                <select
                  value={template.orientation}
                  onChange={(e) => set("orientation", e.target.value)}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div className="form-field">
                <label>Date format</label>
                <select
                  value={template.dateLocale}
                  onChange={(e) => set("dateLocale", e.target.value)}
                >
                  <option value="en-IN">India (DD/MM/YYYY)</option>
                  <option value="en-GB">Day first</option>
                  <option value="en-US">Month first</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Terms and conditions printed near the top</label>
                <textarea
                  rows={4}
                  value={template.terms}
                  onChange={(e) => set("terms", e.target.value)}
                />
              </div>
              <div className="form-field full">
                <label>Footer / liability text</label>
                <textarea
                  rows={2}
                  value={template.footerText}
                  onChange={(e) => set("footerText", e.target.value)}
                />
              </div>
              <div className="form-field full">
                <label>Company logo</label>
                <input type="file" accept="image/*" onChange={(e) => logo(e.target.files?.[0])} />
                {template.logoDataUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={template.logoDataUrl}
                      alt="Logo preview"
                      style={{ maxWidth: 115, maxHeight: 65, objectFit: "contain" }}
                    />
                    <button
                      className="btn light"
                      type="button"
                      onClick={() => set("logoDataUrl", "")}
                    >
                      Remove logo
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-section">Printed field labels</div>
            <div className="form-grid">
              {labelFields.map(([key, label]) => (
                <div className="form-field" key={key}>
                  <label>{`Label · ${label}`}</label>
                  <input
                    value={template.labels[key] ?? ""}
                    onChange={(e) =>
                      setTemplate((t) => ({ ...t, labels: { ...t.labels, [key]: e.target.value } }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="form-section">Fields shown on every PDF</div>
            <div className="form-grid">
              {visibilityFields.map(([key, label]) => (
                <label
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 12,
                    color: "#555765",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={template.visible[key] !== false}
                    onChange={(e) =>
                      setTemplate((t) => ({
                        ...t,
                        visible: { ...t.visible, [key]: e.target.checked },
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="form-actions">
              <button type="button" className="btn light" onClick={preview}>
                Preview PDF
              </button>
              <button className="btn" disabled={saving}>
                {saving ? "Saving…" : "Save PDF design"}
              </button>
            </div>
            <p className="stat-foot" style={{ textAlign: "right" }}>
              Each bilty’s PDF uses the saved settings for your account. In the print dialog choose
              “Save as PDF” to download.
            </p>
          </>
        )}
      </form>
    </WorkspaceLayout>
  );
}
