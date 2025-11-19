export function cleanUrl(u) {
  const str = (u || '').toString()
  return str.replace(/`/g, '').trim()
}

export function isGenerateFailed(u) {
  const s = (u || '').toString().trim()
  if (!s) return false
  return /失败|fail|error/i.test(s)
}

export function shouldRenderImage(u) {
  const url = cleanUrl(u)
  return !!url && !isGenerateFailed(url)
}