import { CheckIcon } from "../../../shared/components/icons/GeneralIcons";
import {
  BiltiesIcon,
  CustomersIcon,
  SearchIcon,
  VehiclesIcon,
} from "../../../shared/components/icons/SidebarIcons";
import biltyflowfeature from "../../../shared/assets/home/features/biltyflow-feature.png";

export const FeaturesArray = [
  {
    key: 1,
    cardIcon: <BiltiesIcon size="size-15" color="#a78bfa" />,
    title: "Create Digital Bilties",
    description:
      "Generate professional bilties in seconds with consignor, consignee, vehicle and freight details. No more handwritten records.",
    pointerIcon: <CheckIcon />,
    pointers: ["Create Digital bilties", "Find Records in seconds", "Share details easily"],

    counter: "01",
    image: biltyflowfeature,
    right: true,
  },
  {
    key: 2,
    cardIcon: <SearchIcon size="size-15" color="#a78bfa" />,
    title: "Manage & Track Bilties",
    description:
      "View, search, filter and sort all your bilties from a clean and powerful dashboard Stay updated at every step.",
    pointerIcon: <CheckIcon />,
    pointers: [
      "Advanced search & filters",
      "Real-time status tracking",
      "Clear and organized records",
    ],
    counter: "02",
    image: biltyflowfeature,
    right: false,
  },
  {
    key: 3,
    cardIcon: <CustomersIcon size="size-15" color="#a78bfa" />,
    title: "Customer Management",
    description:
      "Keep all your consignor and consignee details in one place. Save time and avoid repetitive data entry.",
    pointerIcon: <CheckIcon />,
    pointers: [
      "Add and manage customers",
      "Quick access while creating bilties",
      "Maintain complete history",
    ],
    counter: "03",
    image: biltyflowfeature,
    right: true,
  },
  {
    key: 4,
    cardIcon: <VehiclesIcon size="size-15" color="#a78bfa" />,
    title: "Vehicle Management",
    description:
      "GMaintain your vehicle and driver details with ease. Link them with bilties for better tracking and records.",
    pointerIcon: <CheckIcon />,
    pointers: ["Add and manage vehicles", "Store driver information", "Track vehicle usage"],
    counter: "04",
    image: biltyflowfeature,
    right: false,
  },
];
