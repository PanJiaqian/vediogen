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

export async function getDigitalHumanWorksByConversation({ conversationId, token }) {
  const url = `${BASE_URL}/detail/digitalhuman/works/byConversation?conversationId=${encodeURIComponent(conversationId)}`
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

export async function getDigitalHumanWorkSingle({ conversationId, workId, token }) {
  const url = `${BASE_URL}/detail/digitalhuman/work/single?conversationId=${encodeURIComponent(conversationId)}&workid=${encodeURIComponent(workId)}`
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

// 修改视频标题（POST）
export async function updateVideoTitle({ videoId, newTitle, token }) {
  const myHeaders = buildAuthHeaders(token)
  const formdata = new FormData()
  formdata.append("videoId", videoId)
  formdata.append("newtitle", newTitle)

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  }

  const res = await fetch(`${BASE_URL}/detail/works/video/updateTitle`, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  return res.text()
}

// 分镜配音上传（POST）
export async function uploadStoryboardVoiceoverAudio({ videoId, shotId, audioUrl, token }) {
  const myHeaders = buildAuthHeaders(token)
  const formdata = new FormData()
  formdata.append('videoId', String(videoId))
  formdata.append('shotId', String(shotId))
  formdata.append('audioUrl', String(audioUrl))

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  }

  const res = await fetch(`${BASE_URL}/detail/storyboard/voiceover/uploadaudio`, requestOptions)
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

export async function exportWorksVideo({ videoId, token }) {
  const url = `${BASE_URL}/detail/works/video/export?videoId=${encodeURIComponent(videoId)}`
  const requestOptions = {
    method: 'POST',
    headers: buildAuthHeaders(token),
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

// POST 创建订单-会员订阅
export async function createSubscriptionOrder({ token, amount, membershipLevel }) {
  const myHeaders = buildAuthHeaders(token)
  const formdata = new FormData()
  formdata.append("orderType", "SUBSCRIPTION")
  formdata.append("amount", amount)
  formdata.append("membershipLevel", membershipLevel)

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  }

  const res = await fetch(`${BASE_URL}/api/payment/orders`, requestOptions)
  return res.json()
}

// POST 创建订单-积分充值
export async function createRechargeOrder({ token, amount, rechargePoints }) {
  const myHeaders = buildAuthHeaders(token)
  const formdata = new FormData()
  formdata.append("orderType", "RECHARGE")
  formdata.append("amount", amount)
  formdata.append("rechargePoints", rechargePoints)

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  }

  const res = await fetch(`${BASE_URL}/api/payment/orders`, requestOptions)
  return res.json()
}

// GET 发起支付-订阅订单(ALIPAY)
export async function initiateAlipayPayment({ token, orderNo }) {
  const myHeaders = buildAuthHeaders(token)
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }

  const res = await fetch(`${BASE_URL}/api/payment/pay?orderNo=${orderNo}&channel=ALIPAY`, requestOptions)
  return res.json()
}

// GET 查询订单支付状态
export async function getPaymentOrderStatus({ token, orderNo }) {
  const myHeaders = buildAuthHeaders(token)
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }
  const res = await fetch(`${BASE_URL}/api/payment/orders/status?orderNo=${encodeURIComponent(orderNo)}`, requestOptions)
  try {
    return await res.json()
  } catch (e) {
    return await res.text()
  }
}

