import { useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">C</span>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight mb-1">Check your email</h1>
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. Click the link to set a new password.
                </p>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  className="text-foreground font-semibold hover:underline"
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black tracking-tight mb-1">Forgot password?</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full font-bold" disabled={loading || !email}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Send reset link
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          <Link href="/login">
            <span className="text-foreground font-semibold hover:underline cursor-pointer inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
