// 媒体工具：清洗媒体 URL 并判断是否可展示
export function cleanUrl(u) {
  let str = (u || '').toString().trim()
  str = str
    .replace(/^`+|`+$/g, '')
    .replace(/\\`/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim()
  str = str.replace(/^(https?|wss?|ws|ftp):\/(?!\/)/i, m => `${m.slice(0, -1)  }//`)
  str = str.replace(/^(https?|wss?|ws|ftp):\/\/+/i, (_, p1) => `${p1}://`)
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' && /^http:\/\//i.test(str)) {
    str = str.replace(/^http:\/\//i, 'https://')
  }
  return str
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
export async function getLocalMediaUrl(videoId, url) { try { const u = cleanUrl(url); return u } catch (e) { return cleanUrl(url) } }
