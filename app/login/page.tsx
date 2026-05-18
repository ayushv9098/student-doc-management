"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setPending(false);

    if (error) {
      console.error("Full Login Error:", error);
      
      if (error.message.includes("Email not confirmed")) {
        setError("Please check your email and confirm your account before logging in. 📧");
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again or Sign Up. ❌");
      } else {
        setError(error.message);
      }
      setPending(false);
      return;
    }

    if (!data?.session) {
      console.error("No session returned after login");
      setError("Login failed. No session created.");
      setPending(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center mt-4">
 New School?
 <a href="/signup" className="ml-2 underline font-medium">
   Sign Up
 </a>
</p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}