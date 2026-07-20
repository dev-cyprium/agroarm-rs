import crypto from 'node:crypto'

// Seeds the "Planovi zaštite" from the PZR 2026 Ratarstvo brochure:
// Kukuruz (p3), Pšenica (p5), Soja (p7), Suncokret (p8),
// Uljana repica (p10), Lucerka (p11).
//
// Usage: npx tsx scripts/seed-ratarstvo-zastita.ts [--dry-run] [--only <slug>]

const CONFIG = {
  payloadApi: 'http://localhost:3001/api',
  email: process.env.PAYLOAD_EMAIL || 'stefan.kupresak@icloud.com',
  password: process.env.PAYLOAD_PASSWORD || 'rogueftw17',
  dryRun: process.argv.includes('--dry-run'),
  only: process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null,
}

// Catalog product IDs (verified against /api/products)
const P = {
  vitazyme: 68, // Vitazyme
  ingenico: 19, // Ingenico 750 WG
  azin: 1, // Azin 500 SC
  vesticor: 20, // Vesticor 40 OD
  dragon: 6, // Dragon 480 SL
  ranger: 15, // Ranger
  conzorcio: 4, // Conzorcio
  aquila: 2, // Aquila OD
  gringo: 7, // Gringo 75 WG
  elevoreSuper: 86, // Elevore Super
  arcon250: 57, // Arcon 250 EC
  lotto: 60, // Lotto 250 EC
  tenorExtra: 58, // Tenor Extra
  futocis: 45, // Futocis
  messi: 12, // Messi 60 WG
  arconExtra: 21, // Arcon Extra
  tenor250: 59, // Tenor 250 EC
  boston: 3, // Boston 480 SL
  imazar: 8, // Imazar 40
  tiffany: 18, // Tiffany 75 WG
  komersant: 10, // Komersant
  cortado: 5, // Cortado
  lectorSuper: 11, // Lector Super
  notikor: 50, // Notikor
  monofos: 48, // Monofos 20 SG
}

const id = () => crypto.randomBytes(12).toString('hex')

type ProductRow = {
  product?: number
  productName?: string
  dose?: string
  note?: string
  combineWithPrevious?: boolean
}
type Target = { target?: string; targetType: string; products: ProductRow[] }
type Stage = { stage: string; targets: Target[]; note?: string }

const row = (r: ProductRow) => ({
  id: id(),
  product: r.product ?? null,
  productName: r.productName ?? null,
  dose: r.dose ?? null,
  note: r.note ?? null,
  combineWithPrevious: r.combineWithPrevious ?? false,
})

const target = (t: Target) => ({
  id: id(),
  target: t.target ?? null,
  targetType: t.targetType,
  products: t.products.map(row),
})

const stage = (s: Stage) => ({
  id: id(),
  stage: s.stage,
  targets: s.targets.map(target),
  note: s.note ?? null,
})

const okvasivac = (mix = true) => ({ productName: 'Okvašivač', combineWithPrevious: mix })
const vitazymeRow = (dose: string, note = 'imuno biostimulator') => ({
  product: P.vitazyme,
  dose,
  note,
})

type CultureSeed = {
  cultureId: number
  slug: string
  imageId: number
  description: string
  intro: string
  blockTitle: string
  stages: Stage[]
  footnotes?: string[]
}

// ── Kukuruz (brochure p3) ───────────────────────────────────────────────────

const KUKURUZ: CultureSeed = {
  cultureId: 1,
  slug: 'kukuruz',
  imageId: 41,
  description:
    'Kompletan program zaštite kukuruza — od tretmana semena do faze 8 listova, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite kukuruza po razvojnim fazama — od tretmana semena do faze 8 listova. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite kukuruza',
  stages: [
    {
      stage: 'Tretman semena',
      targets: [
        {
          target: 'Smanjenje gljivičnih oboljenja, imunobiostimulator',
          targetType: 'biostimulator',
          products: [{ product: P.vitazyme, dose: '1 l / 1 tonu semena' }],
        },
      ],
    },
    {
      stage: 'Posle setve, a pre nicanja',
      targets: [
        {
          target: 'Jednogodišnji uskolisni i širokolisni korovi',
          targetType: 'herbicid',
          products: [
            { product: P.ingenico, dose: '135 g/ha' },
            { product: P.azin, dose: '1 l/ha', combineWithPrevious: true },
          ],
        },
      ],
    },
    {
      stage: 'Kukuruz 2 - 5 listova',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji uskolisni i širokolisni korovi',
          targetType: 'herbicid',
          products: [
            { product: P.vesticor, dose: '1,25 l/ha' },
            { product: P.dragon, dose: '0,5 - 0,7 l/ha', combineWithPrevious: true },
            { product: P.ranger, dose: '50 g/ha', note: 'koristiti kada ima muhara' },
            { product: P.conzorcio, dose: '0,25 l/ha', combineWithPrevious: true },
            okvasivac(),
          ],
        },
      ],
    },
    {
      stage: 'Kukuruz 2 - 6 listova',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji uskolisni i širokolisni korovi',
          targetType: 'herbicid',
          products: [
            { product: P.vesticor, dose: '1,25 l/ha' },
            { product: P.conzorcio, dose: '0,25 l/ha', combineWithPrevious: true },
            { product: P.ranger, dose: '50 g/ha', note: 'koristiti kada ima muhara' },
            { product: P.aquila, dose: '1,5 - 2 l/ha', combineWithPrevious: true },
          ],
        },
      ],
    },
    {
      stage: 'Kukuruz 2 - 8 listova',
      targets: [
        {
          target: 'Širokolisni korovi i jednogodišnji uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.aquila, dose: '1,5 - 2 l/ha' }, vitazymeRow('1 l/ha')],
        },
      ],
    },
  ],
}

