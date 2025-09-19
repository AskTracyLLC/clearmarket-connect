import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Info = {
  envUrlHint: string;
  envAnonProvided: boolean;
  sessionUserId: string | null;
  error?: string | null;
};

export default function Health() {
  const [info, setInfo] = useState<Info>({
    envUrlHint:
      (import.meta as any).env?.VITE_SUPABASE_URL || "(using defaults from client.ts)",
    envAnonProvided: !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
    sessionUserId: null,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setInfo((prev) => ({ ...prev, sessionUserId: session?.user?.id ?? null }));
      } catch (e: any) {
        setInfo((prev) => ({ ...prev, error: String(e?.message ?? e) }));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Health</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <p style={{ opacity: 0.7 }}>
        Tip: If <code>envUrlHint</code> shows “(using defaults from client.ts)”, your app is
        using the built-in Supabase URL/key we preserved earlier. That’s okay.
      </p>
    </div>
  );
}
