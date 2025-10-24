import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function htmlPage(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Cache-Control" content="no-store" />
  <title>${title}</title>
  <link rel="canonical" href="https://useclearmarket.io/reset-password" />
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
    .wrap { min-height: 100vh; display: grid; place-items: center; background: #0b0b0b; color: #fff; }
    .card { width: min(92vw, 560px); background: #161616; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,.35); }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0 0 16px; color: #c9c9c9; }
    a.button { display: inline-block; margin-top: 8px; background: #3b82f6; color: #fff; padding: 12px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    small { color: #9aa0a6; }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="card">
      ${bodyHtml}
    </section>
  </main>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").trim().toLowerCase();
    const go = url.searchParams.get("go");

    if (!email) {
      const html = htmlPage(
        "Reset Link",
        `<h1>Missing email</h1><p>Please request a new password reset from the sign-in page.</p><a class="button" href="https://useclearmarket.io/auth">Go to Sign In</a>`
      );
      return new Response(html, { status: 400, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Human-gated step: show a page requiring a user click before generating a fresh OTP
    if (!go) {
      const clickUrl = new URL(req.url);
      clickUrl.searchParams.set("go", "1");
      const html = htmlPage(
        "Continue to Reset Password",
        `<h1>Continue to Reset</h1><p>Click the button below to generate a fresh, secure reset link.</p><a class="button" href="${clickUrl.toString()}">Continue</a><p><small>If you didn’t request this, you can safely ignore this page.</small></p>`
      );
      return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders } });
    }

    // On explicit user click, generate a new recovery link and redirect to the Supabase action_link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `https://useclearmarket.io/reset-password?email=${encodeURIComponent(email)}`,
      },
    });

    if (error) {
      console.error("gateway generateLink error:", error);
      const html = htmlPage(
        "Reset Error",
        `<h1>Something went wrong</h1><p>We couldn't generate a reset link. Please request a new one from the sign-in page.</p><a class="button" href="https://useclearmarket.io/auth">Go to Sign In</a>`
      );
      return new Response(html, { status: 500, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
    }

    const actionLink = data.properties?.action_link;
    if (!actionLink) {
      const html = htmlPage(
        "Reset Error",
        `<h1>Invalid reset</h1><p>Please request a new password reset from the sign-in page.</p><a class="button" href="https://useclearmarket.io/auth">Go to Sign In</a>`
      );
      return new Response(html, { status: 400, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
    }

    // Redirect user to the real Supabase action link (contains OTP/session tokens)
    return new Response(null, {
      status: 302,
      headers: { Location: actionLink, "Cache-Control": "no-store", ...corsHeaders },
    });
  } catch (err) {
    console.error("reset-link-gateway error:", err);
    const html = htmlPage(
      "Reset Error",
      `<h1>Unexpected error</h1><p>Please try again later or request a new link from the sign-in page.</p><a class="button" href="https://useclearmarket.io/auth">Go to Sign In</a>`
    );
    return new Response(html, { status: 500, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
  }
};

serve(handler);