// ── Pšenica (brochure p5) ───────────────────────────────────────────────────

const PSENICA: CultureSeed = {
  cultureId: 7,
  slug: 'psenica',
  imageId: 38,
  description:
    'Kompletan program zaštite pšenice — od tretmana semena do posle žetve, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite pšenice po razvojnim fazama — od tretmana semena do suzbijanja korova nakon žetve. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite pšenice',
  stages: [
    {
      stage: 'Tretman semena',
      targets: [
        {
          target:
            'Poboljšava klijavost i rast korenovog sistema, sprečava bolesti uzrokovane patogenim gljivama',
          targetType: 'biostimulator',
          products: [
            { productName: 'Agrobiovit', dose: '200 g u 10 l vode (za 1 tonu semena)' },
            { product: P.vitazyme, dose: 'ili 1 l (za 1 tonu semena)' },
          ],
        },
      ],
    },
    {
      stage: 'Tokom bokorenja do drugog kolenca',
      targets: [
        {
          target: 'Suzbijanje izvora primarnih infekcija patogena i podsticanje indukovane otpornosti',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Od trećeg lista do drugog kolenca',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji širokolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.gringo, dose: '0,015 kg/ha' }, { ...okvasivac(), dose: '0,2 l/ha' }],
        },
        {
          target: 'Divlji ovas',
          targetType: 'herbicid',
          products: [{ product: P.elevoreSuper, dose: '1,2 l/ha' }],
        },
        {
          targetType: 'biostimulator',
          products: [vitazymeRow('1 l/ha')],
        },
      ],
    },
    {
      stage: 'Od drugog kolenca do lista zastavičara',
      targets: [
        {
          target: 'Pepelnica, rđa, bolesti lista i stabla',
          targetType: 'fungicid',
          products: [
            { product: P.arcon250, dose: '0,8 l/ha' },
            { product: P.lotto, dose: 'ili 0,5 - 1 l/ha' },
            { product: P.tenorExtra, dose: 'ili 0,5 - 1 l/ha' },
          ],
        },
        {
          target: 'Biljne vaši, žitna pijavica',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
        {
          target: 'Jednogodišnji i višegodišnji širokolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.messi, dose: '0,01 kg/ha' }, { ...okvasivac(), dose: '0,2 l/ha' }],
        },
        {
          target: 'Indukovana otpornost i sprečavanje fuzarioznog zaražavanja zrna',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Od lista zastavičara do početka cvetanja',
      targets: [
        {
          target: 'Fuzarioza klasa, pepelnica, rđa, siva pegavost lista i stabla',
          targetType: 'fungicid',
          products: [
            { productName: 'Kurtuan', dose: '1 l / 500 l vode' },
            { product: P.tenorExtra, dose: '1 l/ha' },
            { product: P.arconExtra, dose: 'ili 0,75 - 1 l/ha' },
            { product: P.tenor250, dose: 'ili 0,75 - 1 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Suzbijanje korova nakon žetve',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji korovi',
          targetType: 'herbicid',
          products: [{ productName: 'Klaster SL', dose: '3 - 10 l/ha' }],
        },
      ],
    },
  ],
}

// ── Soja (brochure p7) ──────────────────────────────────────────────────────

const SOJA: CultureSeed = {
  cultureId: 8,
  slug: 'soja',
  imageId: 39,
  description:
    'Kompletan program zaštite soje — od tretiranja semena do cvetanja, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite soje po razvojnim fazama — od tretiranja semena do cvetanja. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite soje',
  stages: [
    {
      stage: 'Tretiranje semena',
      targets: [
        {
          target: 'Smanjenje gljivičnih oboljenja, imunobiostimulator',
          targetType: 'biostimulator',
          products: [{ product: P.vitazyme, dose: '1 l / tonu semena' }],
        },
      ],
    },
    {
      stage: 'Posle nicanja useva i korova,\nkada je soja u fazi od 1 do 3 troliske',
      targets: [
        {
          target: 'Jednogodišnji širokolisni i uskolisni korovi',
          targetType: 'herbicid',
          products: [
            { product: P.boston, dose: '2 l/ha', note: 'kombinacija 1' },
            { product: P.imazar, dose: '0,6 l/ha', combineWithPrevious: true },
            { product: P.tiffany, dose: '8 g/ha', combineWithPrevious: true },
            okvasivac(),
            { product: P.boston, dose: '2 l/ha', note: 'kombinacija 2' },
            { product: P.tiffany, dose: '8 g/ha', combineWithPrevious: true },
            okvasivac(),
            { product: P.boston, dose: '2 l/ha', note: 'kombinacija 3' },
            {
              product: P.komersant,
              productName: 'Komersant 4-E',
              dose: '0,3 - 0,35 l/ha',
              combineWithPrevious: true,
            },
            { product: P.tiffany, dose: '8 g/ha', combineWithPrevious: true },
            okvasivac(),
            { product: P.cortado, productName: 'Cortado SL', dose: '2 l/ha', note: 'kombinacija 4' },
            { product: P.tiffany, dose: '8 g/ha', combineWithPrevious: true },
            okvasivac(),
          ],
        },
      ],
    },
    {
      stage: 'Nakon formiranja prve troliske pa do cvetanja,\na kada su uskolisni korovi 3 - 5 listova',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '1 - 2 l/ha' }, vitazymeRow('1 l/ha')],
        },
      ],
    },
  ],
  footnotes: [
    'Koristiti neku od kombinacija 1, 2, 3 ili 4 za suzbijanje širokolisnih korova u zavisnosti od spektra prisutnih korova.',
    'Kao korekciju za drugi tretman koristiti Cortado SL u količini od 0,9 l/ha.',
  ],
}

// ── Suncokret (brochure p8) ─────────────────────────────────────────────────

const SUNCOKRET: CultureSeed = {
  cultureId: 9,
  slug: 'suncokret',
  imageId: 40,
  description:
    'Kompletan program zaštite suncokreta — od tretmana semena do cvetanja, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite suncokreta po razvojnim fazama — od tretmana semena do cvetanja. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite suncokreta',
  stages: [
    {
      stage: 'Tretman semena',
      targets: [
        {
          target: 'Smanjenje gljivičnih oboljenja, imunobiostimulator',
          targetType: 'biostimulator',
          products: [{ product: P.vitazyme, dose: '1 l / tonu semena' }],
        },
      ],
    },
    {
      stage: 'Posle setve, a pre nicanja useva',
      targets: [
        {
          target: 'Jednogodišnji uskolisni i širokolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.azin, dose: '1 - 1,5 l/ha' }],
        },
      ],
    },
    {
      stage: 'Posle nicanja do faze 3 para listova',
      targets: [
        {
          target: 'Jednogodišnji uskolisni i širokolisni korovi',
          targetType: 'herbicid',
          products: [
            {
              product: P.imazar,
              dose: '1 - 1,2 l/ha',
              note: 'samo IMI hibridi tolerantni na Imazamoks',
            },
          ],
        },
      ],
    },
    {
      stage: 'Posle nicanja, od 2 - 8 listova suncokreta,\na širokolisni korovi u fazi 2 - 4 lista',
      targets: [
        {
          target: 'Jednogodišnji širokolisni korovi',
          targetType: 'herbicid',
          products: [
            {
              product: P.gringo,
              dose: '30 g/ha',
              note: 'samo hibridi tolerantni na tribenuron-metil',
            },
            okvasivac(),
          ],
        },
      ],
    },
    {
      stage: 'Uskolisni korovi u fazi 3 - 5 listova\n(10 - 30 cm visine)',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '1 - 2 l/ha' }],
        },
      ],
    },
    {
      stage: 'Od 5 listova do cvetanja',
      targets: [
        {
          target: 'Smanjenje gljivičnih oboljenja, imunobiostimulator',
          targetType: 'biostimulator',
          products: [{ product: P.vitazyme, dose: '0,75 l/ha' }],
        },
      ],
    },
  ],
}

