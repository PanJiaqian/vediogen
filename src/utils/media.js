export function cleanUrl(u) {
  const str = (u || '').toString()
  return str.replace(/`/g, '').trim()
}

// 接口生成失败检测：包含“失败/fail/error”则视为失败
export function isGenerateFailed(u) {
  const s = (u || '').toString().trim()
  if (!s) return false // 空不视为失败，仅当接口明确返回失败信息时显示占位
  return /失败|fail|error/i.test(s)
}

// 是否应该渲染图片：URL存在且不包含失败标记
export function shouldRenderImage(u) {
  const url = cleanUrl(u)
  return !!url && !isGenerateFailed(url)
}