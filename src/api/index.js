const BASE_URL = 'https://www.xydriftcraft.com:1770'

function buildAuthHeaders(token) {
  const headers = new Headers()
  if (token) headers.append('Authorization', token)
  return headers
}

function buildSSEHeaders(token) {
  const headers = buildAuthHeaders(token)
  headers.append('Accept', 'text/event-stream')
  return headers
}



// 流式读取剧本修改 SSE，逐步返回事件
export async function scriptModifyStream({ modificationSuggestions, videoId, token, onEvent, signal }) {
  const url = `${BASE_URL}/api/agent/Script_modify?modificationSuggestions=${encodeURIComponent(modificationSuggestions)}&videoId=${encodeURIComponent(videoId)}`
  const requestOptions = {
    method: 'POST',
    headers: buildSSEHeaders(token),
    redirect: 'follow',
    signal
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  const reader = res.body && res.body.getReader ? res.body.getReader() : null
  if (!reader) {
    // 回退为非流式
    if (signal && signal.aborted) return
    const text = await res.text()
    if (typeof onEvent === 'function') {
      const chunks = text.split(/\n\n+/)
      for (const chunk of chunks) {
        const m = chunk.match(/data:(.*)/s)
        if (m && m[1]) {
          try {
            const obj = JSON.parse(m[1].trim())
            onEvent(obj)
          } catch (err) {
            console.warn('SSE fallback JSON 解析失败:', err)
          }
        }
      }
    }
    return
  }
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  for (; ;) {
    if (signal && signal.aborted) break
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split(/\n\n+/)
    buffer = parts.pop() || ''
    for (const part of parts) {
      const m = part.match(/data:(.*)/s)
      if (m && m[1]) {
        try {
          const obj = JSON.parse(m[1].trim())
          if (typeof onEvent === 'function') onEvent(obj)
        } catch (err) {
          console.warn('SSE 流式 JSON 解析失败:', err)
        }
      }
    }
  }
  // flush the rest
  const m = buffer.match(/data:(.*)/s)
  if (m && m[1]) {
    try {
      const obj = JSON.parse(m[1].trim())
      if (typeof onEvent === 'function') onEvent(obj)
    } catch (err) {
      console.warn('SSE 最后块 JSON 解析失败:', err)
    }
  }
}

export async function scriptGenStream({ stageDirections, materialId = '', category = '0', token, onEvent, signal }) {
  const url = `${BASE_URL}/api/agent/Script_gen?stageDirections=${encodeURIComponent(stageDirections)}&materialId=${encodeURIComponent(materialId)}&category=${encodeURIComponent(category)}`
  const requestOptions = {
    method: 'POST',
    headers: buildSSEHeaders(token),
    redirect: 'follow',
    signal
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  const reader = res.body && res.body.getReader ? res.body.getReader() : null
  if (!reader) {
    if (signal && signal.aborted) return
    const text = await res.text()
    if (typeof onEvent === 'function') {
      const chunks = text.split(/\n\n+/)
      for (const chunk of chunks) {
        const m = chunk.match(/data:(.*)/s)
        if (m && m[1]) {
          try {
            const obj = JSON.parse(m[1].trim())
            onEvent(obj)
          } catch (err) {
            console.warn('SSE fallback JSON 解析失败:', err)
          }
        }
      }
    }
    return
  }
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  for (; ;) {
    if (signal && signal.aborted) break
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split(/\n\n+/)
    buffer = parts.pop() || ''
    for (const part of parts) {
      const m = part.match(/data:(.*)/s)
      if (m && m[1]) {
        try {
          const obj = JSON.parse(m[1].trim())
          if (typeof onEvent === 'function') onEvent(obj)
        } catch (err) {
          console.warn('SSE 流式 JSON 解析失败:', err)
        }
      }
    }
  }
  const m = buffer.match(/data:(.*)/s)
  if (m && m[1]) {
    try {
      const obj = JSON.parse(m[1].trim())
      if (typeof onEvent === 'function') onEvent(obj)
    } catch (err) {
      console.warn('SSE 最后块 JSON 解析失败:', err)
    }
  }
}

// 分镜图片生成
export async function storyboardPictureGenStream({ videoId, aspectRatio, token, onEvent, signal }) {
  const url = `${BASE_URL}/api/agent/Storyboard_image_gen?videoId=${encodeURIComponent(videoId)}${aspectRatio ? `&aspectRatio=${encodeURIComponent(aspectRatio)}` : ''}`
  const requestOptions = {
    method: 'POST',
    headers: buildSSEHeaders(token),
    redirect: 'follow',
    signal
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const reader = res.body && res.body.getReader ? res.body.getReader() : null
  if (!reader) {
    if (signal && signal.aborted) return
    const text = await res.text()
    if (typeof onEvent === 'function') {
      const chunks = text.split(/\n\n+/)
      for (const chunk of chunks) {
        const m = chunk.match(/data:(.*)/s)
        if (m && m[1]) {
          try {
            const obj = JSON.parse(m[1].trim())
            onEvent(obj)
          } catch (err) {
            console.warn('分镜生成 SSE fallback 解析失败:', err)
          }
        }
      }
    }
    return
  }
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  for (; ;) {
    if (signal && signal.aborted) break
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split(/\n\n+/)
    buffer = parts.pop() || ''
    for (const part of parts) {
      const m = part.match(/data:(.*)/s)
      if (m && m[1]) {
        try {
          const obj = JSON.parse(m[1].trim())
          if (typeof onEvent === 'function') onEvent(obj)
        } catch (err) {
          console.warn('分镜生成 SSE 流式解析失败:', err)
        }
      }
    }
  }
  const m = buffer.match(/data:(.*)/s)
  if (m && m[1]) {
    try {
      const obj = JSON.parse(m[1].trim())
      if (typeof onEvent === 'function') onEvent(obj)
    } catch (err) {
      console.warn('分镜生成 SSE 最后块解析失败:', err)
    }
  }
}

// 获取素材列表
export async function getMaterialsList(token) {
  const url = `${BASE_URL}/material/getMaterialsList`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

// 上传素材
export async function uploadMaterial({ token, formData }) {
  const url = `${BASE_URL}/material/uploadMaterial`
  const requestOptions = {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: formData,
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

// 图片重新生成（POST）
export async function regenerateImage({ videoId, type, name, token }) {
  const url = `${BASE_URL}/api/image/regenerate?videoId=${encodeURIComponent(videoId)}&type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`
  const requestOptions = {
    method: 'POST',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  // 接口返回 JSON
  try {
    return await res.json()
  } catch (e) {
    console.warn('regenerateImage: 返回解析失败，回退为文本', e)
    return res.text()
  }
}

// 查询-图片重新生成（GET）
export async function queryRegenerateImage({ videoId, type, name, generateUuid, token }) {
  const url = `${BASE_URL}/api/image/regenerate/query?videoId=${encodeURIComponent(videoId)}&type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}&generateUuid=${encodeURIComponent(generateUuid)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const requestOnce = async () => {
    const res = await fetch(url, requestOptions)
    if (res.status === 401) {
      try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
    }
    try {
      return await res.json()
    } catch (e) {
      try { return JSON.parse(await res.text()) } catch { return null }
    }
  }
  for (; ;) {
    let data = null
    try { data = await requestOnce() } catch (e) { data = null }
    const urlA = data && data.urls && data.urls[0] && data.urls[0].imageUrl
    const urlB = data && data.raw && data.raw.data && data.raw.data.images && data.raw.data.images[0] && data.raw.data.images[0].imageUrl
    const msgText = String((data && (data.message || data.msg || data.meg)) || '').trim()
    const hasErrorMsg = !!msgText && /失败|异常|error|敏感/i.test(msgText)
    if (data && (urlA || urlB || hasErrorMsg)) {
      return data
    }
    await new Promise(r => setTimeout(r, 5000))
  }
}

// 获取创意作品列表
export async function getCreativeWorkList() {
  const url = `${BASE_URL}/creativeWork/getcreativeWorkList`
  const requestOptions = {
    method: 'GET',
    // 此接口无需鉴权
    headers: new Headers(),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
}

// 获取创意作品详情
export async function getCreativeWorkById({ id }) {
  const url = `${BASE_URL}/creativeWork/getcreativeWorkById?creativeWorkId=${encodeURIComponent(id)}`
  const requestOptions = {
    method: 'GET',
    // 此接口无需鉴权
    headers: new Headers(),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
}

export async function getVideoVersionsByConversation({ conversationId, token }) {
  const url = `${BASE_URL}/detail/works/video/versions/byConversation?conversationId=${encodeURIComponent(conversationId)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

export async function getConversationMessages({ conversationId, token }) {
  const url = `${BASE_URL}/detail/conversation/messages?conversationId=${encodeURIComponent(conversationId)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}
// 获取“我的空间”作品列表
export async function getMyWorksList(token) {
  const url = `${BASE_URL}/myWorks/getMyWorksList`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

// 查询-分镜图片详情列表（GET）
export async function getStoryboardImagesDetail({ videoId, token }) {
  const url = `${BASE_URL}/detail/storyboard/images?videoId=${encodeURIComponent(videoId)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

// 查询-剧本内容详情-byVideo（GET）
export async function getScriptDetailByVideo({ videoId, token }) {
  const url = `${BASE_URL}/detail/script/detail/byVideo?videoId=${encodeURIComponent(videoId)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

export async function generateStoryboardVideo({ videoId, modelName, token }) {
  const url = `${BASE_URL}/api/video/storyboard/generate?videoId=${encodeURIComponent(videoId)}&modelName=${encodeURIComponent(modelName)}`
  const requestOptions = {
    method: 'POST',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

export async function queryStoryboardVideoStatus({ videoId, token }) {
  const url = `${BASE_URL}/api/video/storyboard/query?videoid=${encodeURIComponent(videoId)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

export async function getStoryboardSceneDetail({ videoId, sceneNumber, token }) {
  const url = `${BASE_URL}/detail/storyboard/scene?videoId=${encodeURIComponent(videoId)}&sceneNumber=${encodeURIComponent(sceneNumber)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

export async function getWorksVideoStatus({ videoId, token }) {
  const url = `${BASE_URL}/detail/works/video/status?videoId=${encodeURIComponent(videoId)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

// 邮箱登录
export async function emailLogin({ email, password }) {
  const url = `${BASE_URL}/user/emailLogin`
  const body = JSON.stringify({ email, password })
  const requestOptions = {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
}

// 邮箱注册
export async function emailRegister({ email, password, checkCode }) {
  const url = `${BASE_URL}/user/emailregister`
  const body = JSON.stringify({ email, password, checkCode })
  const requestOptions = {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
}

// 发送邮箱验证码
export async function sendCheckCodeByEmail({ email }) {
  const url = `${BASE_URL}/user/sendCheckCodeByEmail?email=${encodeURIComponent(email)}`
  const requestOptions = {
    method: 'POST',
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
}

export async function copyStoryboardVideo({ videoId, order_index, token }) {
  const url = `${BASE_URL}/detail/storyboard/copy`
  const headers = buildAuthHeaders(token)
  headers.append('Content-Type', 'application/json')
  const body = JSON.stringify({ videoId, order_index })
  const requestOptions = {
    method: 'POST',
    headers,
    body,
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

export async function reorderStoryboardScenes({ videoId, orders, token }) {
  const url = `${BASE_URL}/detail/storyboard/reorder`
  const headers = buildAuthHeaders(token)
  headers.append('Content-Type', 'application/json')
  const body = JSON.stringify({ videoId, orders })
  const requestOptions = {
    method: 'POST',
    headers,
    body,
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  try {
    return await res.json()
  } catch (e) {
    return res.text()
  }
}

export async function clipStoryboardVideo({ videoId, sceneNumber, start_frame, end_frame, token }) {
  const url = `${BASE_URL}/detail/storyboard/clip`
  const headers = buildAuthHeaders(token)
  headers.append('Content-Type', 'application/json')
  const body = JSON.stringify({ videoId, sceneNumber, start_frame, end_frame })
  const requestOptions = {
    method: 'POST',
    headers,
    body,
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  try {
    return await res.json()
  } catch (e) {
    return await res.text()
  }
}

export async function deleteConversation({ conversationId, token }) {
  const url = `${BASE_URL}/detail/conversation/delete?conversationId=${encodeURIComponent(conversationId)}`
  const requestOptions = {
    method: 'POST',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
}

export default {
  scriptModifyStream,
  storyboardPictureGenStream,
  getMaterialsList,
  uploadMaterial,
  getCreativeWorkList,
  getCreativeWorkById,
  getMyWorksList,
  emailLogin,
  emailRegister,
  sendCheckCodeByEmail
  , regenerateImage
  , queryRegenerateImage
  , getStoryboardImagesDetail
  , getScriptDetailByVideo
  , generateStoryboardVideo
  , queryStoryboardVideoStatus
  , getStoryboardSceneDetail
  , getVideoVersionsByConversation
  , getConversationMessages
  , copyStoryboardVideo
  , reorderStoryboardScenes
  , clipStoryboardVideo
  , deleteConversation
}
