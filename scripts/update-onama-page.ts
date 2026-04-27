/**
 * One-shot script to redesign the "O nama" page via the Payload REST API.
 *
 * Run with: pnpm tsx scripts/update-onama-page.ts
 *
 * What it does:
 *   1. Logs in to Payload as admin.
 *   2. Fetches the existing "o-nama" page so we can keep the hero, "Ko smo mi"
 *      block, "Naša misija" block, and the closing CTA verbatim.
 *   3. Removes the "Semenski materijal" column from the 3-col services block
 *      and rebalances the two remaining columns to half-width.
 *   4. Replaces the old "Zašto Agroarm?" heading + two text columns with a
 *      single icon-driven `featureGrid` block.
 *   5. PATCHes the page and republishes (status: 'published').
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
  if (!token) throw new Error('No token in login response')
  return token
}

async function fetchPage(token: string): Promise<any> {
  const res = await fetch(
    `${API}/pages?where[slug][equals]=o-nama&depth=2&draft=true&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  if (!res.ok) throw new Error(`Fetch page failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { docs: any[] }
  if (!data.docs?.length) throw new Error('o-nama page not found')
  return data.docs[0]
}

// Build a richText "Zašto Agroarm?" lead paragraph for the featureGrid block.
const featureGridLead = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [
          {
            type: 'text',
            format: 0,
            text: 'Više od dve decenije gradimo poverenje sa poljoprivrednicima — kombinujući stručno znanje, proverene proizvode i ličnu posvećenost svakom gazdinstvu.',
          },
        ],
      },
    ],
  },
}

const featureGridBlock = {
  blockType: 'featureGrid',
  blockName: null,
  eyebrow: 'Zašto Agroarm',
  heading: 'Vrednosti koje stoje iza svakog rezultata',
  lead: featureGridLead,
  columns: '4',
  cardStyle: 'soft',
  items: [
    {
      icon: 'badgeCheck',
      title: 'Stručna podrška',
      description:
        'Naš tim agronoma je uvek dostupan za konsultacije, preporuke i pomoć na terenu. Ne prodajemo samo proizvode — gradimo dugoročna partnerstva.',
    },
    {
      icon: 'shield',
      title: 'Proveren kvalitet',
      description:
        'Radimo isključivo sa registrovanim preparatima koji ispunjavaju najviše standarde kvaliteta i bezbednosti, pažljivo odabranim za naše tržište.',
    },
    {
      icon: 'handshake',
      title: 'Dugoročno partnerstvo',
      description:
        'Vaš uspeh je naš uspeh. Pratimo vas kroz celu sezonu — od planiranja i nabavke, do berbe i evaluacije rezultata.',
    },
    {
      icon: 'sprout',
      title: 'Lokalna pristupačnost',
      description:
        'Mreža saradnika i distributera širom Srbije znači da je pravi proizvod uvek na dohvat ruke, kada vam zatreba.',
    },
  ],
}

function rebuildLayout(currentLayout: any[]): any[] {
  // 0 → richTextImage (Ko smo mi)         → keep
  // 1 → content 3-col services            → remove "Semenski materijal" col, rebalance to half
  // 2 → richTextImage (Naša misija)       → keep
  // 3 → content (Zašto Agroarm? heading)  → drop
  // 4 → content (Stručna podrška half)    → drop (folded into featureGrid)
  // 5 → content (Proveren kvalitet half)  → drop (folded into featureGrid)
  // 6 → cta                               → keep
  // Insert new featureGrid between misija and cta.

  if (currentLayout.length < 7) {
    throw new Error(
      `Expected at least 7 blocks in current layout, got ${currentLayout.length}. ` +
        'Aborting to avoid clobbering an unexpected layout.',
    )
  }

  const [koSmoMi, services, misija, , , , cta] = currentLayout

  // Strip "Semenski materijal" column from the services block and rebalance.
  const filteredColumns = (services.columns ?? []).filter((col: any) => {
    const headingText = col?.richText?.root?.children?.[0]?.children?.[0]?.text ?? ''
    return !/seменск|semensk/i.test(headingText)
  })
  const rebalanced = {
    ...services,
    columns: filteredColumns.map((col: any) => ({ ...col, size: 'half' })),
  }

  return [koSmoMi, rebalanced, misija, featureGridBlock, cta]
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

  console.log('Fetching o-nama page...')
  const page = await fetchPage(token)
  console.log(`Found page id=${page.id}, current layout has ${page.layout.length} blocks`)

  const newLayout = rebuildLayout(page.layout)
  console.log(`New layout will have ${newLayout.length} blocks:`)
  newLayout.forEach((b, i) => console.log(`  ${i}. ${b.blockType}`))

  if (process.argv.includes('--dry-run')) {
    console.log('\n--dry-run: not patching.')
    return
  }

  console.log('\nPatching page...')
  await patchPage(token, page.id, newLayout)
  console.log('Done. Visit /o-nama to verify.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
