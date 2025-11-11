const BASE_URL = 'http://106.12.116.141:1770'

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

export async function scriptGen({ stageDirections, materialId = '', category = '0', token }) {
  const url = `${BASE_URL}/api/agent/Script_gen?stageDirections=${encodeURIComponent(stageDirections)}&materialId=${encodeURIComponent(materialId)}&category=${encodeURIComponent(category)}`
  const requestOptions = {
    method: 'POST',
    headers: buildSSEHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
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
  return res.text()
}

// 获取创意作品列表
export async function getCreativeWorkList(token) {
  const url = `${BASE_URL}/creativeWork/getcreativeWorkList`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
  return res.text()
}

// 获取创意作品详情
export async function getCreativeWorkById({ id, token }) {
  const url = `${BASE_URL}/creativeWork/getcreativeWorkById?creativeWorkId=${encodeURIComponent(id)}`
  const requestOptions = {
    method: 'GET',
    headers: buildAuthHeaders(token),
    redirect: 'follow'
  }
  const res = await fetch(url, requestOptions)
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

export default {
  scriptGen,
  getMaterialsList,
  uploadMaterial,
  getCreativeWorkList,
  getCreativeWorkById,
  emailLogin,
  emailRegister,
  sendCheckCodeByEmail
}