// POST 支付宝回调-失败用例(验签不通过)
export async function alipayNotifyFailure({ app_id, orderNo_sub }) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("notify_time", "2025-12-16 12:00:00");
  urlencoded.append("notify_type", "trade_status_sync");
  urlencoded.append("notify_id", "fake-notify-id-001");
  urlencoded.append("app_id", app_id);
  urlencoded.append("charset", "UTF-8");
  urlencoded.append("version", "1.0");
  urlencoded.append("sign_type", "RSA2");
  urlencoded.append("sign", "invalid-sign");
  urlencoded.append("out_trade_no", orderNo_sub);
  urlencoded.append("subject", "会员订阅");
  urlencoded.append("trade_no", "2025121600000000");
  urlencoded.append("trade_status", "TRADE_SUCCESS");
  urlencoded.append("buyer_id", "2088102122524333");
  urlencoded.append("seller_id", "2088102122524334");
  urlencoded.append("total_amount", "9.90");
  urlencoded.append("receipt_amount", "9.90");
  urlencoded.append("gmt_create", "2025-12-16 11:59:00");
  urlencoded.append("gmt_payment", "2025-12-16 12:00:00");

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };

  const res = await fetch(`${BASE_URL}/api/payment/alipay/notify`, requestOptions)
  return res.text()
}

// POST 支付宝回调-成功用例(需真实签名)
export async function alipayNotifySuccess({ app_id, sign, orderNo_sub, trade_no }) {
   const myHeaders = new Headers();
   myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

   const urlencoded = new URLSearchParams();
   urlencoded.append("notify_time", "2025-12-16 12:00:00");
   urlencoded.append("notify_type", "trade_status_sync");
   urlencoded.append("notify_id", "valid-notify-id-001");
   urlencoded.append("app_id", app_id);
   urlencoded.append("charset", "UTF-8");
   urlencoded.append("version", "1.0");
   urlencoded.append("sign_type", "RSA2");
   urlencoded.append("sign", sign);
   urlencoded.append("out_trade_no", orderNo_sub);
   urlencoded.append("subject", "会员订阅");
   urlencoded.append("trade_no", trade_no);
   urlencoded.append("trade_status", "TRADE_SUCCESS");
   urlencoded.append("buyer_id", "2088102122524333");
   urlencoded.append("seller_id", "2088102122524334");
   urlencoded.append("total_amount", "9.90");
   urlencoded.append("receipt_amount", "9.90");
   urlencoded.append("gmt_create", "2025-12-16 11:59:00");
   urlencoded.append("gmt_payment", "2025-12-16 12:00:00");

   const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };
  
  const res = await fetch(`${BASE_URL}/api/payment/alipay/notify`, requestOptions)
  return res.text()
}

export async function exportWorksVideoDownload({ videoId, token }) {
  const url = `${BASE_URL}/detail/works/video/export/download?videoId=${encodeURIComponent(videoId)}`
  const headers = buildAuthHeaders(token)
  headers.append('Accept', 'video/mp4')
  const requestOptions = {
    method: 'GET',
    headers,
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
  }
  const blob = await res.blob()
  return { blob, headers: res.headers }
}

