# Deploying igm-it.com to Netlify

One-time setup, roughly 20 minutes. Everything after this is automatic:
push to GitHub → Netlify rebuilds → site updates.

## 1. Push to GitHub

```bash
gh repo create igm-site --private --source . --push
```

(or create an empty repo on github.com and `git remote add origin … && git push -u origin main`)

## 2. Create the Netlify site

1. netlify.com → **Add new site → Import an existing project → GitHub** → pick `igm-site`.
2. Build settings are auto-detected from `netlify.toml` (command `npm run build`, publish `_site`). Deploy.

## 3. Enable the admin login (Netlify Identity + Git Gateway)

1. Site configuration → **Identity** → Enable Identity.
2. Identity → Registration → set to **Invite only**.
3. Identity → Services → **Enable Git Gateway**.
4. Identity → **Invite users** → invite Josh's email (and yours). He sets a password
   from the invite email and can then log in at `https://igm-it.com/admin/`.

> Note: Netlify Identity is in maintenance mode but fully functional. If Netlify ever
> retires it, swap `backend: git-gateway` in `src/admin/config.yml` to the `github`
> backend with an OAuth app — 10-minute change, content and admin UI stay identical.

## 4. Verify the contact form

Netlify detects the form on first deploy (Site configuration → Forms should list
`consult-inquiry`). Submit a test from the live site and check it appears.

## 5. Route inquiries to Josh's inbox

The **destination address is set in the site admin** (`/admin/` → Site Settings →
Business Info & Stats → *Inquiry notification email*), so Josh can point it at his
marketing inbox, personal inbox, whatever — no dashboard access needed. Delivery
goes through Resend (free tier: 3,000 emails/mo, far beyond what a contact form sees):

1. Create a free account at [resend.com](https://resend.com).
2. Resend → Domains → Add `igm-it.com` and add the DNS records it shows
   (same registrar visit as step 7 — do them together).
3. Resend → API Keys → create a key (permission: Sending access).
4. Netlify → Site configuration → Environment variables → add
   `RESEND_API_KEY` = that key.
5. Optional: `INQUIRY_FROM` env var to change the sender
   (default `IronGate Website <inquiries@igm-it.com>`).

Safety net: every submission is *also* stored under Site configuration → Forms in
the Netlify dashboard, even if email sending is misconfigured or down. You can
additionally add a dashboard email notification there as a backup channel if wanted.

## 6. Weekly news refresh

1. Site configuration → Build & deploy → **Build hooks** → Add build hook
   (name it `weekly-news`), copy the URL.
2. Site configuration → Environment variables → add `BUILD_HOOK_URL` = that URL.

The scheduled function (`netlify/functions/weekly-rebuild.mjs`, Mondays 06:00 UTC)
then refreshes the security feed automatically. To change the cadence, edit the
`schedule` cron in `netlify.toml`.

## 7. Custom domain

1. Site configuration → Domain management → Add custom domain → `igm-it.com`.
2. At the domain registrar, point DNS at Netlify (they show the exact records —
   either Netlify DNS nameservers, or an A/ALIAS + CNAME pair).
3. HTTPS certificate provisions automatically once DNS propagates.

## 8. (Later) Metrics

Options, cheapest first:
- **GoatCounter / Plausible / Umami** — privacy-friendly, no cookie banner needed;
  add one `<script>` tag to `base.njk` + allow its domain in the CSP in `netlify.toml`.
- **Netlify Analytics** ($9/mo) — server-side, zero code, sees all traffic even
  with ad blockers.
