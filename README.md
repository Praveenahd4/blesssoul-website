# BlessSoul Website

Marketing site for **blesssoul.com**, the BlessSoul manifestation app (iOS live, Android coming).

## Pages

| Path | File | Styles |
|---|---|---|
| `/` | `index.html` | `site.css` (imports `phones.css`) + `site.js` + `assets/js/moon-table.js` |
| `/get` | `get/index.html` | smart download link, flips to Google Play when `PLAY_LIVE = true` |
| `/support`, `/privacy`, `/terms` | `*/index.html` | `styles.css` (shared by the sub-pages) |

## Homepage (v11, October 2026)

- Sections: hero (live phone + intention composer) → methods strip → **How it works** (copy scrolls while one sticky phone swaps between six real app flows) → **Tonight's sky** (live) → details bento (`#details`) → founder → FAQ → download (App Store + QR to `/get`).
- `phones.css` holds the coded iPhone UIs and is imported by `site.css` into a low-priority CSS layer, so page styles (all prefixed `s-`) always win without `!important`. Edit phone screens in `phones.css`, page layout in `site.css`.
- `site.js` plays each phone flow only while it is visible and restarts it from the beginning when it comes back. On screens under 981px the phones move inline under each step.
- **Nothing on the page is a frozen demo date.** Phone dates, the goal target, the habit calendar, the schedule day and every portal countdown are computed from the visitor's local date.
- Moon phases use the app's own table (`assets/js/moon-table.js`, copied from the iOS `moon_phases.json`, JPL DE421, valid to Jan 2041) and the same 25-phase bucketing as `MoonPhaseCalculator.swift`. All 24 phase images are in `assets/images/moon/`.
- Upcoming events = principal moons from that table + recurring 8/8, 11/11, 12/12 portals + the 2026 sky events listed in `STATIC` in `site.js`. **Add next year's retrogrades/ingresses to `STATIC` before January**, or the list falls back to moons and number portals only.
- Light and dark themes: system by default, toggle remembered in `localStorage` (`bs-theme`).
- No plan, pricing or free/premium language on the homepage, by decision.
- FAQ and app structured data (JSON-LD) are in `<head>`; keep the FAQ JSON in sync if you edit the visible answers.
- Respects `prefers-reduced-motion`.

Static site, no build step. Serve the folder with any static server to preview:

```bash
python3 -m http.server 4173
```

Deploys via GitHub Pages (`CNAME` → www.blesssoul.com).

Previous homepages and internal notes live OUTSIDE this public repo, in `../blesssoul-website-private/` (`backups/v10/` is the version before this redesign). Never commit backups, `.sql` files or notes here: the repo and everything in it is public.

## Security

- `index.html` carries a Content-Security-Policy: scripts only from this site, plus ONE inline script (the theme-before-paint snippet) allowed by its sha256 hash. **If you edit that inline script, recompute the hash** or the theme will stop applying before paint (the browser console will show a CSP error).
- No keys, tokens or database scripts belong in this repo. It is public, and GitHub Pages serves every file in it.
- `_config.yml` keeps README out of the published site.
