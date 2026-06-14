import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";
const STORAGE_KEY = "xplore-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
    setMounted(true);

    // Listen for system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const next: Theme = mq.matches ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative h-10 w-[52px] rounded-full border border-border bg-secondary hover:border-primary/40 transition-all duration-300 flex items-center px-1"
      suppressHydrationWarning
    >
      {/* Track */}
      <span
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isDark
            ? "bg-gradient-to-r from-indigo-950/60 to-primary/30"
            : "bg-gradient-to-r from-amber-100/60 to-accent-gold/20"
        }`}
      />

      {/* Thumb */}
      <span
        className={`relative z-10 h-7 w-7 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
          isDark
            ? "translate-x-[22px] bg-primary text-primary-foreground"
            : "translate-x-0 bg-accent-gold text-white"
        }`}
      >
        {/* Icon transition */}
        <span className={`absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`}>
          <Moon className="h-3.5 w-3.5" />
        </span>
        <span className={`absolute transition-all duration-300 ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}>
          <Sun className="h-3.5 w-3.5" />
        </span>
      </span>

      {/* Stars (dark) / rays (light) decoration */}
      {mounted && (
        <>
          <span className={`absolute left-2 top-2 h-1 w-1 rounded-full bg-white/60 transition-all duration-500 ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
          <span className={`absolute left-3 bottom-2.5 h-0.5 w-0.5 rounded-full bg-white/50 transition-all duration-500 delay-75 ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
        </>
      )}
    </button>
  );
}
