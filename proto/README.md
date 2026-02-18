# Agroarm.rs - Redizajn

## Prototipovi

- `index.html` — Mobilno-orijentisan prototip početne stranice
- `herbicidi.html` — Listing stranica herbicida sa pretragom i filterima

### Dizajn sistem

**Boje kategorija:**
- **Herbicidi** → Zelena (`#2E7D32` / `#1B5E20`)
- **Fungicidi** → Plava (`#1565C0` / `#0D47A1`)
- **Insekticidi** → Crvena (`#C62828` / `#B71C1C`)

**Bazna paleta** (iz AGENTS.md):
- Primary: `#007D41` | Dark: `#024E29` | Background: `#F4F8F6` | Text: `#1F2A24`

---

## Odluka: Payload CMS + Next.js + Vercel + Neon

### Stack

```
Frontend + Admin:  Next.js + Payload CMS v3 (single app)
Hosting:           Vercel (free/hobby tier)
Database:          Neon Postgres (free tier: 0.5GB, 190 compute hours/mo)
Media storage:     Vercel Blob ili Cloudflare R2 (za slike i PDF-ove)
Domain:            agroarm.rs
```

### Zašto ovaj stack?

- **Payload v3 je built on Next.js** — jedan app za frontend i admin panel
- **Self-hosted, MIT licenca** — potpuno vlasništvo nad kodom i podacima
- **TypeScript** — tip-safe kolekcije, odličan DX
- **Vercel deploy** — zero-config, automatski CI/CD sa Git-om
- **Neon free tier** — besplatan Postgres, podatke možeš exportovati kad god hoćeš
- **Admin panel na /admin** — content osoba se loguje i upravlja proizvodima
- **$0/mesečno** za start (Vercel hobby + Neon free)

### Struktura kolekcija

```
Kolekcije:
├── Products (Proizvodi)
│   ├── name (text)
│   ├── slug (auto-generated)
│   ├── category (relationship → Categories)
│   ├── activeIngredient (text) — aktivna materija + koncentracija
│   ├── formulation (text) — SC, SL, EC, WG, OD...
│   ├── crops (relationship → Crops, hasMany)
│   ├── type (select: selektivni/totalni/kontaktni/sistemik)
│   ├── description (rich text)
│   ├── image (upload)
│   └── documents (upload array — PDF etikete, uputstva)
│
├── Categories (Kategorije)
│   ├── name (text) — Herbicidi, Fungicidi, Insekticidi...
│   ├── slug (text)
│   ├── color (text) — hex boja kategorije
│   └── description (text)
│
├── Crops (Kulture)
│   ├── name (text) — Kukuruz, Pšenica, Jabuka...
│   └── icon (upload)
│
├── ProtectionPlans (Planovi zaštite)
│   ├── name (text)
│   ├── type (select: ratarstvo/voćarstvo/povrtarstvo)
│   ├── year (number)
│   └── pdf (upload)
│
├── Branches (Filijale)
│   ├── city (text)
│   ├── address (text)
│   ├── phone (text)
│   └── workingHours (text)
│
├── Pages (Stranice)
│   ├── title (text)
│   ├── slug (text)
│   └── content (rich text / layout blocks)
│
└── Media (built-in)
    └── slike, PDF-ovi, katalozi
```

### Rute (Next.js App Router)

```
/                          → Početna stranica
/zastita-bilja/herbicidi   → Listing herbicida
/zastita-bilja/fungicidi   → Listing fungicida
/zastita-bilja/insekticidi → Listing insekticida
/proizvod/[slug]           → Detalji proizvoda
/semenski-program          → Semenski program
/ishrana-bilja             → Ishrana bilja
/kontakt                   → Kontakt stranica
/admin                     → Payload admin panel
```

### Skaliranje

Ako sajt preraste Vercel free tier ili Neon:
- Prebaci frontend na Vercel Pro ($20/mo)
- Prebaci DB na DigitalOcean Managed Postgres ($15/mo) ili self-hosted na droplet ($6/mo)
- Nula promena u kodu — samo connection string

---

## Sledeći koraci

- [ ] `npx create-payload-app` — scaffold projekat
- [ ] Definisati Payload kolekcije (Products, Categories, Crops)
- [ ] Povezati Neon Postgres
- [ ] Konvertovati proto/index.html u Next.js layout + page
- [ ] Konvertovati proto/herbicidi.html u dinamičku stranicu
- [ ] Seed bazu sa 60+ proizvoda sa agroarm.rs
- [ ] Deploy na Vercel
- [ ] SEO (meta tagovi, Open Graph, strukturirani podaci)
