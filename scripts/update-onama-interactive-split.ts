/**
 * Replaces the static 2-col "Zaštita bilja / Ishrana bilja" content block on
 * the O nama page with the new `interactiveSplit` block (animated, themed,
 * with sub-category chip links).
 *
 * Run: pnpm tsx scripts/update-onama-interactive-split.ts
 */

export {}

const API = process.env.PAYLOAD_API ?? 'http://localhost:3001/api'
const EMAIL = process.env.PAYLOAD_EMAIL ?? 'stefan.kupresak@icloud.com'
const PASSWORD = process.env.PAYLOAD_PASSWORD ?? 'rogueftw17'

async function login(): Promise<string> {
  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const { token } = (await res.json()) as { token: string }
  return token
}

async function fetchPage(token: string): Promise<any> {
  const res = await fetch(
    `${API}/pages?where[slug][equals]=o-nama&depth=2&draft=true&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${await res.text()}`)
  const { docs } = (await res.json()) as { docs: any[] }
  if (!docs?.length) throw new Error('o-nama not found')
  return docs[0]
}

async function findCategoryId(token: string, slug: string): Promise<number> {
  const res = await fetch(
    `${API}/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  const { docs } = (await res.json()) as { docs: any[] }
  if (!docs?.[0]) throw new Error(`Category "${slug}" not found`)
  return docs[0].id
}

const categoryRef = (id: number) => ({
  type: 'reference' as const,
  reference: { relationTo: 'categories', value: id },
  url: null,
  newTab: false,
})

const customLink = (label: string, url: string) => ({
  type: 'custom' as const,
  reference: null,
  url,
  newTab: false,
  label,
})

async function buildInteractiveSplit(token: string) {
  // Resolve category IDs by slug so the script is robust to id shifts.
  const slugs = {
    zastitaBilja: 'zastita-bilja',
    ishranaBilja: 'ishrana-bilja',
    herbicidi: 'herbicidi',
    fungicidi: 'fungicidi',
    insekticidi: 'insekticidi',
    akaricidi: 'akaricidi',
    okvasivaci: 'okvaivai', // existing slug from migrate (typo preserved by serbianSlugify)
    cvrstaDjubriva: 'cvrsta-djubriva',
    vodotopivaDjubriva: 'vodotopiva-djubriva',
    folijarnaDjubriva: 'folijarna-i-tecna-djubriva',
    biostimulatori: 'biostimulatori',
    korektori: 'korektori-nedostataka',
  }
  const ids = Object.fromEntries(
    await Promise.all(
      Object.entries(slugs).map(async ([k, s]) => [k, await findCategoryId(token, s)]),
    ),
  ) as Record<keyof typeof slugs, number>

  return {
    blockType: 'interactiveSplit',
    blockName: null,
    eyebrow: 'Naš asortiman',
    heading: 'Dva stuba uspešne sezone',
    subheading:
      'Bilo da treba da zaštitite useve ili obezbedite optimalnu ishranu, krenite od kategorije koja vam je sada potrebna.',
    cards: [
      {
        icon: 'shield',
        theme: 'emerald',
        title: 'Zaštita bilja',
        description:
          'Proverene formulacije za kontrolu korova, bolesti i štetočina — od pripreme do berbe.',
        statValue: '5',
        statLabel: 'podkategorija',
        primaryLink: {
          ...categoryRef(ids.zastitaBilja),
          label: 'Pogledaj sve kategorije zaštite',
        },
        chips: [
          { link: { ...categoryRef(ids.herbicidi), label: 'Herbicidi' } },
          { link: { ...categoryRef(ids.fungicidi), label: 'Fungicidi' } },
          { link: { ...categoryRef(ids.insekticidi), label: 'Insekticidi' } },
          { link: { ...categoryRef(ids.akaricidi), label: 'Akaricidi' } },
          { link: { ...categoryRef(ids.okvasivaci), label: 'Okvašivači' } },
        ],
      },
      {
        icon: 'sprout',
        theme: 'amber',
        title: 'Ishrana bilja',
        description:
          'Đubriva, biostimulatori i korektori prilagođeni svakoj kulturi i fazi razvoja biljke.',
        statValue: '5',
        statLabel: 'podkategorija',
        primaryLink: {
          ...categoryRef(ids.ishranaBilja),
          label: 'Pogledaj sve kategorije ishrane',
        },
        chips: [
          { link: { ...categoryRef(ids.cvrstaDjubriva), label: 'Čvrsta đubriva' } },
          { link: { ...categoryRef(ids.vodotopivaDjubriva), label: 'Vodotopiva đubriva' } },
          { link: { ...categoryRef(ids.folijarnaDjubriva), label: 'Folijarna đubriva' } },
          { link: { ...categoryRef(ids.biostimulatori), label: 'Biostimulatori' } },
          { link: { ...categoryRef(ids.korektori), label: 'Korektori nedostataka' } },
        ],
      },
    ],
  }
}

async function patchPage(token: string, id: number, layout: any[]) {
  const res = await fetch(`${API}/pages/${id}?draft=false`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ layout, _status: 'published' }),
  })
  if (!res.ok) throw new Error(`Patch failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function main() {
  console.log('Logging in...')
  const token = await login()

  console.log('Fetching o-nama...')
  const page = await fetchPage(token)
  console.log(`Page id=${page.id}, current ${page.layout.length} blocks:`)
  page.layout.forEach((b: any, i: number) => console.log(`  ${i}. ${b.blockType}`))

  // Find the services content block (the 2-col with Zaštita + Ishrana). It's
  // the only `content` block right after the first `richTextImage`.
  const idx = page.layout.findIndex((b: any) => b.blockType === 'content')
  if (idx < 0) throw new Error('No content block to replace.')

  console.log(`\nReplacing block at index ${idx} (${page.layout[idx].blockType}) with interactiveSplit...`)
  const split = await buildInteractiveSplit(token)
  const newLayout = [
    ...page.layout.slice(0, idx),
    split,
    ...page.layout.slice(idx + 1),
  ]

  console.log('New layout:')
  newLayout.forEach((b: any, i: number) => console.log(`  ${i}. ${b.blockType}`))

  if (process.argv.includes('--dry-run')) {
    console.log('\n--dry-run: not patching.')
    return
  }

  console.log('\nPatching...')
  await patchPage(token, page.id, newLayout)
  console.log('Done. Visit /o-nama to verify.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
