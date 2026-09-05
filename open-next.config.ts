import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Cloudflare Worker CI runs `npm run build`, which is `opennextjs-cloudflare build`.
 * OpenNext then runs `buildCommand`. The default `npm run build` would recurse forever.
 */
export default {
  ...defineCloudflareConfig(),
  buildCommand: "npx next build",
};