export async function getBillingEstimate({ videoId, genType, modelName, token }) {
  const url = `${BASE_URL}/api/billing/estimate?videoId=${encodeURIComponent(videoId)}&genType=${encodeURIComponent(genType)}&modelName=${encodeURIComponent(modelName)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
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

export async function aliTtsSubmit({ text, languageType, voice, token }) {
  const url = `${BASE_URL}/api/ali-tts/submit?text=${encodeURIComponent(text)}&languageType=${encodeURIComponent(languageType)}&voice=${encodeURIComponent(voice)}`
  const requestOptions = {
    method: 'POST',
    headers: buildAuthHeaders(token),
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

export async function updateSceneStream({ videoId, shotId, prompt, type, modelname, token, onEvent, signal }) {
  const url = `${BASE_URL}/api/update-scene`
  const headers = buildSSEHeaders(token)
  const formdata = new FormData()
  if (videoId !== undefined && videoId !== null) formdata.append('videoId', String(videoId).trim())
  if (shotId !== undefined && shotId !== null) formdata.append('shotId', String(shotId).trim())
  if (prompt !== undefined && prompt !== null) formdata.append('prompt', String(prompt).trim())
  if (type !== undefined && type !== null) formdata.append('type', String(type).trim())
  if (modelname !== undefined && modelname !== null) formdata.append('modelname', String(modelname).trim())
  const requestOptions = { method: 'POST', headers, body: formdata, redirect: 'follow', signal }
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
          } catch (err) { /* no-op */ }
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
        } catch (err) { /* no-op */ }
      }
    }
  }
  const m = buffer.match(/data:(.*)/s)
  if (m && m[1]) {
    try {
      const obj = JSON.parse(m[1].trim())
      if (typeof onEvent === 'function') onEvent(obj)
    } catch (err) { /* no-op */ }
  }
}

export async function getTonesList({ modelName, token }) {
  const url = `${BASE_URL}/detail/voice/getTonesList?modelName=${encodeURIComponent(modelName)}`
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

export async function aliTtsQuery({ taskId, token }) {
  const url = `${BASE_URL}/api/ali-tts/query?taskId=${encodeURIComponent(taskId)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
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

export async function objectDetectionSeedream({ imageFile, token }) {
  const url = `${BASE_URL}/api/video/seedream/object_detection`
  const headers = buildAuthHeaders(token)
  const formdata = new FormData()
  formdata.append('image', imageFile)
  const requestOptions = {
    method: 'POST',
    headers,
    body: formdata,
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  try {
    return await res.json()
  } catch (e) {
    try { return JSON.parse(await res.text()) } catch { return null }
  }
}

export async function getUserBasicStatus(token) {
  const url = `${BASE_URL}/user/getUserBasicStatus`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
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

export async function updateAvatarAndNickname({ token, imageFile, nickname }) {
  const url = `${BASE_URL}/user/updateAvatarAndNickname`
  const headers = buildAuthHeaders(token)
  const formdata = new FormData()
  if (imageFile) formdata.append('imageFile', imageFile)
  if (nickname) formdata.append('nickname', nickname)
  
  const requestOptions = {
    method: 'POST',
    headers,
    body: formdata,
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

export async function digitalhumanGen({ imageFile, imageUrl, audio, audioUrl, maskUrls, token }) {
  const url = `${BASE_URL}/api/video/digitalhumanGen`
  const headers = buildAuthHeaders(token)
  const formdata = new FormData()
  if (imageFile) formdata.append('imageFile', imageFile)
  else if (imageUrl) formdata.append('imageUrl', String(imageUrl).trim())
  if (audio) formdata.append('audio', audio)
  else if (audioUrl) formdata.append('audioUrl', String(audioUrl).trim())
  if (maskUrls) formdata.append('maskUrls', String(maskUrls).trim())
  const requestOptions = { method: 'POST', headers, body: formdata, redirect: 'follow' }
  const res = await fetch(url, requestOptions)
  try {
    return await res.json()
  } catch (e) {
    try { return JSON.parse(await res.text()) } catch { return null }
  }
}

export async function digitalhumanQuery({ taskId, token }) {
  const url = `${BASE_URL}/api/video/digitalhumanQuery?taskId=${encodeURIComponent(taskId)}`
  const requestOptions = { method: 'GET', headers: buildAuthHeaders(token), redirect: 'follow' }
  const res = await fetch(url, requestOptions)
  try {
    return await res.json()
  } catch (e) {
    return await res.text()
  }
}

// 数字人作品：上传图片（POST）
export async function uploadDigitalHumanWorkImage({ conversationId, imageFile, token }) {
  const url = `${BASE_URL}/detail/digitalhuman/work/uploadImage`
  const headers = buildAuthHeaders(token)
  const formData = new FormData()
  formData.append('conversationId', String(conversationId).trim())
  formData.append('imageFile', imageFile)
  const requestOptions = { method: 'POST', headers, body: formData, redirect: 'follow' }
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

// 数字人作品：主体检测（POST）
export async function objectDetectionByWork({ conversationId, workId, token }) {
  const url = `${BASE_URL}/api/digitalhuman/object_detection_by_work`
  const headers = buildAuthHeaders(token)
  const formData = new FormData()
  formData.append('conversationId', String(conversationId).trim())
  formData.append('workId', String(workId).trim())
  const requestOptions = { method: 'POST', headers, body: formData, redirect: 'follow' }
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

// 数字人作品：对口型生成视频（POST）
export async function digitalhumanGenByWork({ conversationId, workId, audio, audioUrl, maskUrls, maskUrlsAlt = 'source', token }) {
  const url = `${BASE_URL}/api/video/digitalhumanGenByWork`
  const headers = buildAuthHeaders(token)
  const formData = new FormData()
  formData.append('conversationId', String(conversationId).trim())
  formData.append('workId', String(workId).trim())
  if (audio) {
    formData.append('audio', audio)
  } else if (audioUrl) {
    formData.append('audioUrl', String(audioUrl || '').trim())
  }
  if (maskUrls) {
    formData.append('maskUrls', String(maskUrls).trim())
  } else if (maskUrlsAlt) {
    formData.append('maskUrlsAlt', String(maskUrlsAlt).trim())
  }
  const requestOptions = { method: 'POST', headers, body: formData, redirect: 'follow' }
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

export async function objectDetectionByScene({ videoId, shotId, token }) {
  const url = `${BASE_URL}/api/digitalhuman/object_detection_by_scene`
  const headers = buildAuthHeaders(token)
  const formdata = new FormData()
  if (videoId !== undefined && videoId !== null) formdata.append('videoId', String(videoId).trim())
  if (shotId !== undefined && shotId !== null) formdata.append('shotId', String(shotId).trim())
  const requestOptions = { method: 'POST', headers, body: formdata, redirect: 'follow' }
  const res = await fetch(url, requestOptions)
  try {
    return await res.json()
  } catch (e) {
    try { return JSON.parse(await res.text()) } catch { return null }
  }
}

export async function digitalhumanGenByScene({ videoId, shotId, audio, audioUrl, maskUrls, token }) {
  const url = `${BASE_URL}/api/video/digitalhumanGenByScene`
  const headers = buildAuthHeaders(token)
  const formdata = new FormData()
  if (videoId !== undefined && videoId !== null) formdata.append('videoId', String(videoId).trim())
  if (shotId !== undefined && shotId !== null) formdata.append('shotId', String(shotId).trim())
  if (audio) {
    formdata.append('audio', audio)
  } else if (audioUrl) {
    formdata.append('audioUrl', String(audioUrl).trim())
  }
  if (maskUrls) formdata.append('maskUrls', String(maskUrls).trim())
  const requestOptions = { method: 'POST', headers, body: formdata, redirect: 'follow' }
  const res = await fetch(url, requestOptions)
  try {
    return await res.json()
  } catch (e) {
    try { return JSON.parse(await res.text()) } catch { return null }
  }
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

// 邮箱重置密码（忘记密码）
export async function emailResetPassword({ email, password, checkCode }) {
  const url = `${BASE_URL}/user/emailResetPassword`
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

export async function replaceStoryboardImage({ videoId, sceneNumber, file, token }) {
  const url = `${BASE_URL}/detail/storyboard/image/replace`
  const headers = buildAuthHeaders(token)
  const formdata = new FormData()
  formdata.append('videoId', String(videoId))
  formdata.append('sceneNumber', String(sceneNumber))
  formdata.append('file', file)
  const requestOptions = {
    method: 'POST',
    headers,
    body: formdata,
    redirect: 'follow'
  }
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
  , emailResetPassword
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
  , replaceStoryboardImage
  , deleteConversation
  , exportWorksVideo
  , exportWorksVideoDownload
  , aliTtsSubmit
  , aliTtsQuery
  , objectDetectionSeedream
  , digitalhumanGen
  , digitalhumanQuery
  , uploadDigitalHumanWorkImage
  , objectDetectionByWork
  , digitalhumanGenByWork
  , uploadStoryboardVoiceoverAudio
  , getBillingEstimate
  , updateSceneStream
}
