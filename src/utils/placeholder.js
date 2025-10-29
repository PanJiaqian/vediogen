/**
 * 本地占位图片生成工具
 * 用于替代外部placeholder服务，避免网络错误
 */

/**
 * 生成SVG占位图片
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {string} bgColor - 背景颜色 (hex格式，不含#)
 * @param {string} textColor - 文字颜色 (hex格式，不含#)
 * @param {string} text - 显示文字
 * @returns {string} SVG数据URL
 */
export function generatePlaceholder(width = 300, height = 200, bgColor = '4A90E2', textColor = 'ffffff', text = '') {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
            fill="#${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

/**
 * 生成用户头像占位图
 * @param {number} size - 头像大小
 * @param {string} text - 显示文字（通常是用户名首字母）
 * @param {string} bgColor - 背景颜色
 * @returns {string} SVG数据URL
 */
export function generateAvatarPlaceholder(size = 40, text = 'U', bgColor = '1890ff') {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50%" cy="50%" r="50%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size / 2}" 
            fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${text}</text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

/**
 * 预定义的项目占位图片
 */
export const projectPlaceholders = {
  space: generatePlaceholder(300, 200, '4A90E2', 'ffffff', '探索宇宙'),
  city: generatePlaceholder(300, 200, '7ED321', 'ffffff', '城市风光'),
  food: generatePlaceholder(300, 200, 'F5A623', 'ffffff', '美食制作'),
  sports: generatePlaceholder(300, 200, 'D0021B', 'ffffff', '运动健身'),
  art: generatePlaceholder(300, 200, '9013FE', 'ffffff', '艺术创作'),
  tech: generatePlaceholder(300, 200, '50E3C2', 'ffffff', '科技前沿')
}

/**
 * 预定义的用户头像
 */
export const userAvatars = {
  default: generateAvatarPlaceholder(40, 'U', '1890ff'),
  small: generateAvatarPlaceholder(32, 'U', '1890ff')
}

/**
 * 资产库占位图片
 */
export const assetPlaceholders = {
  video: generatePlaceholder(200, 150, '6C5CE7', 'ffffff', '视频'),
  audio: generatePlaceholder(200, 150, 'A55EEA', 'ffffff', '音频'),
  image: generatePlaceholder(200, 150, '26DE81', 'ffffff', '图片'),
  model: generatePlaceholder(200, 150, 'FD79A8', 'ffffff', '模型'),
  effect: generatePlaceholder(200, 150, 'FDCB6E', 'ffffff', '特效'),
  template: generatePlaceholder(200, 150, '74B9FF', 'ffffff', '模板')
}

/**
 * 数字人占位图片
 */
export const digitalHumanPlaceholders = {
  male: generatePlaceholder(200, 250, '3742FA', 'ffffff', '男性'),
  female: generatePlaceholder(200, 250, 'F8B500', 'ffffff', '女性'),
  cartoon: generatePlaceholder(200, 250, 'FF6B6B', 'ffffff', '卡通'),
  business: generatePlaceholder(200, 250, '4ECDC4', 'ffffff', '商务'),
  casual: generatePlaceholder(200, 250, 'A8E6CF', 'ffffff', '休闲'),
  formal: generatePlaceholder(200, 250, '88D8C0', 'ffffff', '正式')
}

/**
 * 根据类型获取占位图片
 * @param {string} type - 图片类型
 * @param {string} category - 分类
 * @returns {string} 占位图片URL
 */
export function getPlaceholderByType(type, category = 'default') {
  switch (type) {
    case 'project':
      return projectPlaceholders[category] || projectPlaceholders.space
    case 'user':
      return userAvatars[category] || userAvatars.default
    case 'asset':
      return assetPlaceholders[category] || assetPlaceholders.video
    case 'digital-human':
      return digitalHumanPlaceholders[category] || digitalHumanPlaceholders.male
    default:
      return generatePlaceholder(300, 200, '95A5A6', 'ffffff', '占位图')
  }
}

/**
 * 创建渐变背景占位图
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {string} color1 - 起始颜色
 * @param {string} color2 - 结束颜色
 * @param {string} text - 文字
 * @returns {string} SVG数据URL
 */
export function generateGradientPlaceholder(width = 300, height = 200, color1 = '667eea', color2 = '764ba2', text = '') {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
            fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="500">${text}</text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

// 导出默认配置
export default {
  generatePlaceholder,
  generateAvatarPlaceholder,
  generateGradientPlaceholder,
  getPlaceholderByType,
  projectPlaceholders,
  userAvatars,
  assetPlaceholders,
  digitalHumanPlaceholders
}