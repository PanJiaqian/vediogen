# 前端整体架构与功能说明

## 技术栈与基础设施

- 框架：Vue 3（选项式 API 为主，少量 setup 引入 store）
- 状态管理：Pinia（`src/stores/user.js` 负责登录态与用户信息）
- 路由：Vue Router 4（`src/router/index.js`）
- 构建工具：Vue CLI（`vue-cli-service`）
- 样式：全局样式位于 `src/styles/global.css`，各视图/组件多使用 `scoped` 样式

### 运行与开发

- 开发启动：`npm run serve`
- 打包构建：`npm run build`
- 代码检查：`npm run lint`

---

## 目录结构概览

- `src/main.js`：应用入口，创建 Vue 实例并挂载路由和 Pinia
- `src/App.vue`：根组件，负责整体布局（侧边栏、头部导航、路由视图）
- `src/router/index.js`：路由表与全局导航守卫
- `src/stores/user.js`：用户登录状态、Token 生命周期、自动登出逻辑
- `src/api/index.js`：与后端交互的 HTTP 与 SSE 接口封装
- `src/utils/`：
  - `homeData.js`：首页推荐用静态数据（画风、剧本与旁白示例）
  - `media.js`：媒体 URL 清洗与“是否可展示”判断
  - `performance.js`：防抖/节流、虚拟滚动与性能监控工具
  - `placeholder.js`：本地 SVG 占位图生成与项目占位配置
- `src/views/`：页面级视图组件
- `src/components/`：可复用 UI 组件与业务弹窗

---

## 路由与页面职责

### 顶层路由

定义于 `src/router/index.js`：

- `/` → `HomeView`：灵感搜索与“灵感广场”
- `/my-projects` → `MyProjectsView`：用户作品空间
- `/asset-library` → `AssetLibraryView`：公共/个人素材管理
- `/digital-human` → `DigitalHumanView`：数字人形象与作品
- `/project/:id` → `ProjectDetailView`：单个项目详情与剧本/分镜生成入口
- `/generation-steps/:id` → `GenerationStepsView`：分镜生成过程展示
- `/video-edit/:id` → `VideoEditView`：图文分镜编辑、生成视频与配音
- `/digital-video/:taskId?` → `DigitalVideo`：数字人视频编辑页
- `/inspiration/:id` → `InspirationDetailView`：灵感广场作品详情
- `/payment/success` → `PaymentSuccessView`：支付成功结果页
- `/about` → `AboutView`：关于页
- `/invited/:code`：邀请链接入口，写入邀请码并重定向到首页

### 登录拦截与邀请处理

- 在 `router.beforeEach` 中对 `MyProjects`、`AssetLibrary`、`DigitalHuman` 做登录校验：
  - 从 Pinia 的 `useUserStore` 读取 `isLoggedIn`
  - 未登录时阻止导航（返回 `next(false)`）
- 对所有以 `/invited/` 开头的路径：
  - 尝试解析邀请代码，写入 `localStorage.app:invitationCode`
  - 重定向到首页并在查询参数中附带 `invited`，用于登录弹窗中自动填充邀请码

---

## 用户状态与身份管理

### `useUserStore`（`src/stores/user.js`）

主要字段：

- `isLoggedIn`：是否登录
- `token`：后端颁发的访问令牌
- `tokenSetAt`：Token 写入时间戳（用于计算过期时间）
- `logoutTimerId`：自动登出计时器 ID
- `userInfo`：用户基础信息（包含积分余额与会员状态）

核心行为：

- `setToken(token)`：
  - 写入/清除 Token 与时间戳到 `localStorage`
  - 设置 5 天过期的自动登出计时器
- `setUser(user)`：
  - 合并新的用户信息到 `userInfo`
  - 将 `userInfo` 与 `isLoggedIn` 持久化到 `localStorage`
- `logout()`：
  - 清除登录状态、Token、本地持久化信息
  - 重置用户信息
