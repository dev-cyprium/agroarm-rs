import React from 'react'

import type { MapEmbedBlock as MapEmbedBlockType } from '@/payload-types'

export const MapEmbedBlock: React.FC<MapEmbedBlockType> = ({ address, height }) => {
  if (!address) return null

  const h = height || 450
  const query = encodeURIComponent(address)

  return (
    <div className="container">
      <div className="overflow-hidden rounded-lg border border-[#E6EFEA]">
        <iframe
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          width="100%"
          height={h}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa: ${address}`}
        />
      </div>
    </div>
  )
}
