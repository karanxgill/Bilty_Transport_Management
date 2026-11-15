import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Logo } from "../../../shared/components/brand/Logo";

export function Navbar() {
  const navigate = useNavigate();

  const pages = [
    { title: "Features", key: 1 },
    { title: "How it Works", key: 2 },
    { title: "About", key: 3 },
  ];

  return (
    <div className="w-full px-6 py-3">
      <nav className="w-full bg-surface flex sticky top-0 z-50 items-center justify-between border border-slate-300 shadow-lg rounded-xl px-6 py-3">
        <div className="">
          <Logo size={150} />
        </div>
        <div className="flex gap-5 items-center ">
          {pages.map((item) => (
            <span key={item.key}>{item.title}</span>
          ))}

          <Button
            varient={"primary"}
            size={"lg"}
            text={"Get Started"}
            onClick={() => navigate("/signup")}
          />
        </div>
      </nav>
    </div>
  );
}
