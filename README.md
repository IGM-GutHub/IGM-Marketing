# IronGate Managed IT — igm-it.com

Marketing site for IronGate Managed IT, LLC. Static Eleventy site designed for free
Netlify hosting, with a git-based admin panel so Josh can update content himself.

## Stack

- **[Eleventy 3](https://www.11ty.dev/)** — static site generator (Nunjucks templates)
- **[Decap CMS](https://decapcms.org/)** — admin panel at `/admin/` (unlinked; commits edits to git)
- **Netlify** — hosting, form handling, scheduled functions
- No database, no server. Every content change is a git commit → Netlify auto-rebuilds.

## Local development

```bash
npm install
npm run dev     # serves at http://localhost:8090 with live reload
npm run build   # writes static site to _site/
```

## How content editing works

Site content lives in JSON files under `src/_data/`:

| File | What's in it | Where it shows |
|---|---|---|
| `site.json` | Phone, email, address, hours, top-bar text, hero/about stats, footer blurb | Everywhere |
| `certifications.json` | Partner & certification names | Home + About badge strips |
| `testimonials.json` | Customer quotes | Homepage |
| `team.json` | Leadership cards | About page |
| `services.json` | The 7 service sections | Services page + homepage cards* |

\* Homepage service cards are hand-written in `index.njk` (they have custom icons); the
Services page is fully data-driven.

Josh edits these through **`/admin/`** (Decap CMS). Each save commits to the repo,
Netlify rebuilds, and the site updates in ~1 minute. Nothing is ever lost — every
change is in git history.

## Security news feed

`src/_data/news.js` pulls RSS at **build time** from CISA, The Hacker News,
BleepingComputer, and Krebs on Security (max 6 per source, 18 total, newest first).
Dead feeds are skipped without failing the build.

`netlify/functions/weekly-rebuild.mjs` runs every Monday 06:00 UTC (see `netlify.toml`)
and POSTs to a Netlify build hook, so the feed refreshes weekly with zero maintenance.

## Contact form

The form on `/contact/` uses **Netlify Forms** (`data-netlify="true"`), with a honeypot
field for spam. Submissions appear in the Netlify dashboard; email notifications to
Josh's Microsoft 365 inbox are configured in Netlify (see DEPLOY.md step 5).

## Accessibility (WCAG 2.1 AA)

- Semantic landmarks, one `h1` per page, labeled forms, skip-to-content link
- Full keyboard navigation with visible focus rings; mobile nav is a real `<button>`
  with `aria-expanded`, closes on Escape
- `prefers-reduced-motion` respected
- **Contrast**: the design's teal `#1A8F9E` fails AA (3.8:1) for text/buttons on white,
  so all text and button usage shifts one token darker to `#127684` (5.3:1). `#1A8F9E`
  remains for icons and decorative elements only. Muted grays were floored at `#5B7086`.

## Security posture

- Static output — no runtime, no sessions, no credentials on the public site
- Strict security headers in `netlify.toml`: CSP (no inline/external scripts except
  self + fonts), HSTS, frame denial, nosniff, referrer + permissions policies
- Admin auth is handled by Netlify Identity (invite-only) + git-gateway — no password
  logic in this codebase
- Form has honeypot; Netlify applies its own spam filtering (Akismet)

## Before launch checklist

- [ ] Replace placeholder phone numbers / address in `site.json` with Josh's real info
- [ ] Replace image placeholders with real photography (hero, about, services, team)
- [ ] Confirm certification names Josh can legally claim (partner-program rules)
- [ ] Set the form notification email (DEPLOY.md step 5)
- [ ] Point igm-it.com DNS at Netlify (DEPLOY.md step 7)

Deployment: see **DEPLOY.md**.
