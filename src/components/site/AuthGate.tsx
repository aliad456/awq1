import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import AuthButton from "@/components/site/AuthButton";

/**
 * Gates children behind a signed-in Supabase session.
 * Renders a Google sign-in screen when there is no user.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        טוען…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold">התחברות נדרשת</h2>
        <p className="text-sm text-muted-foreground">
          התחבר עם חשבון Google כדי להיכנס למשחק ולשמור את ההתקדמות שלך.
        </p>
        <AuthButton />
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGate;
