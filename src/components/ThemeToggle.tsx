// components/ThemeToggle.tsx
import React from "react";

function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
  }, [theme]);

  return (
    <button
      aria-label="Alternar tema"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className="text-lg">{theme === "light" ? "🌙" : "☀️"}</span>
    </button>
  );
}

export default ThemeToggle;
