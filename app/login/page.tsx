"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getFirebase } from "@/lib/firebase";

export default function LoginPage() { 
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const firebase = getFirebase();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firebase) {
      setError("Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* environment variables.");
      return;
    }
    setPending(true);
    try {
      await signInWithEmailAndPassword(firebase.auth, email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            {!firebase ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Add your Firebase web config to <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">.env.local</code>{" "}
                to enable sign-in.
              </p>
            ) : null}
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Email</span>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Password</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
              />
            </label>
            {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={pending || !firebase}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
