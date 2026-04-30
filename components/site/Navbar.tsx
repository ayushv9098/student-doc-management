"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <header className="sticky inset-x-0 top-0 z-50 w-full border-b border-zinc-200 bg-white text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-white md:fixed">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        {/* Logo / Title */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black font-bold text-white dark:bg-white dark:text-black sm:h-9 sm:w-9">
            SD
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-semibold">Ayushman Educational Academy</div>
            <div className="hidden text-xs text-zinc-500 sm:block">Manage records and uploads</div>
          </div>
        </div>

        {/* Navigation Links – hide on login and signup pages */}
        {!isLoginPage && !isSignupPage && (
          <nav className="hidden items-center gap-5 text-sm md:flex">
            <Link href="/" className="hover:text-zinc-600">Dashboard</Link>
            <Link href="/students" className="hover:text-zinc-600">Students</Link>
            <Link href="/students/new" className="hover:text-zinc-600">Add Student</Link>
          </nav>
        )}

        {/* Avatar (simple div) – only show when NOT on login or signup page */}
        {!isLoginPage && !isSignupPage && (
          <Link href="/profile">
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black text-sm font-medium text-white dark:bg-white dark:text-black">
              A
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}