import { FlaskConical, Layers, Target, type LucideIcon } from 'lucide-react'

export type ProductDescriptorType = 'activeMaterial' | 'productType' | 'productPurpose'

type Descriptor = { label: string; Icon: LucideIcon }

const DESCRIPTORS: Record<ProductDescriptorType, Descriptor> = {
  activeMaterial: { label: 'Aktivna materija', Icon: FlaskConical },
  productType: { label: 'Tip proizvoda', Icon: Layers },
  productPurpose: { label: 'Namena proizvoda', Icon: Target },
}

/**
 * Resolve the label + icon for a product's descriptor field. Falls back to
 * "Aktivna materija" so products created before `descriptorType` existed keep
 * their original presentation.
 */
export function getProductDescriptor(type?: string | null): Descriptor {
  return DESCRIPTORS[(type as ProductDescriptorType) ?? 'activeMaterial'] ?? DESCRIPTORS.activeMaterial
}
