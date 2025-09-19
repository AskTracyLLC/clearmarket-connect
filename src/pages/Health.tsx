import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Info = {
  envUrlHint: string;
  envAnonProvided: boolean;
  sessionUserId: string | null;
  db: "ok" | "error" | "unknown";
  error?: string | null;
};

export default function Health() {
  const [info, setInfo] = useState<Info>({
    envUrlHint:
      (import.meta as any).env?.VITE_SUPABASE_URL
        ? "env provided"
        : "(using defaults from client.ts)",
    envAnonProvided: !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
    sessionUserId: null,
    db: "unknown",
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase
          .from("users") // any table that exists is fine; errors will show in JSON
          .select("count", { count: "exact", head: true });

        setInfo((prev) => ({
          ...prev,
          sessionUserId: session?.user?.id ?? null,
          db: error ? "error" : "ok",
          error: error ? error.message : null,
        }));
      } catch (e: any) {
        setInfo((prev) => ({
          ...prev,
          db: "error",
          error: String(e?.message ?? e),
        }));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Health</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <p style={{ opacity: 0.7 }}>
        If <code>envUrlHint</code> shows “(using defaults from client.ts)”, you’re using the
        preserved Supabase values (safe).
      </p>
    </div>
  );
}
