import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function Pending() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock className="h-9 w-9 text-amber-500" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Awaiting Approval</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Hi <strong>{profile?.full_name}</strong>, your account is pending admin approval.
            You'll be able to access your client portal once the admin reviews your request.
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account details</p>
          <p className="text-sm"><span className="text-muted-foreground">Email: </span>{profile?.email}</p>
          <p className="text-sm"><span className="text-muted-foreground">Name: </span>{profile?.full_name}</p>
          <p className="text-sm flex items-center gap-1.5">
            <span className="text-muted-foreground">Status: </span>
            <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending
            </span>
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
