import { useEffect, useState, type ReactNode } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { themes } from "../astryx-themes";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-neutral/theme.css";
// Keep the existing saved/system preference as the single source of appearance.
export function LabAppearance({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  useEffect(() => {
    const sync = () => {
      const value = document.documentElement.dataset.theme;
      if (value === "light" || value === "dark") setMode(value);
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <Theme theme={themes.neutral} mode={mode}>
      {children}
    </Theme>
  );
}
