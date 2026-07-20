import crypto from 'node:crypto'

// Seeds the "Planovi zaštite" from the PZV 2026 Voćarstvo brochure:
// Jabuka (p3-5), Kruška (p7-8), Šljiva (p9), Višnja (p10), Breskva (p11-12),
// Malina (p13-14), Kupina (p15), Jagoda (p16), Borovnica (p17), Vinova loza (p18).
//
// Usage: npx tsx scripts/seed-vocarstvo-zastita.ts [--dry-run] [--only <slug>]

const CONFIG = {
  payloadApi: 'http://localhost:3001/api',
  email: process.env.PAYLOAD_EMAIL || 'stefan.kupresak@icloud.com',
  password: process.env.PAYLOAD_PASSWORD || 'rogueftw17',
  dryRun: process.argv.includes('--dry-run'),
  only: process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null,
}

// Catalog product IDs (verified against /api/products)
const P = {
  vitazyme: 68,
  kanton: 29, // Kanton 700 WG
  botus: 23, // Botus SC 400
  calcio: 24, // Calcio 75 WG
  primus: 34, // Primus (WG)
  primus480: 61, // Primus 480 SC
  feribot: 27, // Feribot
  fortuna: 28, // Fortuna 80 WG
  lotto: 60, // Lotto 250 EC
  venpan: 41, // Venpan 500 SC
  vegas: 40, // Vegas 250 EC
  exacta: 26, // Exacta 250 SC
  enygma: 25, // Enygma 62,5 WG
  markiz: 30, // Markiz WG
  notikor: 50, // Notikor
  futocis: 45, // Futocis
  skener: 47, // Skener
  figaro: 44, // Figaro
  atletic: 42, // Atletic
  nexiram: 49, // Nexiram
  bektin: 43, // Bektin
  monofos: 48, // Monofos 20 SG
  epic: 46, // Epic
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

// Frequently repeated free-text rows
const bakarni = { productName: 'Preparat na bazi a.s. bakarni oksihlorid' }
const mineralnoUlje = { productName: 'Preparat na bazi a.s. mineralno ulje' }
const sumpor = { productName: 'Preparat na bazi a.s. sumpora' }
const ciram = { productName: 'Preparat na bazi a.s. ciram' }
const notikorRow = (dose: string) => ({
  product: P.notikor,
  productName: 'Notikor 200 EC',
  dose,
})
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

// ── Jabuka (p3-5) ───────────────────────────────────────────────────────────

const JABUKA: CultureSeed = {
  cultureId: 18,
  slug: 'jabuka',
  imageId: 50,
  description:
    'Kompletan program zaštite jabuke po fenofazama — od bubrenja pupoljaka do berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite jabuke po fenofazama — od bubrenja pupoljaka do berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite jabuke',
  stages: [
    {
      stage: 'Faza (B)\nBubrenje i pucanje pupoljaka',
      targets: [
        {
          target: 'Čađava krastavost, bakteriozna plamenjača',
          targetType: 'fungicid',
          products: [bakarni],
        },
        {
          target: 'Prezimljavajuće forme štetočina',
          targetType: 'insekticid',
          products: [mineralnoUlje, notikorRow('0,2 l/ha')],
        },
      ],
    },
    {
      stage: 'Faza (C)\nPred mišje uši',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [{ product: P.kanton, dose: '0,7 kg/ha' }],
        },
        {
          target: 'Jabukin cvetojed',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
    {
      stage: 'Faza (C2) - (D)\nMišje uši',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.botus, dose: '1 l/ha' },
            sumpor,
          ],
        },
        {
          target: 'Jabukin cvetojed',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
    {
      stage: 'Faza (D3)\nZeleni buketići',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.calcio, dose: '200 g/ha' },
            sumpor,
          ],
        },
        {
          target: 'Lisne vaši, cvetojed',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Faza (E)\nRoze pupoljak',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [
            { product: P.primus, productName: 'Primus 800 WG', dose: '3 kg/ha' },
            { product: P.calcio, dose: '200 g/ha' },
          ],
        },
        {
          target: 'Pepelnica',
          targetType: 'fungicid',
          products: [{ product: P.lotto, dose: '0,4 l/ha' }],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Faza (E2)\nPred otvaranje cvetova',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.botus, dose: '1 l/ha' },
          ],
        },
        {
          target: 'Bakteriozna plamenjača, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.fortuna, dose: '1 kg/ha' },
            { product: P.lotto, dose: '0,4 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Faza (F)\nPočetak cvetanja (od 1 - 5 % otvorenih cvetova)',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.calcio, dose: '0,2 kg/ha' },
          ],
        },
        {
          target: 'Bakteriozna plamenjača',
          targetType: 'fungicid',
          products: [{ product: P.fortuna, dose: '1 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Faza (F2 - G)\nPuno cvetanje',
      targets: [
        {
          target: 'Čađava krastavost, bakteriozna plamenjača, lisna pegavost (Alternaria sp.), pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.botus, dose: '1 l/ha' },
            { product: P.fortuna, dose: '1 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Faza (H)\nPrecvetanje',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.vegas, dose: 'ili 0,25 - 0,35 l/ha' },
            { product: P.fortuna, dose: 'ili 1 kg/ha' },
          ],
        },
        {
          target: 'Lisne vaši, lisni mineri',
          targetType: 'insekticid',
          products: [
            { product: P.epic, productName: 'Epic 200 SL', dose: '0,2 l/ha' },
            { product: P.monofos, dose: 'ili 0,2 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Faza (I)\nFormirani plodovi',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '1 l/ha' },
            { product: P.vegas, dose: 'ili 0,25 - 0,35 l/ha' },
          ],
        },
        {
          target: 'Jabukin smotavac, lisne vaši, lisni mineri',
          targetType: 'insekticid',
          products: [
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '1 l/ha' },
            {
              product: P.futocis,
              productName: 'Futocis 2.5 EC',
              dose: '0,5 l/ha',
              combineWithPrevious: true,
            },
          ],
        },
      ],
    },
    {
      stage: 'Faza (J)\nFormirani plodovi',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '1 l/ha' },
            { product: P.vegas, dose: 'ili 0,25 - 0,35 l/ha' },
          ],
        },
        {
          target: 'Jabukin smotavac',
          targetType: 'insekticid',
          products: [{ productName: 'Pancir 200 SC', dose: '0,2 l/ha' }],
        },
      ],
    },
    {
      stage: 'Faza (J2 - K)\nPorast plodova',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.lotto, dose: '0,4 l/ha' },
          ],
        },
        {
          target: 'Jabukin smotavac, lisne vaši, lisni mineri',
          targetType: 'insekticid',
          products: [
            { product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon 7 - 15 dana',
      targets: [
        {
          target: 'Čađava krastavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '1 l/ha' },
            { product: P.vegas, dose: 'ili 0,25 - 0,35 l/ha' },
          ],
        },
        {
          target: 'Jabukin smotavac, lisne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon 7 - 15 dana',
      targets: [
        {
          target: 'Čađava krastavost, skladišne bolesti',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.botus, dose: '1 l/ha' },
            { product: P.lotto, dose: '0,4 l/ha' },
          ],
        },
        {
          target: 'Jabukin smotavac, lisne vaši',
          targetType: 'insekticid',
          products: [
            { productName: 'Pancir 200 SC', dose: '0,3 l/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon 7 - 15 dana',
      targets: [
        {
          target: 'Čađava krastavost, skladišne bolesti',
          targetType: 'fungicid',
          products: [{ product: P.kanton, dose: '0,7 kg/ha' }],
        },
        {
          target: 'Lisne vaši, mineri, jabukin smotavac, jabukina voćna osa',
          targetType: 'insekticid',
          products: [
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon 7 - 15 dana',
      targets: [
        {
          target: 'Skladišne bolesti',
          targetType: 'fungicid',
          products: [{ product: P.feribot, productName: 'Feribot 225 SC', dose: '1 l/ha' }],
        },
        {
          target: 'Jabukin smotavac, lisni mineri',
          targetType: 'insekticid',
          products: [{ product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' }],
        },
      ],
    },
    {
      stage: '7 dana pred berbu',
      targets: [
        {
          target: 'Skladišne bolesti',
          targetType: 'fungicid',
          products: [{ product: P.feribot, productName: 'Feribot 225 SC', dose: '1 l/ha' }],
        },
        {
          target: 'Jabukin smotavac, lisni mineri',
          targetType: 'insekticid',
          products: [{ product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' }],
        },
      ],
    },
    {
      stage: 'U toku vegetacije po potrebi',
      targets: [
        {
          target: 'Grinje',
          targetType: 'akaricid',
          products: [{ product: P.bektin, productName: 'Bektin 18 EC', dose: '1,5 l/ha' }],
        },
      ],
    },
  ],
}

// ── Kruška (p7-8) ───────────────────────────────────────────────────────────

const KRUSKA: CultureSeed = {
  cultureId: 19,
  slug: 'kruska',
  imageId: 51,
  description:
    'Kompletan program zaštite kruške po fenofazama — od kretanja vegetacije do berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite kruške po fenofazama — od kretanja vegetacije do berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite kruške',
  stages: [
    {
      stage: 'Kretanje vegetacije',
      targets: [
        {
          target: 'Kruškina buva',
          targetType: 'insekticid',
          products: [mineralnoUlje, notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Bubrenje pupoljaka',
      targets: [
        {
          target: 'Čađava krastavost, bakteriozna plamenjača',
          targetType: 'fungicid',
          products: [bakarni],
        },
      ],
    },
    {
      stage: 'Mišije uši',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [{ product: P.kanton, dose: '0,7 kg/ha' }],
        },
        {
          target: 'Kruškina buva',
          targetType: 'insekticid',
          products: [
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '1 l/ha' },
            notikorRow('0,3 l/ha'),
          ],
        },
      ],
    },
    {
      stage: 'Beli baloni',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.calcio, dose: '0,2 kg/ha' },
            { product: P.fortuna, dose: '1 kg/ha' },
          ],
        },
        {
          target: 'Kruškina buva, vaši, smotavci, voćne ose',
          targetType: 'insekticid',
          products: [
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' },
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '1 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Cvetanje',
      targets: [
        {
          target: 'Čađava krastavost, rđa kruške, bakteriozna plamenjača, kruškina buva, endofitne gljive',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.botus, dose: '1 l/ha' },
            { product: P.fortuna, dose: '1 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Precvetavanje',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
            { product: P.fortuna, dose: '1 kg/ha' },
          ],
        },
        {
          target: 'Kruškina buva',
          targetType: 'insekticid',
          products: [
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' },
            { product: P.epic, productName: 'Epic 200 SL', dose: '0,3 l/ha' },
            { ...mineralnoUlje, dose: '3 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Oformljeni plodovi',
      targets: [
        {
          target: 'Čađava krastavost, siva pegavost, rđa kruške',
          targetType: 'fungicid',
          products: [
            { product: P.venpan, dose: '1 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Biljne vaši, kruškina buva',
          targetType: 'insekticid',
          products: [
            { product: P.bektin, productName: 'Bektin 18 EC', dose: '1,5 l/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '1 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Porast plodova',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.lotto, dose: '0,4 l/ha' },
          ],
        },
        {
          target: 'Kruškina buva, biljne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.epic, productName: 'Epic 200 SL', dose: '0,3 l/ha' },
            { product: P.monofos, dose: '0,3 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon 7 - 15 dana',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [{ product: P.venpan, dose: '1 l/ha' }],
        },
        {
          target: 'Jabukin smotavac, kruškina buva, biljne vaši',
          targetType: 'insekticid',
          products: [
            { productName: 'Pancir 200 SC', dose: '0,2 l/ha' },
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '1 l/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon 7 - 15 dana',
      targets: [
        {
          target: 'Čađava krastavost',
          targetType: 'fungicid',
          products: [{ product: P.kanton, dose: '0,7 kg/ha' }],
        },
        {
          target: 'Jabukin smotavac, kruškina buva',
          targetType: 'insekticid',
          products: [
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon 7 - 15 dana',
      targets: [
        {
          target: 'Skladišne bolesti',
          targetType: 'fungicid',
          products: [{ product: P.feribot, productName: 'Feribot 225 SC', dose: '1 l/ha' }],
        },
        {
          target: 'Kruškina buva, jabukin smotavac',
          targetType: 'insekticid',
          products: [
            { product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' },
            { product: P.nexiram, productName: 'Nexiram 10 EC', dose: '1 l/ha' },
          ],
        },
      ],
    },
    {
      stage: '15 dana pred berbu',
      targets: [
        {
          target: 'Skladišne bolesti',
          targetType: 'fungicid',
          products: [{ product: P.feribot, productName: 'Feribot 225 SC', dose: '1 l/ha' }],
        },
        {
          target: 'Kruškina buva, jabukin smotavac',
          targetType: 'insekticid',
          products: [
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' },
          ],
        },
      ],
    },
  ],
}

// ── Šljiva (p9) ─────────────────────────────────────────────────────────────

const SLJIVA: CultureSeed = {
  cultureId: 20,
  slug: 'sljiva',
  imageId: 52,
  description:
    'Kompletan program zaštite šljive — od bubrenja cvetnih pupoljaka do berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite šljive po fenofazama — od bubrenja cvetnih pupoljaka do berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite šljive',
  stages: [
    {
      stage: 'Prvo prolećno tretiranje,\nbubrenje cvetnih pupoljaka',
      targets: [
        {
          target: 'Monilija, šupljikavost lišća',
          targetType: 'fungicid',
          products: [bakarni, mineralnoUlje],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Beli baloni',
      targets: [
        {
          target: 'Monilija, štetni insekti',
          targetType: 'fungicid',
          products: [{ product: P.calcio, dose: '0,2 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Cvetanje',
      targets: [
        {
          target: 'Monilija',
          targetType: 'fungicid',
          products: [{ product: P.markiz, dose: '0,75 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Precvetavanje',
      targets: [
        {
          target: 'Monilija, šupljikavost lišća, plamenjača',
          targetType: 'fungicid',
          products: [
            { product: P.calcio, dose: '0,2 kg/ha' },
            { product: P.kanton, dose: '0,7 kg/ha' },
          ],
        },
        {
          target: 'Osa šljive, biljne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.epic, productName: 'Epic 20 SL', dose: '0,2 l/ha' },
            { product: P.monofos, dose: 'ili 0,2 kg/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Plod oformljen',
      targets: [
        {
          target: 'Šupljikavost lišća, monilija',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.lotto, dose: '0,75 l/ha' },
          ],
        },
        {
          target: 'Šljivin smotavac, biljne vaši',
          targetType: 'insekticid',
          products: [
            { productName: 'Pancir 200 SC', dose: '0,2 l/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Dve nedelje kasnije\n(promena boje ploda)',
      targets: [
        {
          target: 'Šupljikavost lišća, trulež plodova',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.feribot, productName: 'Feribot 225 SC', dose: '1 l/ha' },
          ],
        },
        {
          target: 'Šljivin smotavac',
          targetType: 'insekticid',
          products: [{ product: P.nexiram, productName: 'Nexiram 10 EC', dose: '1 l/ha' }],
        },
      ],
    },
    {
      stage: 'Dve nedelje pred berbu',
      targets: [
        {
          target: 'Trulež plodova',
          targetType: 'fungicid',
          products: [{ product: P.markiz, dose: '0,75 kg/ha' }],
        },
        {
          target: 'Šljivin smotavac',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
      ],
    },
  ],
}

// ── Višnja (p10) ────────────────────────────────────────────────────────────

const VISNJA: CultureSeed = {
  cultureId: 21,
  slug: 'visnja',
  imageId: 53,
  description:
    'Kompletan program zaštite višnje — od bubrenja cvetnih pupoljaka do posle berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite višnje po fenofazama — od bubrenja cvetnih pupoljaka do posle berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite višnje',
  stages: [
    {
      stage: 'Prvo prolećno tretiranje,\nbubrenje cvetnih pupoljaka',
      targets: [
        {
          target: 'Monilija, šupljikavost lišća',
          targetType: 'fungicid',
          products: [bakarni, mineralnoUlje],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Beli baloni',
      targets: [
        {
          target: 'Monilija',
          targetType: 'fungicid',
          products: [{ product: P.calcio, dose: '0,2 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Cvetanje',
      targets: [
        {
          target: 'Monilija',
          targetType: 'fungicid',
          products: [{ product: P.markiz, dose: '0,75 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Precvetavanje',
      targets: [
        {
          target: 'Monilija, šupljikavost lišća',
          targetType: 'fungicid',
          products: [
            { product: P.calcio, dose: '0,2 kg/ha' },
            { product: P.kanton, dose: '0,7 kg/ha' },
          ],
        },
        {
          target: 'Surlaš višnje, biljne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
            { product: P.monofos, dose: '0,3 kg/ha' },
            { product: P.epic, productName: 'Epic 20 SL', dose: 'ili 0,3 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Plodovi veličine zrna graška',
      targets: [
        {
          target: 'Monilija, šupljikavost i pegavost lista',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.lotto, dose: '0,75 l/ha' },
          ],
        },
        {
          target: 'Trešnjina muva, biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
    {
      stage: 'Promena boje ploda',
      targets: [
        {
          target: 'Trulež ploda, pegavost lista',
          targetType: 'fungicid',
          products: [{ product: P.markiz, dose: '0,75 kg/ha' }],
        },
        {
          target: 'Biljne vaši, trešnjina muva',
          targetType: 'insekticid',
          products: [{ product: P.epic, productName: 'Epic 200 SL', dose: '0,25 l/ha' }],
        },
      ],
    },
    {
      stage: 'Dve nedelje pre berbe',
      targets: [
        {
          target: 'Trulež ploda',
          targetType: 'fungicid',
          products: [
            { product: P.feribot, productName: 'Feribot 225 SC', dose: '1 l/ha' },
            { product: P.markiz, dose: 'ili 0,75 kg/ha' },
          ],
        },
        {
          target: 'Trešnjina muva',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
      ],
    },
    {
      stage: 'Posle berbe',
      targets: [
        {
          target: 'Lisna pegavost',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.vegas, dose: '0,25 - 0,3 l/ha' },
          ],
        },
        {
          target: 'Grinje',
          targetType: 'akaricid',
          products: [{ product: P.bektin, productName: 'Bektin 18 EC', dose: '1,5 l/ha' }],
        },
      ],
    },
  ],
}

// ── Breskva (p11-12) ────────────────────────────────────────────────────────

const BRESKVA: CultureSeed = {
  cultureId: 22,
  slug: 'breskva',
  imageId: 54,
  description:
    'Kompletan program zaštite breskve — od mirovanja vegetacije do posle berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite breskve po fenofazama — od mirovanja vegetacije do posle berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite breskve',
  stages: [
    {
      stage: 'Mirovanje vegetacije',
      targets: [
        {
          target: 'Kovrdžavost lista, šupljikavost lista',
          targetType: 'fungicid',
          products: [bakarni, mineralnoUlje],
        },
        {
          target: 'Prezimljujuće forme štetnih insekata',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Na početku, bubrenje pupoljaka',
      targets: [
        { target: 'Kovrdžavost lista', targetType: 'fungicid', products: [ciram] },
      ],
    },
    {
      stage: 'Zelena tačka',
      targets: [
        { target: 'Kovrdžavost lista', targetType: 'fungicid', products: [ciram] },
      ],
    },
    {
      stage: 'Roze pupoljak',
      targets: [
        {
          target: 'Kovrdžavost lista, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '1 kg/ha' },
            { product: P.lotto, dose: 'ili 0,75 l/ha' },
          ],
        },
        {
          target: 'Tripsi',
          targetType: 'insekticid',
          products: [{ product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' }],
        },
        { targetType: 'biostimulator', products: [vitazymeRow('1 l/ha')] },
      ],
    },
    {
      stage: 'Cvetanje',
      targets: [
        {
          target: 'Monilija',
          targetType: 'fungicid',
          products: [{ product: P.calcio, dose: '0,2 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Precvetavanje',
      targets: [
        {
          target: 'Monilija, pepelnica, šupljikavost lista',
          targetType: 'fungicid',
          products: [
            { product: P.markiz, dose: '0,75 kg/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Tripsi, biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.epic, productName: 'Epic 20 SL', dose: '0,3 l/ha' }],
        },
      ],
    },
    {
      stage: 'Formirani plodovi',
      targets: [
        {
          target: 'Monilija, pepelnica, šupljikavost lista',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Breskvin smotavac, biljne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Nakon proređivanja',
      targets: [
        {
          target: 'Monilija, pepelnica, šupljikavost lista',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.lotto, dose: '0,75 l/ha' },
          ],
        },
        {
          target: 'Breskvin smotavac, biljne vaši, tripsi',
          targetType: 'insekticid',
          products: [
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' },
            { product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' },
          ],
        },
      ],
    },
    {
      stage: '15 dana nakon proređivanja',
      targets: [
        {
          target: 'Monilija, šupljikavost lista',
          targetType: 'fungicid',
          products: [{ product: P.markiz, dose: '0,75 kg/ha' }],
        },
        {
          target: 'Breskvin smotavac, biljne vaši',
          targetType: 'insekticid',
          products: [
            { product: P.atletic, productName: 'Atletic 095 SG', dose: '3 kg/ha' },
            { product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Poslednji tretman pred berbu',
      targets: [
        {
          target: 'Trulež ploda',
          targetType: 'fungicid',
          products: [{ product: P.feribot, productName: 'Feribot 225 SC', dose: '1 l/ha' }],
        },
        {
          target: 'Breskvin smotavac, biljne vaši, tripsi',
          targetType: 'insekticid',
          products: [{ product: P.skener, productName: 'Skener 240 SC', dose: '0,4 l/ha' }],
        },
      ],
    },
    {
      stage: 'Posle berbe',
      targets: [
        {
          target: 'Grinje',
          targetType: 'akaricid',
          products: [{ product: P.bektin, productName: 'Bektin 18 EC', dose: '1,5 l/ha' }],
        },
      ],
    },
  ],
}

// ── Malina (p13-14) ─────────────────────────────────────────────────────────

const MALINA: CultureSeed = {
  cultureId: 23,
  slug: 'malina',
  imageId: 55,
  description:
    'Kompletan program zaštite maline — od prolećnih tretiranja do posle berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite maline po razvojnim fazama — od prolećnih tretiranja do posle berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite maline',
  stages: [
    {
      stage: 'Prvo prolećno tretiranje,\nbubrenje cvetnih pupoljaka - pucanje pupoljaka',
      targets: [
        {
          target: 'Didimela, sušenje lastara, antraknoza',
          targetType: 'fungicid',
          products: [bakarni, mineralnoUlje],
        },
        {
          target: 'Prezimljavajuće forme štetočina (biljne vaši, eriofidne grinje)',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Drugo prolećno tretiranje,\ntokom početka listanja',
      targets: [
        { target: 'Didimela, antraknoza', targetType: 'fungicid', products: [bakarni] },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [
            { product: P.monofos, dose: '0,2 kg/ha' },
            { product: P.epic, productName: 'Epic 20 SL', dose: 'ili 0,2 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Treće prolećno tretiranje,\npred jasno izdvajanje cvetnih pupoljaka\n(bočni lastari dužine 10 - 15 cm)',
      targets: [
        {
          target: 'Didimela, siva trulež, rđa maline',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Biljne vaši, cvetojed maline, mušica maline',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
        {
          target: 'Eriofidna grinja lista',
          targetType: 'akaricid',
          products: [{ product: P.bektin, productName: 'Bektin 18 EC', dose: '1 l/ha' }],
        },
      ],
    },
    {
      stage: 'Četvrto prolećno tretiranje,\nneposredno pre cvetanja',
      targets: [
        {
          target: 'Plamenjača maline',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '1 l/ha' }],
        },
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [{ product: P.botus, dose: '2 l/ha' }],
        },
        {
          target: 'Didimela, rđa',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }, vitazymeRow('1 l/ha')],
        },
        {
          target: 'Malinina buba, cvetojed maline, mušica maline',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
      ],
    },
    {
      stage: '14 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež, didimela',
          targetType: 'fungicid',
          products: [
            { product: P.enygma, dose: '0,8 kg/ha' },
            { product: P.markiz, dose: 'ili 1,5 kg/ha' },
            { product: P.exacta, dose: '0,75 l/ha' },
          ],
        },
      ],
    },
    {
      stage: '7 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež plodova',
          targetType: 'fungicid',
          products: [{ product: P.enygma, dose: '0,8 kg/ha' }, vitazymeRow('0,7 l/ha')],
        },
      ],
    },
    {
      stage: '3 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež plodova',
          targetType: 'fungicid',
          products: [
            { productName: 'Timorex Gold', dose: '2 l/ha' },
            { productName: 'Agrobiovit', dose: 'ili 0,4 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Posle berbe',
      targets: [
        {
          target: 'Didimela, rđa, sušenje lastara, antraknoza',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Muva galica',
          targetType: 'insekticid',
          products: [
            { product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' },
            { product: P.bektin, productName: 'Bektin 18 EC', dose: '1 l/ha' },
          ],
        },
      ],
    },
  ],
}

// ── Kupina (p15) ────────────────────────────────────────────────────────────

const KUPINA: CultureSeed = {
  cultureId: 24,
  slug: 'kupina',
  imageId: 56,
  description:
    'Kompletan program zaštite kupine — od bubrenja pupoljaka do posle berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite kupine po razvojnim fazama — od bubrenja pupoljaka do posle berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite kupine',
  stages: [
    {
      stage: 'Bubrenje, pucanje pupoljaka',
      targets: [
        {
          target: 'Bolesti izdanka',
          targetType: 'fungicid',
          products: [bakarni, mineralnoUlje],
        },
        {
          target: 'Prezimljavajuće forme insekata',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Početak listanja',
      targets: [
        {
          target: 'Bolesti izdanaka',
          targetType: 'fungicid',
          products: [{ product: P.kanton, dose: '0,7 kg/ha' }],
        },
        {
          target: 'Eriofidne grinje',
          targetType: 'akaricid',
          products: [{ product: P.bektin, productName: 'Bektin 18 EC', dose: '1 l/ha' }],
        },
      ],
    },
    {
      stage: 'Pred jasno izdvajanje zatvorenih cvetova',
      targets: [
        {
          target: 'Rđa kupine, ljubičasta pegavost',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [
            { product: P.monofos, dose: '0,2 kg/ha' },
            { product: P.epic, productName: 'Epic 20 SL', dose: 'ili 0,2 l/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Neposredno pred cvetanje',
      targets: [
        {
          target: 'Rđa kupine, ljubičasta pegavost, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.vegas, dose: '0,25 l/ha' },
            { product: P.botus, dose: '2 l/ha' },
          ],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
        { targetType: 'biostimulator', products: [vitazymeRow('1 l/ha')] },
      ],
    },
    {
      stage: 'Cvetanje\n(14 dana pred berbu)',
      targets: [
        {
          target: 'Siva trulež plodova, ljubičasta pegavost',
          targetType: 'fungicid',
          products: [
            { product: P.enygma, dose: '0,8 kg/ha' },
            { product: P.exacta, dose: '0,75 l/ha' },
          ],
        },
      ],
    },
    {
      stage: '7 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [{ product: P.enygma, dose: '0,8 kg/ha' }, vitazymeRow('1 l/ha')],
        },
      ],
    },
    {
      stage: '3 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [
            { productName: 'Timorex Gold', dose: '2 l/ha' },
            { productName: 'Agrobiovit', dose: 'ili 0,4 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Posle berbe',
      targets: [
        {
          target: 'Bolesti izdanka',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
          ],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
  ],
}

// ── Jagoda (p16) ────────────────────────────────────────────────────────────
// Note: brochure's "Drugo prolećno tretiranje" row has a typesetting bug (the
// dose column repeats the target text), so those doses are intentionally empty.

const JAGODA: CultureSeed = {
  cultureId: 26,
  slug: 'jagoda',
  imageId: 58,
  description:
    'Kompletan program zaštite jagode — od kretanja vegetacije do posle berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite jagode po razvojnim fazama — od kretanja vegetacije do posle berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite jagode',
  stages: [
    {
      stage: 'Prvo prolećno tretiranje - kretanje vegetacije',
      targets: [
        {
          target: 'Pegavost lista',
          targetType: 'fungicid',
          products: [{ product: P.primus480, dose: '3 l/ha' }],
        },
        {
          target: 'Vlažna trulež korenovog vrata, plamenjača',
          targetType: 'fungicid',
          products: [{ product: P.fortuna, dose: '2,5 kg/ha' }, vitazymeRow('1 l/ha')],
        },
      ],
    },
    {
      stage: 'Drugo prolećno tretiranje - formiranje cvetnih pupoljaka',
      targets: [
        {
          target: 'Pegavost lista',
          targetType: 'fungicid',
          products: [{ product: P.primus480 }, { product: P.lotto }],
        },
        {
          target: 'Cvetojed jagode, biljne vaši, grinje',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC' }],
        },
        {
          target: 'Zemljišni patogeni',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit' }],
        },
      ],
    },
    {
      stage: 'Treće prolećno tretiranje, neposredno pre cvetanja',
      targets: [
        {
          target: 'Antraknoza, pegavost lista, pepelnica, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.vegas, dose: '0,25 l/ha' },
            { product: P.botus, dose: '2 l/ha' },
          ],
        },
        {
          target: 'Vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Početak cvetanja',
      targets: [
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.botus, dose: '2 l/ha' },
            { product: P.markiz, dose: 'ili 1,5 kg/ha' },
            vitazymeRow('0,7 l/ha'),
          ],
        },
        {
          target: 'Antraknoza, pegavost lista, pepelnica',
          targetType: 'fungicid',
          products: [{ product: P.exacta, dose: '0,75 l/ha' }],
        },
      ],
    },
    {
      stage: 'Puno cvetanje',
      targets: [
        {
          target: 'Siva trulež plodova',
          targetType: 'fungicid',
          products: [{ product: P.enygma, dose: '0,8 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Početak sazrevanja plodova\n(do 7 dana pre berbe)',
      targets: [
        {
          target: 'Siva trulež plodova',
          targetType: 'fungicid',
          products: [{ product: P.enygma, dose: '0,8 kg/ha' }],
        },
      ],
    },
    {
      stage: '3 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež plodova',
          targetType: 'fungicid',
          products: [{ productName: 'Timorex Gold', dose: '2 l/ha' }, vitazymeRow('0,7 l/ha')],
        },
      ],
    },
    {
      stage: 'U toku berbe',
      targets: [
        {
          target: 'Siva trulež plodova',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha' }],
        },
      ],
    },
    {
      stage: 'Posle berbe',
      targets: [
        {
          target: 'Pegavost lista, antraknoza, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.primus, productName: 'Primus 80 WG', dose: '2 kg/ha' },
            { product: P.lotto, dose: '0,75 l/ha' },
          ],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
        {
          target: 'Zemljišni patogeni',
          targetType: 'fungicid',
          products: [{ productName: 'Agrobiovit', dose: '0,4 kg/ha (kap po kap)' }],
        },
      ],
    },
  ],
}

// ── Borovnica (p17) ─────────────────────────────────────────────────────────

const BOROVNICA: CultureSeed = {
  cultureId: 25,
  slug: 'borovnica',
  imageId: 57,
  description:
    'Kompletan program zaštite borovnice — od završetka mirovanja vegetacije do posle berbe, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite borovnice po razvojnim fazama — od završetka mirovanja vegetacije do posle berbe. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite borovnice',
  stages: [
    {
      stage: 'Završetak mirovanja vegetacije',
      targets: [
        {
          target: 'Bolesti izdanaka, rak stabla, antraknoza',
          targetType: 'fungicid',
          products: [bakarni, mineralnoUlje],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
    {
      stage: 'Pucanje pupoljaka',
      targets: [
        {
          target: 'Bolesti izdanaka, rak stabla, antraknoza',
          targetType: 'fungicid',
          products: [{ product: P.primus, productName: 'Primus 80 WG', dose: '2 kg/ha' }],
        },
        {
          target: 'Biljne vaši',
          targetType: 'insekticid',
          products: [{ product: P.figaro, productName: 'Figaro 50 WG', dose: '0,14 kg/ha' }],
        },
        { targetType: 'biostimulator', products: [vitazymeRow('1 l/ha')] },
      ],
    },
    {
      stage: 'Cvetanje',
      targets: [
        {
          target: 'Monilija, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.botus, dose: '2 l/ha' },
            { product: P.enygma, dose: 'ili 0,8 kg/ha' },
          ],
        },
      ],
    },
    {
      stage: 'Precvetavanje\n(pred početak zrenja)',
      targets: [
        {
          target: 'Monilija, siva trulež',
          targetType: 'fungicid',
          products: [{ product: P.enygma, dose: '0,8 kg/ha' }],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
      ],
    },
    {
      stage: '7 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [{ product: P.enygma, dose: '0,8 kg/ha' }],
        },
      ],
    },
    {
      stage: '3 dana pred berbu',
      targets: [
        {
          target: 'Siva trulež',
          targetType: 'fungicid',
          products: [
            { productName: 'Timorex Gold', dose: '2 l/ha' },
            { productName: 'Agrobiovit', dose: 'ili 0,4 kg/ha' },
            vitazymeRow('1 l/ha'),
          ],
        },
      ],
    },
    {
      stage: 'Posle berbe',
      targets: [
        {
          target: 'Bolesti izdanaka',
          targetType: 'fungicid',
          products: [{ product: P.primus, productName: 'Primus 80 WG', dose: '2 kg/ha' }],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
  ],
}

// ── Vinova loza (p18) ───────────────────────────────────────────────────────

const VINOVA_LOZA: CultureSeed = {
  cultureId: 27,
  slug: 'vinova-loza',
  imageId: 59,
  description:
    'Kompletan program zaštite vinove loze — od kretanja vegetacije do početka šarka, sa preporučenim preparatima i dozama.',
  intro:
    'Preporučeni program zaštite vinove loze po fenofazama — od kretanja vegetacije do početka šarka. Kliknite na preparat za detalje iz našeg kataloga.',
  blockTitle: 'Plan zaštite vinove loze',
  stages: [
    {
      stage: 'Pre kretanja vegetacije',
      targets: [
        {
          target: 'Prezimljavajuće forme patogena, insekata i grinja',
          targetType: 'ostalo',
          products: [bakarni, mineralnoUlje],
        },
      ],
    },
    {
      stage: 'Lastari dužina 5 - 10 cm',
      targets: [
        {
          target: 'Crna pegavost, pepelnica',
          targetType: 'fungicid',
          products: [{ product: P.kanton, dose: '0,7 kg/ha' }, sumpor],
        },
        {
          target: 'Štetni insekti',
          targetType: 'insekticid',
          products: [notikorRow('0,3 l/ha')],
        },
      ],
    },
    {
      stage: 'Lastari dužina 20 - 30 cm',
      targets: [
        {
          target: 'Plamenjača, crna pegavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.fortuna, dose: '2 kg/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
            vitazymeRow('1 l/ha'),
          ],
        },
      ],
    },
    {
      stage: 'Pre cvetanja',
      targets: [
        {
          target: 'Plamenjača, crna pegavost, pepelnica',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.fortuna, dose: '2 kg/ha' },
            { product: P.lotto, dose: '0,75 l/ha' },
          ],
        },
        {
          target: 'Grožđani moljci',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,5 l/ha' }],
        },
      ],
    },
    {
      stage: 'Precvetavanje',
      targets: [
        {
          target: 'Plamenjača, crna pegavost, pepelnica, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.kanton, dose: '0,7 kg/ha' },
            { product: P.botus, dose: '2 l/ha' },
            sumpor,
            vitazymeRow('1 l/ha'),
          ],
        },
      ],
    },
    {
      stage: 'Formiranje bobica',
      targets: [
        {
          target: 'Plamenjača, pepelnica, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.fortuna, dose: '2 kg/ha' },
            { product: P.lotto, dose: '0,75 l/ha' },
            { product: P.enygma, dose: '0,8 kg/ha' },
          ],
        },
        {
          target: 'Grožđani moljac',
          targetType: 'insekticid',
          products: [{ productName: 'Pancir 200 SC', dose: '0,2 l/ha' }],
        },
      ],
    },
    {
      stage: 'Formiran grozd',
      targets: [
        {
          target: 'Plamenjača, pepelnica, siva trulež',
          targetType: 'fungicid',
          products: [
            { product: P.primus480, dose: '3 l/ha' },
            { product: P.vegas, dose: '0,25 l/ha' },
            { product: P.enygma, dose: '0,8 kg/ha' },
          ],
        },
        {
          target: 'Grožđani moljac',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
      ],
    },
    {
      stage: 'Početak šarka',
      targets: [
        {
          target: 'Plamenjača',
          targetType: 'fungicid',
          products: [bakarni],
        },
        {
          target: 'Pepelnica, siva trulež',
          targetType: 'fungicid',
          products: [sumpor, { product: P.enygma, dose: '0,8 kg/ha' }],
        },
        {
          target: 'Grožđani moljci',
          targetType: 'insekticid',
          products: [{ product: P.futocis, productName: 'Futocis 2.5 EC', dose: '0,3 l/ha' }],
        },
        { targetType: 'biostimulator', products: [vitazymeRow('0,7 l/ha')] },
      ],
    },
  ],
}

const CULTURES: CultureSeed[] = [
  JABUKA,
  KRUSKA,
  SLJIVA,
  VISNJA,
  BRESKVA,
  MALINA,
  KUPINA,
  JAGODA,
  BOROVNICA,
  VINOVA_LOZA,
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
