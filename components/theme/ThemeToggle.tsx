"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

function setHtmlTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const initial =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
          ? "dark"
          : "light";
    setHtmlTheme(initial);
    setTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("theme", next);
    setHtmlTheme(next);
    setTheme(next);
  };

  // Avoid showing wrong icon before hydration.
  if (!mounted) return null;

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

