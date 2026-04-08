"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebase } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const firebase = getFirebase();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firebase) {
      setError(
        "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* environment variables, then restart the app."
      );
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebase.auth, email.trim(), password);
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Email + password login (Firebase Auth).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Email</div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Password</div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <Button type="submit" disabled={loading || !email || !password} className="w-full">
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <div className="font-medium text-black dark:text-white mb-1">Beginner shortcut</div>
            If Firebase isn’t set up yet, you can still use the UI with localStorage.
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
              Continue to Dashboard
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/students")}>
              Continue to Students
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

