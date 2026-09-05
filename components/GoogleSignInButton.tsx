"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: string;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

export default function GoogleSignInButton({ redirectTo = "/hesabim" }: { redirectTo?: string }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const initGoogle = useCallback(() => {
    if (!CLIENT_ID || !window.google || !buttonRef.current || started.current) return;
    started.current = true;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      auto_select: false,
      ux_mode: "popup",
      callback: async (response) => {
        setError(null);
        try {
          await loginWithGoogle(response.credential);
          router.push(redirectTo);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Google ile giriş başarısız.");
        }
      },
    });

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      locale: "tr",
      width: String(Math.min(400, Math.max(240, buttonRef.current.parentElement?.clientWidth || 320))),
    });
  }, [loginWithGoogle, redirectTo, router]);

  if (!CLIENT_ID) {
    return (
      <p className="text-xs text-ink/40 text-center">
        Google girişi yapılandırılmadı (NEXT_PUBLIC_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initGoogle} />
      <div ref={buttonRef} className="flex min-h-10 w-full justify-center" />
      {error && <p className="text-xs text-burgundy text-center">{error}</p>}
    </div>
  );
}
