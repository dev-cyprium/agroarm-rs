'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()
  const rowNum = data.rowNumber !== undefined ? data.rowNumber + 1 : ''

  let label = 'Row'
  if (data?.data?.type === 'category') {
    const catLabel = data?.data?.categoryLabel || 'Category'
    label = `Nav item ${rowNum}: ${catLabel} (dropdown)`
  } else if (data?.data?.link?.label) {
    label = `Nav item ${rowNum}: ${data.data.link.label}`
  }

  return <div>{label}</div>
}