// ── Uljana repica (brochure p10) ────────────────────────────────────────────

const ULJANA_REPICA: CultureSeed = {
  cultureId: 10,
  slug: 'uljana-repica',
  imageId: 42,
  description:
    'Kompletan program zaštite uljane repice — od tretmana semena do cvetanja, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite uljane repice po razvojnim fazama — od tretmana semena do cvetanja. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite uljane repice',
  stages: [
    {
      stage: 'Tretman semena',
      targets: [
        {
          target: 'Smanjenje gljivičnih oboljenja, imunobiostimulator',
          targetType: 'biostimulator',
          products: [{ product: P.vitazyme, dose: '1 l / tonu semena' }],
        },
      ],
    },
    {
      stage: 'Inkorporacija',
      targets: [
        {
          target: 'Jednogodišnji uskolisni i širokolisni korovi',
          targetType: 'herbicid',
          products: [
            { product: P.komersant, productName: 'Komersant 4E', dose: '0,2 - 0,3 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Faza 4 - 6 listova',
      targets: [
        {
          target: 'Phoma sp., Alternaria sp.',
          targetType: 'fungicid',
          products: [{ product: P.lotto, dose: '0,75 l/ha' }],
        },
      ],
    },
    {
      stage: 'Uskolisni korovi u fazi 3 - 5 listova\n(10 - 30 cm visine)',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '1 - 2 l/ha' }, vitazymeRow('1 l/ha')],
        },
      ],
    },
    {
      stage: 'Tokom vegetacije, a pre cvetanja',
      targets: [
        {
          target: 'Repičin sjajnik, repičina lisna osa, repični buvač, podgrizajuće sovice, repična pipa',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
  ],
}

// ── Lucerka (brochure p11) ──────────────────────────────────────────────────

const LUCERKA: CultureSeed = {
  cultureId: 11,
  slug: 'lucerka',
  imageId: 43,
  description:
    'Kompletan program zaštite lucerke — od mirovanja vegetacije do perioda posle košenja, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite lucerke po razvojnim fazama — od mirovanja vegetacije do perioda posle košenja. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite lucerke',
  stages: [
    {
      stage: 'Mirovanje, pre kretanja vegetacije',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji širokolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.tiffany, dose: '15 - 20 g/ha' }, okvasivac()],
        },
      ],
    },
    {
      stage: 'Od prve do treće troliske',
      targets: [
        {
          target: 'Jednogodišnji širokolisni korovi',
          targetType: 'herbicid',
          products: [
            { product: P.imazar, dose: '1 - 1,2 l/ha' },
            {
              product: P.boston,
              dose: 'ili 2 l/ha',
              note: 'u zasnovanoj lucerki starijoj od 12 meseci',
            },
          ],
        },
        {
          target: 'Uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '1 - 2 l/ha' }],
        },
      ],
    },
    {
      stage: 'Posle prvog košenja',
      targets: [
        {
          target: 'Lucerkina buba, buvači, cikade',
          targetType: 'insekticid',
          products: [
            { product: P.notikor, productName: 'Notikor 200 EC', dose: '0,2 l/ha' },
            { product: P.monofos, dose: 'ili 0,25 kg/ha' },
            { product: P.vitazyme, dose: '1 l/ha', note: 'nakon svakog košenja 1 l/ha' },
          ],
        },
      ],
    },
  ],
}

