const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

const CHILD_SITEMAPS = [
  '/pages-sitemap.xml',
  '/posts-sitemap.xml',
  '/products-sitemap.xml',
  '/plans-sitemap.xml',
]

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [...CHILD_SITEMAPS, '/*', '/posts/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: CHILD_SITEMAPS.map((p) => `${SITE_URL}${p}`),
  },
}
