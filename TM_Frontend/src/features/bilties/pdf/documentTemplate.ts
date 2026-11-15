export type DocumentTemplate = {
  carrierName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  title: string;
  copyLabel: string;
  riskNotice: string;
  terms: string;
  accent: string;
  logoDataUrl: string;
  currency: string;
  paperSize: string;
  orientation: string;
  dateLocale: string;
  numberPrefix: string;
  footerText: string;
  labels: Record<string, string>;
  visible: Record<string, boolean>;
};
export const defaultDocumentTemplate: DocumentTemplate = {
  carrierName: "Your transport business",
  tagline: "Goods transport & logistics",
  address: "",
  phone: "",
  email: "",
  gstin: "",
  title: "GOODS CONSIGNMENT NOTE",
  copyLabel: "CONSIGNEE COPY",
  riskNotice: "AT OWNER’S RISK",
  currency: "Rs.",
  paperSize: "A4",
  orientation: "portrait",
  dateLocale: "en-IN",
  numberPrefix: "#",
  footerText: "We are not responsible for leakage or breakage unless noted on the consignment.",
  terms:
    "The consignment covered by this note is subject to the terms and conditions stated by the carrier. Please verify the package count and condition at delivery.",
  accent: "#a74135",
  logoDataUrl: "",
  labels: {
    number: "No.",
    date: "Date",
    consignor: "Consignor’s Name & Address",
    consignorGst: "GSTIN",
    consignee: "Consignee’s Name & Address",
    consigneeGst: "GSTIN",
    delivery: "Delivery at",
    transport: "T. No.",
    from: "From",
    to: "To",
    goods: "Said to contain",
    packages: "No. of packages",
    chargedWeight: "Charged weight",
    actualWeight: "Actual weight",
    vehicle: "Vehicle number",
    driver: "Driver name & phone",
    rate: "Rate",
    freight: "Freight",
    toPay: "To pay",
    paid: "Paid",
    biltyCharge: "Bilty charge",
    additional: "Additional charges",
    total: "Total",
    declaredValue: "Value of goods",
    gstPayer: "GST will be paid by",
    gstConsignor: "Consignor",
    gstConsignee: "Consignee",
    detailsHeading: "Consignment details",
    remarks: "Remarks",
    consignorSign: "Consignor signature",
    consigneeSign: "Consignee signature",
    carrierSign: "For carrier",
  },
  visible: {
    consignorGst: true,
    consigneeGst: true,
    vehicle: true,
    driver: true,
    delivery: true,
    transport: true,
    from: true,
    to: true,
    chargedWeight: true,
    actualWeight: true,
    rate: true,
    biltyCharge: true,
    additional: true,
    declaredValue: true,
    remarks: true,
    gstPayer: true,
  },
};