const CULTURES: CultureSeed[] = [KUKURUZ, PSENICA, SOJA, SUNCOKRET, ULJANA_REPICA, LUCERKA]

// ── Lexical JSON builders ───────────────────────────────────────────────────

const lexParagraph = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textStyle: '',
  textFormat: 0,
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
})

const buildPatch = (c: CultureSeed) => ({
  protection: {
    image: c.imageId,
    description: c.description,
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          lexParagraph(c.intro),
          {
            type: 'block',
            format: '',
            version: 2,
            fields: {
              id: id(),
              blockName: '',
              blockType: 'treatmentSchedule',
              title: c.blockTitle,
              stages: c.stages.map(stage),
              footnotes: (c.footnotes ?? []).map((text) => ({ id: id(), text })),
            },
          },
        ],
      },
    },
  },
})

// ── API helpers ─────────────────────────────────────────────────────────────

async function login(): Promise<string> {
  const res = await fetch(`${CONFIG.payloadApi}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CONFIG.email, password: CONFIG.password }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { token?: string }
  if (!data.token) throw new Error('Login response had no token')
  return data.token
}

async function main() {
  const cultures = CONFIG.only ? CULTURES.filter((c) => c.slug === CONFIG.only) : CULTURES
  if (cultures.length === 0) throw new Error(`No culture matches --only ${CONFIG.only}`)

  if (CONFIG.dryRun) {
    for (const c of cultures) console.log(JSON.stringify(buildPatch(c), null, 2))
    return
  }

  const token = await login()
  console.log('✓ logged in')

  for (const c of cultures) {
    const res = await fetch(`${CONFIG.payloadApi}/cultures/${c.cultureId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(buildPatch(c)),
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`PATCH ${c.slug} failed: ${res.status} ${text.slice(0, 500)}`)
    }
    console.log(`✓ ${c.slug} (plan zaštite) updated`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
