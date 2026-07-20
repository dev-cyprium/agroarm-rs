'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

const TYPE_LABELS: Record<string, string> = {
  herbicid: 'Korov',
  fungicid: 'Bolest',
  insekticid: 'Štetočina',
  akaricid: 'Grinje',
  biostimulator: 'Biostimulator',
  ostalo: 'Tretman',
}

// First line of a (possibly multi-line) textarea value, truncated for the row header.
function firstLine(value: unknown, max = 60): string {
  if (typeof value !== 'string' || !value.trim()) return ''
  const line = value.split('\n').find((l) => l.trim()) ?? ''
  return line.length > max ? `${line.slice(0, max)}…` : line
}

export const StageRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ stage?: string }>()
  const num = rowNumber !== undefined ? rowNumber + 1 : ''
  const text = firstLine(data?.stage)
  return <div>{text ? `Faza ${num}: ${text}` : `Faza ${num}`}</div>
}

export const TargetRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ target?: string; targetType?: string }>()
  const num = rowNumber !== undefined ? rowNumber + 1 : ''
  const type = data?.targetType ? TYPE_LABELS[data.targetType] : undefined
  const text = firstLine(data?.target)
  const parts = [type, text].filter(Boolean).join(' — ')
  return <div>{parts ? `Meta ${num}: ${parts}` : `Meta ${num}`}</div>
}
