import crypto from 'node:crypto'

// Seeds the remaining "Planovi zaštite" from the PZP 2026 Povrtarstvo brochure:
// Paprika (p6-7), Krastavac (p8), Kupus (p10), Krompir (p12), Lubenica i Dinja (p13).
//
// Usage: npx tsx scripts/seed-povrce-zastita.ts [--dry-run] [--only <slug>]

const CONFIG = {
  payloadApi: 'http://localhost:3001/api',
  email: process.env.PAYLOAD_EMAIL || 'stefan.kupresak@icloud.com',
  password: process.env.PAYLOAD_PASSWORD || 'rogueftw17',
  dryRun: process.argv.includes('--dry-run'),
  only: process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null,
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
  figaro: 44, // Figaro
  monofos: 48, // Monofos 20 SG
  epic: 46, // Epic
  lectorSuper: 11, // Lector Super
  markiz: 30, // Markiz WG
  enygma: 25, // Enygma 62,5 WG
  vegas: 40, // Vegas 250 EC
  nexiram: 49, // Nexiram
  notikor: 50, // Notikor
  atletic: 42, // Atletic
  boston: 3, // Boston 480 SL
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

// Frequently repeated product rows
const bakarniOksihlorid = { productName: 'Preparat na bazi a.s. bakarni oksihlorid' }
const vitazymeRow = (dose: string) => ({
  product: P.vitazyme,
  dose,
  note: 'imuno biostimulator',
})

type CultureSeed = {
  cultureId: number
  slug: string
  imageId: number
  description: string
  intro: string
  blockTitle: string
  stages: Stage[]
}

// ── Paprika (brochure p6-7) ─────────────────────────────────────────────────

const PAPRIKA: CultureSeed = {
  cultureId: 13,
  slug: 'paprika',
  imageId: 45,
  description:
    'Kompletan program zaštite paprike — od tretmana semena do zrenja plodova, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite paprike po razvojnim fazama — od tretmana semena do zrenja plodova. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite paprike',
  stages: [
    {
      stage: 'Tretman semena',
      targets: [
        {
          target: 'Bolesti poleganja rasada',
          targetType: 'fungicid',
          products: [vitazymeRow('Nakvasiti seme 5% rastvorom')],
        },
      ],
    },
    {
      stage: 'Zaštita rasada',
      targets: [
        {
          target: 'Bolesti poleganja rasada',
          targetType: 'fungicid',
          products: [{ product: P.fortuna, dose: '3% (zalivanje)' }],
        },
        { target: 'Bakterioze, plamenjača', targetType: 'fungicid', products: [bakarniOksihlorid] },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Pre rasađivanja',
      targets: [
        {
          target: 'Zemljišni patogeni',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha (kroz sistem za zalivanje)' }],
        },
        {
          target: 'Uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '2 l/ha' }],
        },
      ],
    },
    {
      stage: 'Prvo zalivanje nakon rasađivanja,\nkroz sistem kap po kap',
      targets: [
        {
          target: 'Zemljišni patogeni',
          targetType: 'fungicid',
          products: [
            { product: P.lotto, dose: '4 l/ha' },
            { product: P.exacta, dose: '1 l/ha', combineWithPrevious: true },
            vitazymeRow('1 l/ha'),
          ],
        },
      ],
    },
    {
      stage: 'Nakon rasađivanja',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.venpan, dose: '0,4 l/ha' }],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
        {
          target: 'Tripsi',
          targetType: 'insekticid',
          products: [{ product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' }],
        },
      ],
    },
    {
      stage: '1 - 2 nedelje nakon rasađivanja',
      targets: [
        {
          target: 'Bakterioza, plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [bakarniOksihlorid],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.monofos, dose: '0,2 kg/ha' },
            { product: P.epic, productName: 'Epic 20 SL', dose: 'ili 0,2 l/ha' },
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
          target: 'Tripsi',
          targetType: 'insekticid',
          products: [{ product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' }],
        },
        {
          target: 'Kada su korovi 2 - 5 listova (uskolisni korovi)',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '0,8 - 2 l/ha' }],
        },
      ],
    },
    {
      stage: 'Zalivanje kroz sistem kap po kap',
      targets: [
        {
          target: 'Zemljišni patogeni, bakterioze',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Rast biljaka',
      targets: [
        {
          target: 'Bakterioze, plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [bakarniOksihlorid],
        },
        {
          target: 'Sovice',
          targetType: 'insekticid',
          products: [{ productName: 'Pancir 200 SC', dose: '0,2 l/ha' }],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Zametanje plodova',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.markiz, dose: '1,5 kg/ha' },
            { product: P.enygma, dose: 'ili 0,8 kg/ha' },
          ],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.monofos, dose: '0,2 kg/ha' },
            { product: P.epic, productName: 'Epic 20 SL', dose: 'ili 0,2 l/ha' },
            vitazymeRow('1 l/ha'),
          ],
        },
      ],
    },
    {
      stage: 'Tokom zrenja plodova',
      targets: [
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [{ productName: 'Timorex Gold', dose: '2 l/ha' }],
        },
        {
          target: 'Bakterioze',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha' }],
        },
        {
          target: 'Sovice, kukuruzni plamenac',
          targetType: 'insekticid',
          products: [{ productName: 'Pancir 200 SC', dose: '0,2 l/ha' }, vitazymeRow('1 l/ha')],
        },
      ],
    },
  ],
}

