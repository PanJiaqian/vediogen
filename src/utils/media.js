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

/**
 * 将 OSS 音频地址转换为后端可播放代理地址，规避直连 OSS 时的播放头兼容问题。
 *
 * @param {string} url 原始媒体地址
 * @returns {string} 可直接交给浏览器音频播放器的地址
 *
 * @example
 * getPlayableAudioUrl('https://example.com/tts/demo.mp3')
 */
export function getPlayableAudioUrl(url) {
  const u = cleanUrl(url)
  if (!u) return ''
  const lower = u.toLowerCase()
  const isAudio = /\.(mp3|wav|m4a|aac|ogg|oga|flac)(\?|#|$)/i.test(lower) || /^data:audio\//i.test(lower)
  if (!isAudio) return u
  if (/\/uploadfile\//i.test(u)) return u
  try {
    const parsed = new URL(u)
    const objectKey = parsed.pathname.replace(/^\/+/, '')
    if (!objectKey) return u
    return `http://182.92.68.240:1790/uploadfile/${objectKey}`
  } catch (e) {
    return u
  }
}

/**
 * 兼容本地媒体地址适配，当前保留既有接口形态。
 *
 * @param {string|number} videoId 视频标识
 * @param {string} url 原始媒体地址
 * @returns {Promise<string>} 处理后的可访问地址
 *
 * @example
 * await getLocalMediaUrl('123', 'https://example.com/a.mp3')
 */
export async function getLocalMediaUrl(videoId, url) {
  try {
    const u = cleanUrl(url)
    void videoId
    return getPlayableAudioUrl(u)
  } catch (e) {
    return getPlayableAudioUrl(url)
  }
}
