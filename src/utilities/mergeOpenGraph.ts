import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'sr_RS',
  description: 'AGROARM — zaštita i ishrana bilja.',
  images: [
    {
      url: `${getServerSideURL()}/agroarm-og.png`,
      width: 1200,
      height: 630,
    },
  ],
  siteName: 'AGROARM',
  title: 'AGROARM',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