// ── Krastavac (brochure p8) ─────────────────────────────────────────────────

const KRASTAVAC: CultureSeed = {
  cultureId: 14,
  slug: 'krastavac',
  imageId: 46,
  description:
    'Kompletan program zaštite krastavca — od rasada do berbe, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite krastavca po razvojnim fazama — od zaštite rasada do berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite krastavca',
  stages: [
    {
      stage: 'Zaštita rasada',
      targets: [
        {
          target: 'Bolesti poleganja rasada',
          targetType: 'fungicid',
          products: [{ product: P.fortuna, dose: '0,3 % (zalivanje)' }],
        },
        { target: 'Bakterioze, plamenjača', targetType: 'fungicid', products: [bakarniOksihlorid] },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Nakon rasađivanja',
      targets: [
        {
          target: 'Zemljišni patogeni',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha (kroz sistem kap po kap)' }],
        },
        {
          target: 'Plamenjača, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '0,4 l/ha' },
            { product: P.lotto, dose: 'ili 0,75 l/ha' },
          ],
        },
        {
          target: 'Lisne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.monofos, dose: '0,2 kg/ha' },
            { product: P.epic, productName: 'Epic 20 SL', dose: 'ili 0,2 l/ha' },
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
      ],
    },
    {
      stage: 'Cvetanje i zametanje plodova',
      targets: [
        {
          target: 'Plamenjača, pepelnica, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.fortuna, dose: '3 kg/ha' },
            { product: P.vegas, dose: '0,2 l/ha' },
            { product: P.enygma, dose: '0,8 kg/ha' },
          ],
        },
        {
          target: 'Tripsi, biljne vaši, lisni mineri',
          targetType: 'insekticid',
          products: [
            { product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '0,75 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Plodonošenje',
      targets: [
        {
          target: 'Plamenjača',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [{ product: P.enygma, dose: '0,8 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Berba',
      targets: [
        {
          target: 'Plamenjača',
          targetType: 'fungicid',
          products: [{ product: P.fortuna, dose: '3 kg/ha' }],
        },
      ],
    },
  ],
}

// ── Kupus (brochure p10) ────────────────────────────────────────────────────

const KUPUS: CultureSeed = {
  cultureId: 15,
  slug: 'kupus',
  imageId: 47,
  description:
    'Kompletan program zaštite kupusa — od rasada do formiranja glavice, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite kupusa po razvojnim fazama — od zaštite rasada do formiranja glavice. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite kupusa',
  stages: [
    {
      stage: 'Zaštita rasada',
      targets: [
        {
          target: 'Bolesti poleganja rasada',
          targetType: 'fungicid',
          products: [{ product: P.fortuna, dose: '0,3 % (zalivanje)' }],
        },
        { target: 'Bakterioze, plamenjača', targetType: 'fungicid', products: [bakarniOksihlorid] },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Potapanje rasada pre sadnje',
      targets: [
        {
          target: 'Zemljišni patogeni',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha' }, vitazymeRow('1%')],
        },
      ],
    },
    {
      stage: 'Nakon rasađivanja',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
        {
          target: 'Kupusna mušica, veliki i mali kupusar, buvači, lisne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.notikor, productName: 'Notikor 200 EC', dose: '0,3 l/ha' },
            vitazymeRow('1 l/ha'),
          ],
        },
      ],
    },
    {
      stage: 'Formiranje rozete',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.venpan, dose: '0,4 l/ha' }],
        },
        {
          target: 'Lisne sovice, biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
        {
          target: 'Uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '0,8 - 2 l/ha' }],
        },
      ],
    },
    {
      stage: 'Formiranje glavice',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
        {
          target: 'Sovice, kupusar, kupusni moljac',
          targetType: 'insekticid',
          products: [
            { productName: 'Pancir 200 SC', dose: '0,2 l/ha' },
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
          ],
        },
      ],
    },
  ],
}

// ── Krompir (brochure p12) ──────────────────────────────────────────────────

const KROMPIR: CultureSeed = {
  cultureId: 16,
  slug: 'krompir',
  imageId: 48,
  description:
    'Kompletan program zaštite krompira — od sadnje do sazrevanja, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite krompira po razvojnim fazama — od pripreme za sadnju do sazrevanja. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite krompira',
  stages: [
    {
      stage: 'Pre sadnje',
      targets: [
        {
          target: 'Zemljišne štetočine',
          targetType: 'insekticid',
          products: [
            { productName: 'Preparat na bazi a.s. teflutrin' },
            {
              product: P.vitazyme,
              note: 'tretirati krtole pre sadnje 5% rastvorom (1 l rastvora na 50 kg semena)',
            },
          ],
        },
      ],
    },
    {
      stage: 'Usev porasta do 20 cm',
      targets: [
        {
          target: 'Jednogodišnji i višegodišnji uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '0,8 - 2 l/ha' }],
        },
        {
          target: 'Jednogodišnji i višegodišnji širokolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.boston, dose: '2 - 3 l/ha' }],
        },
      ],
    },
    {
      stage: 'Formiranje redova (intenzivan porast)',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '0,4 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Krompirova zlatica',
          targetType: 'insekticid',
          products: [vitazymeRow('1 l/ha'), { product: P.monofos, dose: '0,25 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Zatvaranje redova',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
        {
          target: 'Krompirova zlatica',
          targetType: 'insekticid',
          products: [{ productName: 'Pancir 200 SC', dose: '0,06 l/ha' }],
        },
      ],
    },
    {
      stage: 'Početak cvetanja i formiranja krtola',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '0,4 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
            vitazymeRow('1 l/ha'),
          ],
        },
        {
          target: 'Krompirova zlatica, lisne vaši',
          targetType: 'insekticid',
          products: [{ product: P.skener, productName: 'Skener 240 SC', dose: '0,5 l/ha' }],
        },
      ],
    },
    {
      stage: 'Puno cvetanje',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
        {
          target: 'Krompirova zlatica, krompirov moljac',
          targetType: 'insekticid',
          products: [
            { product: P.skener, productName: 'Skener 240 SC', dose: '0,5 l/ha' },
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Sazrevanje',
      targets: [
        {
          target: 'Plamenjača krtola',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '0,4 l/ha' },
            { product: P.exacta, dose: '0,75 l/ha' },
          ],
        },
        {
          target: 'Krompirov moljac',
          targetType: 'insekticid',
          products: [{ product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' }],
        },
      ],
    },
  ],
}

// ── Lubenica i Dinja (brochure p13) ─────────────────────────────────────────
// Note: the brochure's target column on this page has obvious layout errors
// (Futocis under "plamenjača", Lector Super under "štetni insekti"); targets
// here are re-aligned to product function, consistent with the other cultures.

const LUBENICA: CultureSeed = {
  cultureId: 17,
  slug: 'lubenica-i-dinja',
  imageId: 49,
  description:
    'Kompletan program zaštite lubenice i dinje — od rasada do formiranja plodova, sa preporučenim preparatima i dozama za svaku fazu.',
  intro:
    'Preporučeni program zaštite lubenice i dinje po razvojnim fazama — od zaštite rasada do formiranja plodova. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite lubenice i dinje',
  stages: [
    {
      stage: 'Zaštita rasada',
      targets: [
        {
          target: 'Bolesti poleganja rasada',
          targetType: 'fungicid',
          products: [{ product: P.fortuna, dose: '0,3 % (zalivanje)' }, bakarniOksihlorid],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Nakon rasađivanja',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
        {
          target: 'Uskolisni korovi',
          targetType: 'herbicid',
          products: [{ product: P.lectorSuper, dose: '0,8 - 2 l/ha' }],
        },
        {
          targetType: 'biostimulator',
          products: [vitazymeRow('1 l/ha')],
        },
      ],
    },
    {
      stage: '7 - 10 dana nakon prethodnog',
      targets: [
        {
          target: 'Plamenjača, crna pegavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.exacta, dose: '0,75 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Formiranje vreže',
      targets: [
        {
          target: 'Plamenjača, crna pegavost',
          targetType: 'fungicid',
          products: [{ product: P.venpan, dose: '0,4 l/ha' }],
        },
        {
          target: 'Tripsi, bela leptirasta vaš',
          targetType: 'insekticid',
          products: [
            { product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' },
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' },
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '0,75 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Formiranje plodova\n(između berbi, po potrebi)',
      targets: [
        {
          target: 'Plamenjača, crna pegavost, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.exacta, dose: '0,75 l/ha' },
            { product: P.enygma, dose: '0,8 kg/ha' },
            { productName: 'Timorex Gold', dose: 'ili 2 l/ha' },
          ],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
  ],
}

const CULTURES: CultureSeed[] = [PAPRIKA, KRASTAVAC, KUPUS, KROMPIR, LUBENICA]

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
              footnotes: [],
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
