import { useEffect, useState } from "react";
export function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("kafka-lab-theme");
      } catch {
        /* Theme remains usable without storage. */
      }
      const next =
        stored === "light" || stored === "dark"
          ? stored
          : media.matches
            ? "dark"
            : "light";
      apply(next);
    };
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  function apply(next: string) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "dark" ? "#0b111b" : "#f7f9fc");
  }
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem("kafka-lab-theme", next);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }
  return (
    <div className="theme-control">
      <button
        className="theme-toggle"
        type="button"
        aria-label="Dark mode"
        aria-pressed={theme === "dark"}
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        onClick={toggle}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          {theme === "dark" ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
            </>
          ) : (
            <path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z" />
          )}
        </svg>
      </button>
      {!saved && (
        <span className="theme-warning" role="status">
          Theme will not persist after refresh.
        </span>
      )}
    </div>
  );
}