- `scheduleAutoLogout()`：
  - 根据 `tokenSetAt` 计算剩余有效时间，在过期时触发 `logout` 并广播 `auth-401` 事件
- `loadFromStorage()`：
  - 应用启动时从 `localStorage` 恢复 Token 与用户信息
  - 判断 Token 是否已经超过 5 天，若过期则立即登出，否则恢复登录态并重新安排自动登出

### 顶部 Header 与全局事件

`src/components/Header.vue`：

- 根据 `useUserStore` 展示当前用户头像、昵称、会员状态与积分
- 展示右上角通知铃铛：通过通知 REST 接口与 WebSocket 实时更新未读角标和列表
- 提供手机号/邮箱绑定与验证码发送入口（配合 `bindPhone` / `bindEmail` 等接口）
- 通过 `window` 事件与其它模块交互：
  - `open-login-modal`：打开登录弹窗
  - `auth-401`：处理未授权（如 Token 失效）场景
  - `open-points-modal`：打开积分充值弹窗
  - `open-order-records-modal`：打开订单记录弹窗
  - `open-insufficient-points`、`open-center-prompt`：统一的中心提示框
- 负责暗黑模式切换与持久化（`localStorage.darkMode`）

---

## 接口封装与网络通信

所有接口统一定义在 `src/api/index.js`，基础配置：

- `BASE_URL`：后端服务地址
- `buildAuthHeaders(token)`：
  - 创建 `Headers` 实例
  - 若存在 Token，则附加 `Authorization` 头
- `buildSSEHeaders(token)`：
  - 在鉴权头基础上追加 `Accept: text/event-stream`，用于服务端事件流

### SSE 接口（流式返回）

主要用于长耗时生成任务，统一处理方式：

- 使用 `fetch` 发起请求并获取 `ReadableStream` 的 reader
- 通过 `TextDecoder` 持续解析二进制块，将形如 `data: {json}` 的行解析为对象
- 每解析到一条事件，调用传入的 `onEvent(obj)` 回调
- 若浏览器不支持流式读取，则回退为一次性读取文本并按换行切分事件
- 对返回 401 的接口统一派发 `auth-401` 事件

代表性方法：

- `scriptModifyStream`：流式修改剧本
- `scriptGenStream`：流式生成剧本
- `storyboardPictureGenStream`：流式生成分镜图片

### 普通 HTTP 接口

大部分接口遵循如下模式：

- 使用 `buildAuthHeaders(token)` 附加 Token
- 根据接口需要选择 `GET` 或 `POST`
- 优先返回 `res.json()`，在解析失败时回退为原始文本
- 对返回 401 的接口统一派发 `auth-401` 事件

部分关键能力：

- 素材管理：
  - `getMaterialsList`：获取素材列表
  - `uploadMaterial`：上传素材（用于“创建主体”等）
- 分镜与图片：
  - `regenerateImage`：重新生成场景或角色图片
  - `getStoryboardImagesDetail` / `getStoryboardSceneDetail`：查询分镜图片与单场景详情
- 作品状态与导出：
  - `getWorksVideoStatus` / `queryStoryboardVideoStatus`：查询作品视频/分镜生成状态
  - `exportWorksVideo` / `exportWorksVideoDownload`：导出成片视频并轮询导出状态
- 计费与积分：
  - `getBillingEstimate`：预估生成任务消耗积分
  - `getUserBasicStatus`：获取会员状态与积分余额
  - `getMembershipPackages` / `getPointsPackagesList`：拉取会员套餐与积分充值套餐列表
  - `createOrderByPackage`：按套餐 ID 创建订单，区分 `orderType`（`SUBSCRIPTION` / `RECHARGE`），底层统一走 `/api/payment/orders`
  - 订单与支付相关的其它接口在积分/会员组件中通过 `../api` 间接调用

### 通知接口与 WebSocket

- REST 接口（定义于 `src/api/index.js`）：
  - `getNotificationsList`：获取通知列表
  - `getNotificationsUnreadCount`：获取未读通知数量
  - `markNotificationRead` / `deleteNotification`：标记通知为已读或删除
