import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

import { RedirectImporterClient } from './Client'

/**
 * Custom admin view at /admin/redirect-importer. Renders inside the normal
 * admin shell (nav + header) via DefaultTemplate, then hosts the client-side
 * crawl/review/commit UI.
 */
const RedirectImporterView: React.FC<AdminViewServerProps> = ({
  initPageResult,
  params,
  searchParams,
}) => {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      req={initPageResult.req}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <RedirectImporterClient />
      </Gutter>
    </DefaultTemplate>
  )
}

export default RedirectImporterView
