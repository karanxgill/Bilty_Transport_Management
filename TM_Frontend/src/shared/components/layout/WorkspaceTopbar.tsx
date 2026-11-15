import { SearchIcon } from "../icons/SidebarIcons";

export function NavbarDash({ firstName, lastName }: { firstName: String; lastName: String }) {
  console.log(lastName);
  const initial = firstName.slice(0, 1);

  return (
    <div className="flex justify-between items-center bg-white">
      <div
        className="flex items-center gap-2 w-110 my-4 mx-3
                rounded-lg border border-[#E2E8F0]
                bg-blue-100 px-3 py-2
                focus-within:border-[#6D45D8]
                focus-within:ring-2
                focus-within:ring-[#EDE7FF]"
      >
        <SearchIcon size={"size-6"} />

        <input
          type="search"
          placeholder="Search bilties by number, vehicle, consignor..."
          className="w-full bg-transparent text-sm
                            text-[#0F172A] placeholder:text-[#94A3B8]
                            outline-none"
        />
      </div>
      <div className="flex items-center gap-5 mr-10">
        <div className="rounded-full bg-slate-200 text-violet-400 font-bold px-4 py-2">
          {initial}
        </div>
        <div>
          {firstName} {lastName}
        </div>
      </div>
    </div>
  );
}