- WebSocket 连接（由 `Header.vue` 管理）：
  - 优先尝试 `wss://www.xydriftcraft.com:1770/ws/notification?token=TOKEN`
  - 兼容多种写法，如 `wss://www.xydriftcraft.com:1770/ws/notification?token-TOKEN`、`wss://www.xydriftcraft.com:1770/notification/ws?token=TOKEN` 等
- 消息处理：
  - 若消息体中包含 `unreadCount` 字段，则直接更新未读角标
  - 若包含 `notification` 或 `list` 字段，则刷新通知列表
  - 若解析失败，则退回到通过 REST 接口重新拉取列表与未读数量

---

## 主要业务流程

### 1. 首页创作入口（HomeView）

文件：`src/views/HomeView.vue`

- 提供“剧本创作 / 旁白成片”两种功能标签
- 搜索框支持：
  - 主体选择（公共/个人），复用 `CreateSubjectModal` 以创建新主体
  - 画风选择（使用 `homeData.js` 中的 `ART_STYLES`）
  - 从 `SCRIPT_SUGGESTIONS` / `NARRATION_SUGGESTIONS` 生成搜索提示
- 将用户输入与选中的主体、画风组合为 Prompt，提交给后续剧本/分镜生成流程
- “灵感广场”展示用户上传作品，点击进入 `InspirationDetailView`

### 2. 剧本生成与项目详情（ProjectDetailView）

文件：`src/views/ProjectDetailView.vue`

- 通过 `getScriptDetailByVideo` 拉取指定 `videoId` 的剧本与分镜分析结果
- 使用 `scriptGenStream`、`scriptModifyStream` 等接口与“智能小梦”对话式生成/修改内容
- 将生成结果归一化到 `generated` 对象，包含：
  - 剧本摘要、画面美术方向、音乐风格、角色列表、场景列表、分镜信息等
- 查询作品创作状态（`getWorksVideoStatus`）以判断：
  - 剧本是否就绪
  - 分镜图片/视频是否已生成
- 支撑“前往分镜生成步骤页”（`GenerationStepsView`）或直接进入“视频编辑页”（`VideoEditView`）

### 3. 分镜生成步骤页（GenerationStepsView）

文件：`src/views/GenerationStepsView.vue`

- 展示一个 5 步进度条，模拟从“画面构想”到“色彩叙事”的生成过程
- 内部使用定时器平滑推进进度条，并在接近 100% 时等待任务真实完成
- 通过：
  - `getScriptDetailByVideo`：获取项目标题与创建时间
  - `storyboardPictureGenStream`：发起分镜图片生成（SSE）
- 在超时或任务完成后，自动替换历史记录并跳转至 `/video-edit/:id`

### 4. 视频编辑与导出（VideoEditView）

文件：`src/views/VideoEditView.vue`

主要能力：

- 以“场景列表 + 时间轴”的形式展示分镜与配音时间线
- 为每个场景管理：
  - 标题、画面提示词、镜头语言描述
  - 分镜图片/视频、配音文本、音色与情绪、字幕开关
- 与后端接口协作：
  - 图片再生成、分镜场景重排、视频裁剪、字幕更新
  - 触发 TTS 任务、轮询音频生成状态、上传自定义配音
  - 提交作品导出任务并轮询导出进度，最后给出下载链接
- 在积分不足或非会员操作高阶能力时，触发全局 `open-points-modal` 或会员弹窗

### 5. 数字人工作流（DigitalVideo / LipSyncView / DigitalHumanToolbar）

相关文件：

- `DigitalVideo.vue`：数字人视频编辑主界面
- `LipSyncView.vue`：对口型视图（覆盖式子页面）
- `DigitalHumanToolbar.vue`：数字人侧边工具栏

核心逻辑：

