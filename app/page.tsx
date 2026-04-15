"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadStudentsFromSupabase } from "@/lib/students";

export default function Home() {
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState(0);
  const [recent, setRecent] = React.useState<Array<{
    id: string;
    fullName: string;
    mobile: string;
    className: string;
  }>>([]);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const students = await loadStudentsFromSupabase();
        const sorted = students.slice().sort((a, b) => b.createdAt - a.createdAt);
        setCount(students.length);
        setRecent(
          sorted.slice(0, 20).map((s) => ({
            id: s.id,
            fullName: s.fullName,
            mobile: s.mobile,
            className: s.className,
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Black/white minimal UI with modern layout.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row">
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link href="/students">View Students</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/students/new">+ Add student</Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-h-[200px] lg:col-span-1">
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              <div className="text-4xl font-bold text-black dark:text-white">{count}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Added</CardTitle>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Latest students (scroll to view more).
            </p>
          </CardHeader>
          <CardContent className="pt-3">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                No students yet. Click &quot;Add&quot; to create your first student.
              </div>
            ) : (
              <div className="max-h-[300px] space-y-2 overflow-y-auto">
                {recent.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
                    <div className="min-w-0">
                      <div className="font-medium">{s.fullName}</div>
                      <div className="truncate text-xs text-zinc-500">{s.className} • {s.mobile}</div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link href={`/students/${encodeURIComponent(s.id)}`}>Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}