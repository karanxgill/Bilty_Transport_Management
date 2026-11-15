interface InputType {
  type: string;
  placeholder: string;
  ref: React.RefObject<HTMLInputElement | null>;
  text?: string;
}

export function Input({ type, placeholder, ref, text }: InputType) {
  return (
    <div className="flex flex-col gap-2 ">
      {text ? <span className=" text-sm/4 font-bold"> {text} </span> : null}
      <input
        className="w-full px-3 py-4 border border-slate-300 rounded-lg text-sm/3 placeholder:text-[#94A3B8] focus:border-[#6D45D8] focus:ring-2 focus:ring-[#EDE7FF] disabled:cursor-not-allowed disabled:bg-[#F1F5F9]"
        type={type}
        placeholder={placeholder}
        ref={ref}
      />
    </div>
  );
}
