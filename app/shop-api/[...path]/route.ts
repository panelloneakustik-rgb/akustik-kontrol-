import { NextRequest } from "next/server";
import { REMOTE_API_BASE } from "@/lib/config";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const dest = new URL(`${REMOTE_API_BASE}/${path.join("/")}`);
  dest.search = new URL(req.url).search;
  if (!dest.pathname.endsWith("/")) dest.pathname += "/";

  const headers = new Headers();
  headers.set("Accept", req.headers.get("accept") || "application/json");
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const init: RequestInit = { method: req.method, headers, redirect: "follow" };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(dest, init);
  const out = new Headers();
  res.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "transfer-encoding" || k === "content-encoding") return;
    out.set(key, value);
  });
  return new Response(res.body, { status: res.status, headers: out });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
