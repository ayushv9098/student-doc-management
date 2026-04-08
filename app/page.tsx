"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { loadStudentsFromStorage } from "@/lib/students";

export default function Home() {
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState(0);
  const [recent, setRecent] = React.useState<
    Array<{ id: string; fullName: string; mobile: string; className: string; createdAt: number }>
  >([]);

  React.useEffect(() => {
    setLoading(true);
    try {
      const students = loadStudentsFromStorage();
      const sorted = students.slice().sort((a, b) => b.createdAt - a.createdAt);
      setCount(students.length);
      setRecent(
        sorted.slice(0, 5).map((s) => ({
          id: s.id,
          fullName: s.fullName,
          mobile: s.mobile,
          className: s.className,
          createdAt: s.createdAt,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-white">Dashboard</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Black/white minimal UI with modern layout.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/students">
            <Button variant="outline">View Students</Button>
          </Link>
          <Link href="/students/new">
            <Button>+ Add</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
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
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Latest students (max 5).</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                No students yet. Click “Add” to create your first student.
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  >
                    <div>
                      <div className="font-medium">{s.fullName}</div>
                      <div className="text-xs text-zinc-500">
                        {s.className} • {s.mobile}
                      </div>
                    </div>
                    <Link href={`/students/${encodeURIComponent(s.id)}`}>
                      <Button variant="outline" size="sm">
                        Open
                      </Button>
                    </Link>
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
