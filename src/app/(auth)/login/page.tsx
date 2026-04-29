"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HardHat, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary">
            <HardHat className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="leading-none">
            <span className="text-base font-bold text-sidebar-foreground">ProGate</span>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest mt-0.5">Cornerstone Construction</p>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-sidebar-foreground leading-tight">
            Every project.<br />Every team.<br />One platform.
          </h1>
          <p className="text-sidebar-foreground/60 text-sm leading-relaxed max-w-xs">
            ProGate gives Cornerstone&apos;s teams a single place to manage projects, track daily work, and keep everyone aligned — from the executive suite to the job site.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "4", label: "Active Projects" },
            { value: "$31M+", label: "Under Management" },
            { value: "100%", label: "On-Time Delivery" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-sidebar-accent/50 p-4">
              <p className="text-2xl font-bold text-sidebar-foreground">{stat.value}</p>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <HardHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ProGate</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Access your Cornerstone workspace</p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@cornerstone.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo credentials hint */}
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-xs space-y-2">
            <p className="font-medium text-foreground">Demo credentials</p>
            <div className="space-y-1 text-muted-foreground font-mono">
              <p>exec@cornerstone.demo</p>
              <p>pm@cornerstone.demo</p>
              <p>field@cornerstone.demo</p>
              <p className="pt-1 font-sans text-xs">Password: <span className="font-mono">Password123!</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
