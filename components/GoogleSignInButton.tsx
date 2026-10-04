"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  cacheGoogleClientId,
  loadGsiScript,
  readCachedGoogleClientId,
} from "@/components/GsiPreload";
import { API_BASE } from "@/lib/config";

const ENV_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();

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
          renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

let gsiCallback: ((credential: string) => void) | null = null;
let gsiInitializedFor: string | null = null;

export default function GoogleSignInButton({ redirectTo = "/hesabim" }: { redirectTo?: string }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef(loginWithGoogle);
  const redirectRef = useRef(redirectTo);
  loginRef.current = loginWithGoogle;
  redirectRef.current = redirectTo;

  const [clientId, setClientId] = useState(ENV_CLIENT_ID);
  const [configReady, setConfigReady] = useState(Boolean(ENV_CLIENT_ID));
  const [error, setError] = useState<string | null>(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    gsiCallback = (credential: string) => {
      setError(null);
      void loginRef
        .current(credential)
        .then(() => router.push(redirectRef.current))
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Google ile giriş başarısız.");
        });
    };
    return () => {
      gsiCallback = null;
    };
  }, [router]);

  useEffect(() => {
    if (ENV_CLIENT_ID) {
      cacheGoogleClientId(ENV_CLIENT_ID);
      return;
    }
    const cached = readCachedGoogleClientId();
    if (cached) {
      setClientId(cached);
      setConfigReady(true);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/auth/google/config/`)
      .then((res) => res.json())
      .then((data: { client_id?: string | null }) => {
        if (cancelled) return;
        if (data.client_id) {
          cacheGoogleClientId(data.client_id);
          setClientId(data.client_id);
        }
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

  useEffect(() => {
    if (!clientId) return;
    const host = buttonRef.current;
    if (!host) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;

    const markPainted = () => {
      if (host.querySelector("iframe")) setPainted(true);
    };

    const draw = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      if (host.querySelector("iframe")) {
        markPainted();
        return;
      }
      if (gsiInitializedFor !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          ux_mode: "popup",
          callback: (response) => {
            gsiCallback?.(response.credential);
          },
        });
        gsiInitializedFor = clientId;
      }
      host.innerHTML = "";
      const width = Math.min(
        400,
        Math.max(280, Math.floor(host.getBoundingClientRect().width || 320))
      );
      window.google.accounts.id.renderButton(host, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        locale: "tr",
        width,
      });
      markPainted();
    };

    observer = new MutationObserver(markPainted);
    observer.observe(host, { childList: true, subtree: true });

    void loadGsiScript()
      .then(() => {
        if (cancelled) return;
        draw();
        window.setTimeout(() => {
          if (!cancelled && !host.querySelector("iframe")) draw();
        }, 400);
      })
      .catch(() => {
        if (!cancelled) setError("Google butonu yüklenemedi. Sayfayı yenile.");
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [clientId]);

  if (configReady && !clientId) {
    return (
      <p className="text-xs text-ink/40 text-center">
        Google girişi yapılandırılmadı.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {!painted && !error && (
        <p className="text-xs text-ink/40 text-center">Google yükleniyor…</p>
      )}
      <div ref={buttonRef} className="flex min-h-11 w-full max-w-[400px] justify-center" />
      {error && <p className="text-xs text-burgundy text-center">{error}</p>}
    </div>
  );
}
