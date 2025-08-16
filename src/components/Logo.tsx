// components/Logo.tsx
import { Link } from "react-router-dom";

function Logo({ name = "MicroSaaS" }: { name?: string }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black">
        <span className="text-sm font-bold">PA</span>
      </span>
      <span className="hidden sm:block font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {name}
      </span>
    </Link>
  );
}

export default Logo;
