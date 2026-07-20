# AGROARM — Roadmap

Deferred improvements, ordered roughly by impact. Small fixes get done directly; this
file tracks the bigger or blocked items. (Last review: 2026-07-20)

## Content / data (needs agronomist or editor input)

- [ ] **Jagoda: missing doses** — the PZV 2026 brochure's „Drugo prolećno tretiranje" row
  has a typesetting bug (dose column repeats the target text). Products are seeded
  (Primus 480 SC, Lotto 250 EC, Futocis 2.5 EC, Agrobiovit) with **empty doses** —
  get real doses and fill them in Admin → Kulture → Jagoda → Plan zaštite.
- [ ] **Verify product naming with the brochure team**:
  - Paradajz brochure says „Venpan 500 **EC**", catalog says „Venpan 500 **SC**" (we used SC).
  - „Primus 800 WG" (jabuka) and „Primus 80 WG" (jagoda, borovnica) are both linked to the
    catalog product „Primus" — confirm they're the same product.
- [ ] **Add missing preparati to the product catalog** so plan pills become clickable:
  Agrobiovit, Pancir 200 SC, Timorex Gold, Kurtuan, Klaster SL. After adding, update the
  plan rows to link them (currently free-text names).
- [ ] **Planovi ishrane** — real nutrition programs. The coming-soon page lives in
  `src/components/Plans/NutritionComingSoon.tsx`; when content is ready, revert
  `src/app/(frontend)/planovi-ishrane/page.tsx` and `[slug]/page.tsx` to use
  `PlansListPage` / `PlanSlugPage` (plumbing is intact) and re-add the URLs to a sitemap.
- [ ] **Home page SEO meta is empty** — fill title/description in Admin → Pages → Početna →
  SEO tab for a proper homepage link preview.

## Performance

- [ ] **ISR instead of `force-dynamic`** for `/kategorije`, `/planovi-zastite/*`, and product
  pages. Every request currently hits Postgres, so prod TTFB is slow. The revalidation
  hooks (`revalidatePlans`, `revalidateCatalog`) already exist — switch pages to
  `export const revalidate = 300` (or tag-based revalidation) and first paint becomes
  near-instant. Biggest remaining prod-perf win.
- [ ] **Media domain** — media files are served from `m.sagamasine.rs`. Consider moving to
  a first-party domain / R2 bucket (the R2 plugin config already exists in
  `src/plugins/index.ts`) for branding, cache control, and to avoid a third-party
  point of failure.

## Features

- [ ] **Print/PDF view for plan pages** — farmers print these; a `@media print` stylesheet
  (or a compact table layout as an alternative to the timeline) would let the site fully
  replace the paper brochures. The brochure-style 4-column table could be a toggle.
- [ ] **Search coverage for plans** — verify the Spotlight/search index includes cultures
  and plan pages, so searching „paradajz plamenjača" or a preparat name leads to plans,
  not just products.
- [ ] **Per-page OG images** — generate dynamic OG images (next/og) for products (product
  photo + name) and plan pages (culture photo + „Plan zaštite X") instead of the single
  branded fallback (`public/agroarm-og.png`).
- [ ] **Dark-mode chips in TreatmentSchedule** — target-type chips (sky-50/amber-50/teal-50
  backgrounds) stay light in dark mode. Legible but bright; add dark variants for polish.

## Tech debt / hygiene

- [ ] **Rotate the admin password & remove credentials from seed scripts** — several
  `scripts/*.ts` contain the admin email/password as fallbacks (also in git history).
  Move to `.env` only (`PAYLOAD_EMAIL` / `PAYLOAD_PASSWORD`) and rotate the password.
- [ ] **Pin the Next.js version** — `package.json` uses the floating `"canary"` tag, so any
  `pnpm add` silently jumps Next versions (happened 2026-07-20: canary.43 → preview.6).
  Pin to an exact version; upgrade deliberately.
- [ ] **Remove Payload template leftovers** — `src/endpoints/seed/*` (template seed content
  with "Payload Website Template" strings), the `/next/seed` route, and template README
  sections. Dead code, slight attack surface.
- [ ] **Verify sitemap after domain env fix** — with `NEXT_PUBLIC_SERVER_URL=https://www.agroarm.rs`
  set on Vercel, confirm `sitemap.xml` lists all 4 child sitemaps on the www domain and
  resubmit in Search Console (~100 URLs expected). Check indexing status after a week.
- [ ] **Dev-console warnings** — `PayloadRedirects` emits a script-tag warning and a
  `Performance.measure` error on 404 paths (template code), and `/o-nama` logs a React
  hydration mismatch. Dev-only noise today, but each hides real errors when they happen.
- [ ] **legacy flat-shape treatmentSchedule data** — the multi-target `targets[]` shape is
  canonical; the component still supports the pre-refactor flat shape (`stage.target`,
  `stage.products`). Once all real data is entered via the current admin UI, the legacy
  fallback in `Component.tsx` (`getTargetGroups`) and `populateTreatmentProducts` can go.
