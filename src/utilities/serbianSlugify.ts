const charMap: Record<string, string> = {
  č: 'c', ć: 'c', š: 's', đ: 'd', ž: 'z',
  Č: 'c', Ć: 'c', Š: 's', Đ: 'd', Ž: 'z',
}

export const serbianSlugify = ({ valueToSlugify }: { valueToSlugify?: string }) => {
  if (typeof valueToSlugify !== 'string') return undefined

  return valueToSlugify
    .split('')
    .map((ch) => charMap[ch] || ch)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}
