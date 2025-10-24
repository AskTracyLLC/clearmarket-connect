import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Simple gateway page rendered by the SPA to avoid HTML rendering issues on Edge Functions
// Shows a human-gated Continue button that triggers the function to generate a fresh OTP

const FUNCTIONS_BASE = "https://bgqlhaqwsnfhhatxhtfx.functions.supabase.co"; // Supabase project functions URL

const PasswordResetGateway = () => {
  const [params] = useSearchParams();
  const email = params.get("email")?.trim().toLowerCase() || "";

  useEffect(() => {
    document.title = "Continue to Reset Password | ClearMarket";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Click continue to generate a fresh, secure password reset link for your account.");
  }, []);

  const continueHref = useMemo(() => {
    if (!email) return "/auth";
    const u = new URL(`${FUNCTIONS_BASE}/reset-link-gateway`);
    u.searchParams.set("email", email);
    u.searchParams.set("go", "1");
    return u.toString();
  }, [email]);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader>
          <CardTitle className="text-xl">Continue to Reset</CardTitle>
          <CardDescription>Click the button below to generate a fresh, secure reset link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!email && (
            <p className="text-muted-foreground">Missing email address. Please request a new reset link.</p>
          )}
          <div className="flex gap-3">
            <Button asChild className="flex-1" disabled={!email}>
              <a href={continueHref} aria-disabled={!email}>
                Continue
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth">Back to Sign In</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">If you didn’t request this, you can safely ignore this page.</p>
        </CardContent>
      </Card>
    </main>
  );
};

export default PasswordResetGateway;
