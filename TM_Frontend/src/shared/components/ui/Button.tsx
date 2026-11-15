import type { ReactElement } from "react";

interface ButtonItems {
  varient: "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  text: String;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  fullWidth?: boolean;
}

const varientStyles = {
  primary: "bg-[#6D45D8] hover:bg-[#5B35C5] text-white",
  secondary: "bg-white border border-[#E2E8F0] text-[#101A2B] hover:bg-[#F8FAFC]",
  ghost: "bg-[#F3EEFF] text-[#6D45D8] hover:bg-[#EDE7FF]",
  danger: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
};

const sizeStyle = {
  sm: "px-2 py-1",
  md: "px-3 py-2",
  lg: "px-4 py-2",
};

const defaultStyles = "rounded-xl p-4 flex items-center font-light cursor-pointer font-medium";

export function Button(props: ButtonItems) {
  return (
    <button
      onClick={props.onClick}
      className={`${varientStyles[props.varient]} ${sizeStyle[props.size]} ${defaultStyles} `}
    >
      {props.startIcon ? <div className="pr-2">{props.startIcon}</div> : null}
      {props.text}
    </button>
  );
}
