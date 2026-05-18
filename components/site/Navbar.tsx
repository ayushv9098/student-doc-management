"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-200 bg-white text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        {/* Logo / Title */}
        <Link href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 font-bold text-white shadow-sm dark:bg-white dark:text-black sm:h-10 sm:w-10">
            <span className="text-lg">AV</span>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-base">
              Ayushman Academy
            </div>
            <div className="hidden text-[10px] font-medium text-zinc-500 uppercase tracking-wider sm:block">
              Student Records
            </div>
          </div>
        </Link>

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