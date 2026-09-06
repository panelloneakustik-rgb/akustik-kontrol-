"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
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

const ENV_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://api.akustikkontrol.com.tr/api";

export default function GoogleSignInButton({ redirectTo = "/hesabim" }: { redirectTo?: string }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [clientId, setClientId] = useState(ENV_CLIENT_ID);
  const [configReady, setConfigReady] = useState(Boolean(ENV_CLIENT_ID));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ENV_CLIENT_ID) return;
    let cancelled = false;
    fetch(`${API_BASE}/auth/google/config/`)
      .then((res) => res.json())
      .then((data: { client_id?: string | null }) => {
        if (!cancelled && data.client_id) setClientId(data.client_id);
      })
      .catch(() => {
        if (!cancelled) setError("Google girişi şu an yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setConfigReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const initGoogle = useCallback(() => {
    if (!clientId || !window.google || !buttonRef.current || started.current) return;
    started.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,
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
  }, [clientId, loginWithGoogle, redirectTo, router]);

  useEffect(() => {
    started.current = false;
    initGoogle();
  }, [initGoogle]);

  if (configReady && !clientId) {
    return (
      <p className="text-xs text-ink/40 text-center">
        Google girişi yapılandırılmadı.
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
