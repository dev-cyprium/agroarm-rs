import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { RebuildButton } from './RebuildButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Dobrodošli u AGROARM administraciju</h4>
      </Banner>
      <p>
        Izmene proizvoda, kategorija i kultura se automatski objavljuju na sajtu u roku od
        nekoliko sekundi. Ako se neka izmena ipak ne vidi na sajtu, pokrenite kompletno ponovno
        objavljivanje:
      </p>
      <RebuildButton />
    </div>
  )
}

export default BeforeDashboard
