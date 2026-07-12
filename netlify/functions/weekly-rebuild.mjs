// Scheduled weekly (see netlify.toml) — triggers a fresh build so the
// security news feed on /resources/ stays current.
// Requires BUILD_HOOK_URL env var: create a build hook under
// Site settings > Build & deploy > Build hooks, then add its URL as an
// environment variable named BUILD_HOOK_URL.
export default async () => {
  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) {
    console.error("BUILD_HOOK_URL is not set; skipping scheduled rebuild.");
    return new Response("BUILD_HOOK_URL not configured", { status: 500 });
  }
  const res = await fetch(hook, { method: "POST" });
  console.log(`Triggered weekly rebuild: ${res.status}`);
  return new Response("Rebuild triggered", { status: 200 });
};
