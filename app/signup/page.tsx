"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const router = useRouter();

  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSignup(e: any) {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    // profile save
    await supabase.from("profiles").insert({
      id: data.user?.id,
      school_name: schoolName,
      admin_name: adminName,
    });

    setMsg("Account created successfully");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">School Signup</CardTitle>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <Input
              placeholder="School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
              className="w-full"
            />
            <Input
              placeholder="Admin Name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
              className="w-full"
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
            {msg && (
              <p
                className={`text-sm ${
                  msg.includes("successfully")
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {msg}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?
              <Link href="/login" className="ml-2 underline hover:text-black dark:hover:text-white">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}