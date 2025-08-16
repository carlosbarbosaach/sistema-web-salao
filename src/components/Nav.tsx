// components/Nav.tsx
import { NavLink } from "react-router-dom";

// util simples para concatenar classes (você pode centralizar em utils/classNames.ts se quiser)
function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

// tipo NavItem (pode ser extraído para um arquivo types/nav.ts)
type NavItem = { to: string; label: string };

function Nav({ items }: { items: NavItem[] }) {
  return (
    <nav
      className="hidden md:flex items-center gap-1 lg:gap-2"
      aria-label="Principal"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default Nav;
