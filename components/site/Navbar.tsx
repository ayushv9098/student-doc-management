"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="sticky inset-x-0 top-0 z-50 w-full border-b border-zinc-200 bg-white text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-white md:fixed">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black font-bold text-white dark:bg-white dark:text-black sm:h-9 sm:w-9">
            SD
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-semibold">Student Docs</div>
            <div className="hidden text-xs text-zinc-500 dark:text-zinc-300 sm:block">
              Manage records and uploads
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link className="hover:text-zinc-600 dark:hover:text-zinc-200" href="/">
            Dashboard
          </Link>
          <Link className="hover:text-zinc-600 dark:hover:text-zinc-200" href="/students">
            Students
          </Link>
          <Link className="hover:text-zinc-600 dark:hover:text-zinc-200" href="/students/new">
            Add Student
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className={cn(
              "rounded-md border border-zinc-200 px-2.5 py-1.5 text-[11px] font-medium sm:px-3 sm:py-2 sm:text-xs",
              "hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            )}
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}

