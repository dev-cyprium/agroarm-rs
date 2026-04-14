import { parse } from 'node-html-parser'

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const CONFIG = {
  oldSiteBase: 'https://agroarm.rs',
  payloadApi: 'http://localhost:3001/api',
  email: 'stefan.kupresak@icloud.com',
  password: 'rogueftw17',
  placeholderImageId: 11,
  delayMs: 600,
  dryRun: process.argv.includes('--dry-run'),
  categories: [
    { path: '/herbicidi/', name: 'Herbicidi' },
    { path: '/fungicidi/', name: 'Fungicidi' },
    { path: '/insekticidi/', name: 'Insekticidi' },
    { path: '/akaricidi/', name: 'Akaricidi' },
    { path: '/biopesticidi/', name: 'Biopesticidi' },
    { path: '/okvasivaci/', name: 'Okvašivači' },
  ],
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ScrapedProduct {
  title: string
  shortDescription: string
  activeMaterial: string
  attributes: { label: string; value: string }[]
  contentSections: { heading: string; paragraphs: string[] }[]
  categoryIds: number[]
  sourceUrl: string
}

// ─── SERBIAN SLUGIFY ─────────────────────────────────────────────────────────

const charMap: Record<string, string> = {
  č: 'c', ć: 'c', š: 's', đ: 'd', ž: 'z',
  Č: 'c', Ć: 'c', Š: 's', Đ: 'd', Ž: 'z',
}

function serbianSlugify(value: string): string {
  return value
    .split('')
    .map((ch) => charMap[ch] || ch)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

// ─── LEXICAL JSON BUILDERS ──────────────────────────────────────────────────

function lexText(text: string, bold = false) {
  return {
    type: 'text',
    detail: 0,
    format: bold ? 1 : 0,
    mode: 'normal',
    style: '',
    text,
    version: 1,
  }
}

function lexParagraph(text: string) {
  return {
    type: 'paragraph',
    children: [lexText(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
  }
}

function lexHeading(text: string, tag: string = 'h2') {
  return {
    type: 'heading',
    tag,
    children: [lexText(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function buildLexicalContent(sections: { heading: string; paragraphs: string[] }[]) {
  const children: any[] = []

  for (const section of sections) {
    if (section.heading) {
      children.push(lexHeading(section.heading, 'h2'))
    }
    for (const para of section.paragraphs) {
      const trimmed = para.trim()
      if (trimmed) {
        children.push(lexParagraph(trimmed))
      }
    }
  }

  if (children.length === 0) return null

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'AgroarmMigrationBot/1.0',
      'Accept': 'text/html',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function authenticate(): Promise<string> {
  const res = await fetch(`${CONFIG.payloadApi}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CONFIG.email, password: CONFIG.password }),
  })
  const data = await res.json()
  if (!data.token) throw new Error('Authentication failed')
  return data.token
}

// ─── CATEGORY RESOLUTION ────────────────────────────────────────────────────

async function resolveCategories(token: string): Promise<Map<string, number>> {
  const res = await fetch(`${CONFIG.payloadApi}/categories?limit=100`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const data = await res.json()
  const map = new Map<string, number>()

  for (const doc of data.docs || []) {
    map.set(doc.title, doc.id)
  }

  // Create Biopesticidi if missing
  if (!map.has('Biopesticidi')) {
    console.log('  Creating missing category: Biopesticidi')
    if (!CONFIG.dryRun) {
      const createRes = await fetch(`${CONFIG.payloadApi}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ title: 'Biopesticidi' }),
      })
      const created = await createRes.json()
      map.set('Biopesticidi', created.doc.id)
    } else {
      map.set('Biopesticidi', 999)
    }
  }

  return map
}

// ─── CRAWL LISTING PAGES ────────────────────────────────────────────────────

// Pages that are NOT products
const SKIP_SLUGS = new Set([
  'predstavnistva', 'kontakt', 'o-nama', 'home', 'politika-privatnosti',
  'politika-kolacica', 'planovi-zastite', 'planovi_zastite_biljaka',
  'floragard', 'fertiline', 'agrobiovit', 'kwizda-agro', 'maurizio',
  'seminis', 'hibridi_paradajza', 'hibridi_paprike', 'hibridi_kupusnjaca',
  'krastavac_tikvica', 'lubenica-i-dinja', 'hibridi_spanaca', 'kukuruz-secerac',
])

// All category paths to skip as product slugs
const CATEGORY_SLUGS = new Set(
  CONFIG.categories.map((c) => c.path.replace(/\//g, '')),
)

function normalizeUrl(href: string): string | null {
  const full = href.startsWith('http') ? href : `${CONFIG.oldSiteBase}${href}`
  // Match product URLs like https://agroarm.rs/herbicidi/azin/ or without trailing slash
  const match = full.match(/agroarm\.rs\/([\w-]+)\/([\w-]+)\/?$/)
  if (!match) return null

  const [, , slug] = match
  if (CATEGORY_SLUGS.has(slug) || SKIP_SLUGS.has(slug)) return null

  // Normalize: always have trailing slash
  return full.replace(/\/?$/, '/')
}

async function crawlListingPage(
  categoryPath: string,
  categoryId: number,
  productMap: Map<string, { url: string; categoryIds: number[] }>,
): Promise<void> {
  const url = `${CONFIG.oldSiteBase}${categoryPath}`
  const html = await fetchHTML(url)
  const root = parse(html)

  // Find links in main content area only (skip nav, header, footer)
  const mainContent =
    root.querySelector('main') ||
    root.querySelector('.entry-content') ||
    root.querySelector('article') ||
    root.querySelector('#content') ||
    root.querySelector('.content-area') ||
    root

  const links = mainContent.querySelectorAll('a[href]')
  let count = 0

  for (const link of links) {
    const href = link.getAttribute('href') || ''
    const normalized = normalizeUrl(href)
    if (!normalized) continue

    const existing = productMap.get(normalized)
    if (existing) {
      if (!existing.categoryIds.includes(categoryId)) {
        existing.categoryIds.push(categoryId)
      }
    } else {
      productMap.set(normalized, { url: normalized, categoryIds: [categoryId] })
      count++
    }
  }

  console.log(`  ${categoryPath}: found ${count} new products`)
}

// ─── SCRAPE PRODUCT PAGE ────────────────────────────────────────────────────

// Known labels to extract as attributes
const ATTRIBUTE_LABELS = [
  'Formulacija',
  'Količina primene',
  'Utrošak vode',
  'Karenca',
  'Pakovanje',
  'MRL',
  'HRAC',
  'FRAC',
  'IRAC',
  'Grupa',
  'Spektar delovanja',
]

function extractProductData(html: string, url: string, categoryIds: number[]): ScrapedProduct {
  const root = parse(html)

  // ── Title ──
  // Try multiple strategies
  let title = ''

  // Strategy 1: <title> tag (most reliable — always present)
  const titleTag = root.querySelector('title')
  if (titleTag) {
    // Format is usually "Product Name | Category | Agroarm" or "Product Name - Agroarm"
    const titleText = titleTag.textContent.trim()
    title = titleText.split(/[|–—-]/)[0].trim()
  }

  // Strategy 2: h1 (override if found and shorter/cleaner)
  const h1 = root.querySelector('h1')
  if (h1) {
    const h1Text = h1.textContent.trim()
    if (h1Text && h1Text.length < 100) {
      title = h1Text
    }
  }

  // Strategy 3: extract from URL as last resort
  if (!title) {
    const slugFromUrl = url.match(/\/([\w-]+)\/?$/)?.[1]
    if (slugFromUrl) {
      title = slugFromUrl.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }
  }

  // ── Find the main content area ──
  // The old site uses WordPress — content is typically in .entry-content or article
  const contentArea =
    root.querySelector('.entry-content') ||
    root.querySelector('article') ||
    root.querySelector('.product-content') ||
    root.querySelector('.content') ||
    root.querySelector('main') ||
    root

  // ── Extract all text blocks with their structure ──
  let activeMaterial = ''
  let shortDescription = ''
  const attributes: { label: string; value: string }[] = []
  const contentSections: { heading: string; paragraphs: string[] }[] = []
  let currentSection: { heading: string; paragraphs: string[] } = { heading: '', paragraphs: [] }

  const elements = contentArea.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, table, tr')

  for (const el of elements) {
    const tag = el.tagName?.toLowerCase()
    const text = el.textContent.trim()
    if (!text) continue

    // Check for headings — start new content section
    if (tag && /^h[1-6]$/.test(tag) && el !== h1) {
      if (currentSection.heading || currentSection.paragraphs.length > 0) {
        contentSections.push({ ...currentSection })
      }
      currentSection = { heading: text, paragraphs: [] }
      continue
    }

    // Check for strong/bold labels inside paragraphs
    const strongEl = el.querySelector('strong, b')
    if (strongEl && tag === 'p') {
      const labelText = strongEl.textContent.trim().replace(/:$/, '')
      const fullText = text

      // Extract value (everything after the label)
      let value = fullText.replace(strongEl.textContent.trim(), '').replace(/^[:\s]+/, '').trim()

      // Check if it's "Aktivna materija"
      if (labelText.toLowerCase().includes('aktivna materija')) {
        activeMaterial = value || fullText.replace(/aktivna materija:?\s*/i, '').trim()
        // Cap length — sometimes description leaks in
        if (activeMaterial.length > 100) {
          // Try to cut at first sentence end or period
          const cutoff = activeMaterial.search(/[.;]/)
          if (cutoff > 10 && cutoff < 100) activeMaterial = activeMaterial.substring(0, cutoff)
          else activeMaterial = activeMaterial.substring(0, 100).replace(/\s+\S*$/, '')
        }
        continue
      }

      // Check if it matches known attribute labels
      const isAttribute = ATTRIBUTE_LABELS.some(
        (l) => labelText.toLowerCase().includes(l.toLowerCase()),
      )
      if (isAttribute && value) {
        attributes.push({ label: labelText, value })
        continue
      }
    }

    // Regular paragraph content
    if (tag === 'p' || tag === 'li') {
      if (!shortDescription && tag === 'p' && text.length > 20) {
        shortDescription = text.length > 200 ? text.substring(0, 200) + '...' : text
      }
      currentSection.paragraphs.push(text)
    }
  }

  // Push last section
  if (currentSection.heading || currentSection.paragraphs.length > 0) {
    contentSections.push(currentSection)
  }

  // If no active material found from labels, try to extract from the first few paragraphs
  if (!activeMaterial) {
    for (const section of contentSections) {
      for (const p of section.paragraphs) {
        const match = p.match(/aktivna\s+materija[:\s]*(.+)/i)
        if (match) {
          activeMaterial = match[1].trim()
          break
        }
      }
      if (activeMaterial) break
    }
  }

  return {
    title,
    shortDescription,
    activeMaterial,
    attributes,
    contentSections,
    categoryIds,
    sourceUrl: url,
  }
}

// ─── CHECK EXISTING PRODUCTS ────────────────────────────────────────────────

async function getExistingSlugs(token: string): Promise<Set<string>> {
  const slugs = new Set<string>()
  let page = 1
  let hasMore = true

  while (hasMore) {
    const res = await fetch(
      `${CONFIG.payloadApi}/products?limit=100&page=${page}&select[slug]=true`,
      { headers: { Authorization: `JWT ${token}` } },
    )
    const data = await res.json()
    for (const doc of data.docs || []) {
      slugs.add(doc.slug)
    }
    hasMore = data.hasNextPage
    page++
  }

  return slugs
}

// ─── CREATE PRODUCT ─────────────────────────────────────────────────────────

async function createProduct(product: ScrapedProduct, token: string): Promise<boolean> {
  const content = buildLexicalContent(product.contentSections)

  const payload: Record<string, any> = {
    title: product.title,
    image: CONFIG.placeholderImageId,
    shortDescription: product.shortDescription || undefined,
    activeMaterial: product.activeMaterial || undefined,
    attributes: product.attributes.length > 0 ? product.attributes : undefined,
    content: content || undefined,
    categories: product.categoryIds,
    _status: 'published',
  }

  const res = await fetch(`${CONFIG.payloadApi}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`  ✗ FAIL "${product.title}" — ${res.status}: ${err.substring(0, 200)}`)
    return false
  }

  return true
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('  AgroArm Product Migration')
  console.log(CONFIG.dryRun ? '  MODE: DRY RUN' : '  MODE: LIVE')
  console.log('═══════════════════════════════════════════\n')

  // 1. Authenticate
  console.log('[1/5] Authenticating...')
  const token = await authenticate()
  console.log('  Authenticated ✓\n')

  // 2. Resolve categories
  console.log('[2/5] Resolving categories...')
  const categoryMap = await resolveCategories(token)
  for (const [name, id] of categoryMap) {
    console.log(`  ${name}: ${id}`)
  }
  console.log()

  // 3. Crawl listing pages
  console.log('[3/5] Crawling category pages...')
  const productMap = new Map<string, { url: string; categoryIds: number[] }>()

  for (const cat of CONFIG.categories) {
    const catId = categoryMap.get(cat.name)
    if (!catId) {
      console.warn(`  WARN: Category "${cat.name}" not found, skipping`)
      continue
    }
    try {
      await crawlListingPage(cat.path, catId, productMap)
    } catch (err) {
      console.error(`  ERROR crawling ${cat.path}:`, (err as Error).message)
    }
    await delay(CONFIG.delayMs)
  }
  console.log(`  Total unique products: ${productMap.size}\n`)

  // 4. Get existing products to skip duplicates
  console.log('[4/5] Checking existing products...')
  const existingSlugs = await getExistingSlugs(token)
  console.log(`  Found ${existingSlugs.size} existing products\n`)

  // 5. Scrape and create
  console.log('[5/5] Scraping and creating products...')
  let created = 0
  let skipped = 0
  let failed = 0

  const entries = Array.from(productMap.entries())
  for (let i = 0; i < entries.length; i++) {
    const [url, meta] = entries[i]
    const progress = `[${i + 1}/${entries.length}]`

    try {
      const html = await fetchHTML(url)
      const product = extractProductData(html, url, meta.categoryIds)

      if (!product.title) {
        console.warn(`  ${progress} SKIP (no title): ${url}`)
        failed++
        continue
      }

      const slug = serbianSlugify(product.title)
      if (existingSlugs.has(slug)) {
        console.log(`  ${progress} SKIP "${product.title}" (exists)`)
        skipped++
        continue
      }

      if (CONFIG.dryRun) {
        console.log(
          `  ${progress} DRY: "${product.title}" | AM: ${product.activeMaterial || '—'} | Attrs: ${product.attributes.length} | Cats: [${product.categoryIds}]`,
        )
        created++
      } else {
        const ok = await createProduct(product, token)
        if (ok) {
          console.log(`  ${progress} ✓ "${product.title}"`)
          created++
          existingSlugs.add(slug)
        } else {
          failed++
        }
      }
    } catch (err) {
      console.error(`  ${progress} ERROR ${url}: ${(err as Error).message}`)
      failed++
    }

    await delay(CONFIG.delayMs)
  }

  console.log('\n═══════════════════════════════════════════')
  console.log(`  Done! Created: ${created} | Skipped: ${skipped} | Failed: ${failed}`)
  console.log('═══════════════════════════════════════════')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