- 从会话或作品 ID 加载数字人场景及镜头数据
- 使用 TTS 或上传音频驱动数字人嘴型动画（`aliTtsSubmit` / `aliTtsQuery`）
- 支持更新客户端字幕文本（`updateDigitalHumanClientSubtitle`）
- 通过工具栏选择不同音色（集成 `ToneSelector`），调整语言、情绪与速度

---

## 资产与计费体系

### 素材库（AssetLibraryView）

文件：`src/views/AssetLibraryView.vue`

- 使用 `getMaterialsList` 拉取公共与个人素材，并映射为统一结构
- 为无实际 URL 的素材生成渐变占位图（`generateGradientPlaceholder`）
- 支持基于现有素材“创建主体”（`CreateSubjectModal`）

### 积分与会员管理

组件：

- `PointsModal.vue`：
  - 拉取积分套餐列表（`getPointsPackagesList`）
  - 创建积分充值订单（`createOrderByPackage`，类型 `RECHARGE`）
  - 通过 `PaymentModal` 完成支付
- `MembershipModal.vue`：
  - 拉取会员套餐（`getMembershipPackages`）
  - 创建订阅订单（`createOrderByPackage`，类型 `SUBSCRIPTION`）
- `PaymentModal.vue`：
  - 调用 `initiateAlipayPayment` 获取跳转表单 HTML
  - 提交表单打开支付宝收银台
  - 轮询 `getPaymentOrderStatus` 判断是否支付成功，成功后跳转 `/payment/success`
- `OrderRecordsModal.vue`：
  - 使用 `getOrdersList` 拉取最近订单列表
  - 使用 `getUserBasicStatus` 展示最新积分余额

---

## 其他关键工具

### 媒体 URL 工具（`src/utils/media.js`）

- `cleanUrl(u)`：
  - 去除首尾反引号与多余引号
  - 规整协议前缀（例如避免 `http:/`）
  - 在 HTTPS 页面中，将 `http://` 替换为 `https://`
- `isGenerateFailed(u)`：
  - 通过关键字判断生成失败（如 URL 中包含 “失败” 或 “fail”）
- `shouldRenderImage(u)`：
  - 仅当 URL 清洗后非空且不包含失败标记时返回 `true`
- `getLocalMediaUrl(videoId, url)`：
  - 对异常情况兜底调用 `cleanUrl`，为部分本地资源留出扩展点

### 占位与性能工具

- `placeholder.js`：
  - 通过内联 SVG 生成本地占位图，避免外部依赖
  - 提供项目/头像/渐变等不同占位类型
- `performance.js`：
  - 常用防抖/节流函数
  - 虚拟滚动类 `VirtualScroll`
  - 性能监控类 `PerformanceMonitor`（FCP、LCP、CLS 等）
  - 简单的内存清理工具 `MemoryUtils`

---

## 登录与会话相关 UI

### 登录弹窗（LoginModal）

文件：`src/components/LoginModal.vue`

- 支持邮箱/短信登录、注册与找回密码
- 内置图形验证码与邮箱/短信验证码逻辑（带倒计时）
- 从路由查询参数读取 `invited` 并自动填充邀请码字段
- 登录成功后调用 `useUserStore` 写入 Token 和用户信息

### 用户资料与编辑

- `UserProfileEditModal.vue`：编辑昵称与头像
- `Header.vue`：
  - 打开编辑弹窗并调用 `updateAvatarAndNickname` 更新后端
  - 同步更新 Pinia 中的 `userInfo`

---

## 如何扩展

1. 新增页面：
   - 在 `views` 目录创建 `.vue` 文件
   - 在 `router/index.js` 注册路由，并按需配置 `meta.hideSidebar`
2. 新增接口：
   - 在 `api/index.js` 中新增函数，复用 `buildAuthHeaders` 或 `buildSSEHeaders`
   - 在对应视图或组件中导入并调用，优先返回原始文本给调用方自行解析
3. 新增需要登录校验的菜单：
   - 在路由守卫中的 `protectedNames` 数组追加路由名
   - 在 `Sidebar.vue` 与 `Header.vue` 添加入口按钮
