<template>
  <div class="canvas-edit-overlay">
    <div class="canvas-edit-container">
      <!-- 主编辑区域 -->
      <div class="canvas-main">
        <!-- 中央画布区域 -->
        <div class="canvas-workspace">
          <!-- 工具栏 -->
          <div class="canvas-toolbar-overlay">
            <div class="toolbar-left">
              <button class="canvas-btn close-btn" @click="closeCanvas">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
            <div class="toolbar-center">
              <div class="tool-group">
                <button class="canvas-btn tool-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3h18v18H3z" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  消除笔
                </button>
                <button class="canvas-btn tool-btn active">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  局部重绘
                </button>
                <button class="canvas-btn tool-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  元素添加
                </button>
                <button class="canvas-btn tool-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3v18h18" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 12l3-3 4 4 5-5" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  剪裁
                </button>
              </div>
            </div>
            <div class="toolbar-right">
              <div class="control-group">
                <!-- 放大缩小按钮 -->
                <button class="canvas-btn control-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="canvas-btn control-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2"/>
                    <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <!-- 适应屏幕按钮 -->
                <button class="canvas-btn control-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  适应屏幕
                </button>
                <!-- 撤销重做按钮 -->
                <button class="canvas-btn control-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7v6h6" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  撤销
                </button>
                <button class="canvas-btn control-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 7v6h-6" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  重做
                </button>
              </div>
            </div>
          </div>

          <div class="canvas-area">
            <img src="/logo.png" alt="编辑图片" class="canvas-image" />
            <!-- 这里可以添加编辑工具的覆盖层 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CanvasEditView',
  methods: {
    closeCanvas() {
      // 触发父组件的关闭事件
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/* 画布编辑模式样式 */
.canvas-edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 3000;
  display: flex;
  flex-direction: column;
}

.canvas-edit-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.canvas-toolbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-center {
  display: flex;
  justify-content: center;
  flex: 1;
}

.tool-group {
  display: flex;
  gap: 2px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.control-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.control-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  font-size: 14px;
  min-width: auto;
}

.control-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.canvas-btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.canvas-btn:hover {
  background: #e5e7eb;
}

.canvas-btn.active {
  background: white;
  color: #3b82f6;
  border-color: #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.apply-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.shortcut {
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.canvas-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  overflow-y: auto;
}

.tool-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tool-item {
  padding: 16px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tool-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.tool-item span {
  font-size: 12px;
  color: #6b7280;
}

.canvas-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  padding: 20px;
  position: relative;
}

.canvas-toolbar-overlay {
  height: 60px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.canvas-area {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.canvas-properties {
  width: 250px;
  background: white;
  border-left: 1px solid #e5e7eb;
  padding: 20px;
  overflow-y: auto;
}

.property-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.property-item {
  margin-bottom: 16px;
}

.property-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.property-slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.size-inputs span {
  color: #6b7280;
  font-weight: 500;
}
</style>