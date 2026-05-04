import { Converter } from '@odict/opencc-js/cn2t'

const DISPLAY_ATTRS = ['placeholder', 'title', 'alt', 'aria-label']
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'KBD', 'SAMP'])
const VISIBLE_INPUT_TYPES = new Set(['button', 'submit', 'reset'])
const CHINESE_PATTERN = /[\u3400-\u9fff]/

/**
 * 创建简体转繁体的文本转换器。
 * 仅使用字形转换，避免把技术术语强制替换成地区化表达。
 * @returns {(text: string) => string}
 */
function createConverter() {
  const converter = new Converter({ from: 'cn', to: 'tw' })
  return (text) => {
    if (typeof text !== 'string' || !text || !CHINESE_PATTERN.test(text)) {
      return text
    }
    return converter.convert(text)
  }
}

/**
 * 判断元素是否应跳过转换。
 * @param {Element | null} element
 * @returns {boolean}
 */
function shouldSkipElement(element) {
  if (!element) {
    return false
  }

  if (SKIP_TAGS.has(element.tagName)) {
    return true
  }

  if (element instanceof HTMLElement) {
    if (element.isContentEditable) {
      return true
    }
    return Boolean(element.closest('.ignore-opencc, [data-opencc-ignore="true"]'))
  }

  return false
}

/**
 * 转换文本节点，避免影响可编辑控件内容。
 * @param {Text} node
 * @param {(text: string) => string} convertText
 */
function convertTextNode(node, convertText) {
  const parent = node.parentElement
  if (!parent || shouldSkipElement(parent)) {
    return
  }

  const nextText = convertText(node.textContent || '')
  if (nextText && nextText !== node.textContent) {
    node.textContent = nextText
  }
}

/**
 * 转换元素上的可见属性文本。
 * @param {Element} element
 * @param {(text: string) => string} convertText
 */
function convertElementAttributes(element, convertText) {
  if (shouldSkipElement(element)) {
    return
  }

  DISPLAY_ATTRS.forEach((attrName) => {
    const attrValue = element.getAttribute(attrName)
    if (!attrValue) {
      return
    }

    const nextValue = convertText(attrValue)
    if (nextValue && nextValue !== attrValue) {
      element.setAttribute(attrName, nextValue)
    }
  })

  if (element instanceof HTMLInputElement && VISIBLE_INPUT_TYPES.has((element.type || '').toLowerCase())) {
    const nextValue = convertText(element.value || '')
    if (nextValue && nextValue !== element.value) {
      element.value = nextValue
      element.setAttribute('value', nextValue)
    }
  }
}

/**
 * 深度转换节点及其子节点的显示文本。
 * @param {Node | null} node
 * @param {(text: string) => string} convertText
 */
function convertNode(node, convertText) {
  if (!node) {
    return
  }

  if (node.nodeType === Node.TEXT_NODE) {
    convertTextNode(/** @type {Text} */ (node), convertText)
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return
  }

  const element = /** @type {Element} */ (node)
  if (shouldSkipElement(element)) {
    return
  }

  convertElementAttributes(element, convertText)
  Array.from(element.childNodes).forEach((child) => {
    convertNode(child, convertText)
  })
}

/**
 * 启动全局繁体显示转换。
 * 只处理页面展示层，不改动业务状态和值。
 * @returns {() => void}
 */
export function enableTraditionalChineseDisplay() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  const convertText = createConverter()
  const root = document.documentElement
  const pendingNodes = new Set()
  let scheduled = false

  /**
   * 批量刷新待处理节点，减少频繁重排。
   */
  function flushPendingNodes() {
    scheduled = false
    const nodes = Array.from(pendingNodes)
    pendingNodes.clear()

    nodes.forEach((node) => {
      convertNode(node, convertText)
    })

    const nextTitle = convertText(document.title || '')
    if (nextTitle && nextTitle !== document.title) {
      document.title = nextTitle
    }
  }

  /**
   * 把节点加入转换队列，合并同一事件循环内的重复处理。
   * @param {Node | null} node
   */
  function enqueueNode(node) {
    if (!node) {
      return
    }

    pendingNodes.add(node)
    if (!scheduled) {
      scheduled = true
      queueMicrotask(flushPendingNodes)
    }
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') {
        enqueueNode(mutation.target)
        return
      }

      if (mutation.type === 'attributes') {
        enqueueNode(mutation.target)
        return
      }

      mutation.addedNodes.forEach((addedNode) => {
        enqueueNode(addedNode)
      })
    })
  })

  root.lang = 'zh-Hant'
  convertNode(root, convertText)

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...DISPLAY_ATTRS, 'value']
  })

  return () => observer.disconnect()
}
