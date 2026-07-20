import crypto from 'node:crypto'

// Seeds the full "Plan zaštite paradajza" (PZP 2026 brochure, pages 3-4) into
// the Paradajz culture, and clears the Suncokret trial plan content.
//
// Usage: npx tsx scripts/seed-paradajz-zastita.ts [--dry-run]

const CONFIG = {
  payloadApi: 'http://localhost:3001/api',
  email: process.env.PAYLOAD_EMAIL || 'stefan.kupresak@icloud.com',
  password: process.env.PAYLOAD_PASSWORD || 'rogueftw17',
  paradajzId: 12,
  suncokretId: 9,
  paradajzImageId: 44, // culture photo reused as the plan hero/card image
  dryRun: process.argv.includes('--dry-run'),
}

// Catalog product IDs (verified against /api/products)
const P = {
  fortuna: 28, // Fortuna 80 WG
  vitazyme: 68, // Vitazyme
  lotto: 60, // Lotto 250 EC
  exacta: 26, // Exacta 250 SC
  venpan: 41, // Venpan 500 SC
  bektin: 43, // Bektin
  futocis: 45, // Futocis
  skener: 47, // Skener
  botus: 23, // Botus SC 400
  atletic: 42, // Atletic
  figaro: 44, // Figaro
  enygma: 25, // Enygma 62,5 WG
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

// ── Plan zaštite paradajza (brochure order) ─────────────────────────────────

const STAGES: Stage[] = [
  {
    stage: 'Zaštita rasada',
    targets: [
      {
        target: 'Bolesti poleganja rasada',
        targetType: 'fungicid',
        products: [
          { product: P.fortuna, dose: '3% (zalivanje)' },
          {
            product: P.vitazyme,
            dose: '5% rastvorom nakvasiti seme',
            note: 'imuno biostimulator',
          },
        ],
      },
    ],
  },
  {
    stage: 'Prvo zalivanje nakon rasađivanja\n(kroz sistem kap po kap)',
    targets: [
      {
        target: 'Zemljišni patogeni',
        targetType: 'fungicid',
        products: [
          { product: P.lotto, dose: '4 l' },
          { product: P.exacta, dose: '1 l/ha', combineWithPrevious: true },
          { product: P.vitazyme, dose: '1 l/ha', note: 'imuno biostimulator' },
        ],
      },
    ],
  },
  {
    stage: '1 - 2 nedelje nakon rasađivanja',
    targets: [
      {
        target: 'Bakterioze i crna pegavost',
        targetType: 'fungicid',
        products: [{ productName: 'Preparat na bazi a.s. bakarni oksihlorid' }],
      },
      {
        target: 'Plamenjača, pepelnica',
        targetType: 'fungicid',
        products: [
          { product: P.venpan, dose: '0,4 l/ha' },
          { product: P.lotto, dose: '0,75 l/ha' },
        ],
      },
      {
        target: 'Grinje',
        targetType: 'akaricid',
        products: [
          {
            product: P.bektin,
            productName: 'Bektin 18 EC',
            dose: '0,75 l/ha',
            note: 'samo u zatvorenom prostoru',
          },
        ],
      },
      {
        target: 'Lisne vaši, bela leptirasta vaš, tresetna mušica, mineri',
        targetType: 'insekticid',
        products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
      },
      {
        target: 'Tripsi',
        targetType: 'insekticid',
        products: [{ product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' }],
      },
    ],
  },
  {
    stage: '15 dana nakon rasađivanja\n(kroz sistem kap po kap)',
    targets: [
      {
        target: 'Zemljišni patogeni',
        targetType: 'fungicid',
        products: [
          { productName: 'Agrobiovit', dose: '0,4 kg/ha' },
          { product: P.vitazyme, dose: '1 l/ha', note: 'imuno biostimulator' },
        ],
      },
    ],
  },
  {
    stage: 'Intenzivno cvetanje i zametanje plodova',
    targets: [
      {
        target: 'Plamenjača',
        targetType: 'fungicid',
        products: [{ product: P.venpan, dose: '0,4 l/ha' }],
      },
      {
        target: 'Siva trulež',
        targetType: 'fungicid',
        products: [{ product: P.botus, dose: '2 l/ha' }],
      },
      {
        target: 'Pepelnica',
        targetType: 'fungicid',
        products: [{ product: P.lotto, dose: '0,75 l/ha' }],
      },
      {
        target: 'Sovice, Tuta apsoluta',
        targetType: 'insekticid',
        products: [{ product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' }],
      },
      {
        target: 'Biljne vaši',
        targetType: 'insekticid',
        products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
      },
    ],
  },
  {
    stage: 'Tokom zrenja plodova\n(poštovati karencu!)',
    targets: [
      {
        target: 'Siva trulež',
        targetType: 'fungicid',
        products: [{ product: P.enygma, dose: '0,8 kg/ha' }],
      },
      {
        target: 'Plamenjača',
        targetType: 'fungicid',
        products: [{ product: P.exacta, dose: '0,75 l/ha' }],
      },
      {
        target: 'Sovice, Paradajzov moljac',
        targetType: 'insekticid',
        products: [{ productName: 'Pancir 200 SC', dose: '0,2 l/ha' }],
      },
      {
        target: 'Biljne vaši',
        targetType: 'insekticid',
        products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
      },
      {
        targetType: 'biostimulator',
        products: [{ product: P.vitazyme, dose: '1 l/ha', note: 'imuno biostimulator' }],
      },
    ],
  },
]

// ── Lexical JSON builders ───────────────────────────────────────────────────

const lexParagraph = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textStyle: '',
  textFormat: 0,
  children: [
    { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
  ],
})

const content = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      lexParagraph(
        'Preporučeni program zaštite paradajza po razvojnim fazama — od zaštite rasada do zrenja plodova. Kliknite na preparat za detalje iz našeg kataloga.',
      ),
      {
        type: 'block',
        format: '',
        version: 2,
        fields: {
          id: id(),
          blockName: '',
          blockType: 'treatmentSchedule',
          title: 'Plan zaštite paradajza',
          stages: STAGES.map(stage),
          // No footnotes: the safe-use disclaimer banner renders on every
          // protection-plan page (PesticideDisclaimer in PlanDetail).
          footnotes: [],
        },
      },
    ],
  },
}

const paradajzPatch = {
  protection: {
    image: CONFIG.paradajzImageId,
    description:
      'Kompletan program zaštite paradajza — od rasada do zrenja plodova, sa preporučenim preparatima i dozama za svaku fazu.',
    content,
  },
}

const suncokretPatch = {
  protection: { image: null, description: null, content: null },
}

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

async function patchCulture(token: string, cultureId: number, body: unknown, label: string) {
  const res = await fetch(`${CONFIG.payloadApi}/cultures/${cultureId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`PATCH ${label} failed: ${res.status} ${text.slice(0, 500)}`)
  console.log(`✓ ${label} updated`)
}

async function main() {
  if (CONFIG.dryRun) {
    console.log(JSON.stringify(paradajzPatch, null, 2))
    return
  }
  const token = await login()
  console.log('✓ logged in')
  await patchCulture(token, CONFIG.paradajzId, paradajzPatch, 'Paradajz (plan zaštite)')
  await patchCulture(token, CONFIG.suncokretId, suncokretPatch, 'Suncokret (uklonjen probni plan)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
