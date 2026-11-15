import type { Bilty } from "../../../shared/types";
import { defaultDocumentTemplate, type DocumentTemplate } from "./documentTemplate";

const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
const value = (v: unknown, empty = "—") =>
  v === null || v === undefined || v === "" ? empty : esc(v);
const money = (v: unknown, currency: string) =>
  v === null || v === undefined || v === ""
    ? "—"
    : `${esc(currency)} ${Number(v).toLocaleString("en-IN")}`;
export function downloadBiltyPdf(b: Bilty, savedTemplate?: Partial<DocumentTemplate> | null) {
  const t = {
    ...defaultDocumentTemplate,
    ...savedTemplate,
    labels: { ...defaultDocumentTemplate.labels, ...savedTemplate?.labels },
    visible: { ...defaultDocumentTemplate.visible, ...savedTemplate?.visible },
  } as DocumentTemplate;
  const l = t.labels,
    show = t.visible,
    color = /^#[0-9a-f]{6}$/i.test(t.accent) ? t.accent : defaultDocumentTemplate.accent;
  const pageSize = ["A4", "Letter", "Legal"].includes(t.paperSize) ? t.paperSize : "A4";
  const orientation = t.orientation === "landscape" ? "landscape" : "portrait";
  const locale = ["en-IN", "en-GB", "en-US"].includes(t.dateLocale) ? t.dateLocale : "en-IN";
  const row = (label: string, content: unknown, enabled = true) =>
    enabled ? `<div class="field"><b>${esc(label)}</b><span>${value(content)}</span></div>` : "";
  const header = t.logoDataUrl ? `<img class="logo" src="${esc(t.logoDataUrl)}" alt="">` : "";
  const columns: [string, unknown, boolean?][] = [
    [l.goods, b.goodsDescription],
    [l.packages, b.quantity],
    [l.chargedWeight, b.chargedWeight ?? `${b.weight} kg`, show.chargedWeight],
    [l.actualWeight, b.actualWeight ?? `${b.weight} kg`, show.actualWeight],
    [l.rate, money(b.freightRate, t.currency), show.rate],
    [l.freight, money(b.freight, t.currency)],
  ];
  const rows = `<tr>${columns
    .filter(([, , enabled]) => enabled !== false)
    .map(([label]) => `<th>${esc(label)}</th>`)
    .join("")}</tr><tr>${columns
    .filter(([, , enabled]) => enabled !== false)
    .map(([, content]) => `<td>${value(content)}</td>`)
    .join("")}</tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(t.title)} · ${esc(b.biltyNumber)}</title><style>
    @page{size:${pageSize} ${orientation};margin:11mm}*{box-sizing:border-box}body{font:10px Arial,sans-serif;color:#202020;margin:0}header{border-bottom:3px solid ${color};padding:0 0 11px;display:flex;align-items:center;gap:14px}.logo{max-width:82px;max-height:62px;object-fit:contain}.brand{flex:1}.brand h1{margin:0;color:${color};font-size:26px;letter-spacing:.08em;text-transform:uppercase}.brand .tag{font-size:11px;color:#444;margin-top:3px}.brand .contact{font-size:9px;color:#555;margin-top:5px;line-height:1.5}.copy{border:1px solid ${color};color:${color};padding:5px 8px;font-size:9px;font-weight:bold;align-self:flex-start}.bar{display:flex;justify-content:space-between;align-items:center;margin:10px 0 7px}.bar h2{font-size:15px;color:${color};margin:0}.risk{font-weight:bold;color:${color};font-size:11px}.notice{border:1px solid ${color};padding:6px 8px;color:${color};font-size:9px;line-height:1.4;margin-bottom:9px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:7px 16px}.field{min-height:28px;border-bottom:1px dotted #999;padding:4px 1px;display:grid;grid-template-columns:140px 1fr;gap:5px}.field b{font-size:9px}.field span{font-size:10px;white-space:pre-wrap}.section{margin:10px 0 5px;color:${color};font-weight:bold;text-transform:uppercase;font-size:10px;letter-spacing:.05em}table{width:100%;border-collapse:collapse;margin-top:5px}th,td{border:1px solid #888;padding:7px 6px;text-align:left;vertical-align:top}th{font-size:8px;background:#f7f3f1}td{height:55px}.summary{margin:8px 0 0 auto;width:55%;border-collapse:collapse}.summary td{height:auto;padding:5px}.summary tr:last-child{font-weight:bold;color:${color};font-size:12px}.gstline{margin:9px 0;color:${color};font-weight:bold}.check{font-size:12px}.remarks{min-height:40px}.signatures{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:38px}.signature{border-top:1px solid #777;text-align:center;padding-top:6px;font-size:9px}.footer{border-top:1px solid #ccc;margin-top:14px;padding-top:6px;color:#666;font-size:8px;white-space:pre-wrap}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><header>${header}<div class="brand"><h1>${esc(t.carrierName || "Transport business")}</h1><div class="tag">${esc(t.tagline)}</div><div class="contact">${[t.address, t.phone, t.email, t.gstin ? `GSTIN: ${t.gstin}` : ""].filter(Boolean).map(esc).join(" &nbsp;·&nbsp; ")}</div></div><div class="copy">${esc(t.copyLabel)}</div></header>
  <div class="bar"><h2>${esc(t.title)}</h2><div class="risk">${esc(t.riskNotice)}</div></div><div class="notice">${esc(t.terms)}</div>
  <div class="grid">${row(l.number, `${t.numberPrefix || "#"}${b.biltyNumber}`)}${row(l.date, new Date(b.createdAt || Date.now()).toLocaleDateString(locale))}${row(l.consignor, `${b.consignorName}\n${b.consignorAddress || ""}`)}${row(`${l.consignorGst}:`, b.consignorGST, show.consignorGst)}${row(l.consignee, `${b.consigneeName}\n${b.consigneeAddress || ""}`)}${row(`${l.consigneeGst}:`, b.consigneeGST, show.consigneeGst)}${row(l.delivery, b.deliveryAt, show.delivery)}${row(l.transport, b.transportNumber, show.transport)}${row(l.from, b.fromLocation, show.from)}${row(l.to, b.toLocation, show.to)}${row(l.vehicle, b.vehicleNumber, show.vehicle)}${row(l.driver, `${b.driverName} · ${b.driverPhone}`, show.driver)}</div>
  <div class="section">${esc(l.detailsHeading)}</div><table>${rows}</table><table class="summary"><tr><td>${esc(l.toPay)}</td><td>${money(b.freight, t.currency)}</td></tr><tr><td>${esc(l.paid)}</td><td>${money(b.paidFreight, t.currency)}</td></tr>${show.biltyCharge ? `<tr><td>${esc(l.biltyCharge)}</td><td>${money(b.biltyCharge, t.currency)}</td></tr>` : ""}${show.additional ? `<tr><td>${esc(l.additional)}</td><td>${money(b.additionalCharge, t.currency)}</td></tr>` : ""}<tr><td>${esc(l.total)}</td><td>${money(Number(b.freight || 0) + Number(b.biltyCharge || 0) + Number(b.additionalCharge || 0), t.currency)}</td></tr></table>
  ${show.gstPayer ? `<div class="gstline">${esc(l.gstPayer)} &nbsp; <span class="check">${b.gstPaidBy === "Consignor" ? "☑" : "☐"}</span> ${esc(l.gstConsignor)} &nbsp; <span class="check">${b.gstPaidBy === "Consignee" ? "☑" : "☐"}</span> ${esc(l.gstConsignee)}</div>` : ""}${show.declaredValue ? row(l.declaredValue, money(b.declaredValue, t.currency)) : ""}${show.remarks ? `<div class="field remarks"><b>${esc(l.remarks)}</b><span>${value(b.remarks)}</span></div>` : ""}
  <div class="signatures"><div class="signature">${esc(l.consignorSign)}</div><div class="signature">${esc(l.consigneeSign)}</div><div class="signature">${esc(l.carrierSign)}</div></div><div class="footer">${esc(t.footerText)}</div><script>window.onload=()=>setTimeout(()=>{window.print()},350);window.onafterprint=()=>window.close();</script></body></html>`;
  const win = window.open("", "_blank", "width=920,height=1100");
  if (!win) {
    window.alert("Allow pop-ups for this site to print or save the PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
