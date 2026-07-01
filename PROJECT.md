# 微信对话生成器 Vue 移植项目

> 基于原始单文件 HTML（原 JS + Vue 2 版本）用 Vue 3 + Vite 完整重写  
> 功能：在线生成逼真的微信聊天截图 / GIF / 视频

---

## 一、项目背景

原始项目为单文件 HTML，内嵌 Vue 模板 + Webpack 打包的 JS bundle（`chat.bundle.js` / `common.bundle.js`），通过 `<script>` 顺序加载。  
本项目将其迁移为标准 Vue 3 工程（Vite 脚手架），保留原有样式与交互逻辑，所有业务逻辑用 Vue 3 Composition API 重新实现。

---

## 二、项目结构

```
weichat-vue/
├── public/                          # Vite 静态资源目录（原样复制，路径不变）
│   └── static/app/
│       ├── css/                    # zui.min.css / app.css / wallet.css / jquery.range.css
│       ├── js/
│       │   ├── html2canvas.min.js  # 截图依赖
│       │   ├── gif.js              # GIF 编码
│       │   ├── gif.worker.js
│       │   ├── common.bundle.js    # 旧 bundle（参考保留）
│       │   └── chat.bundle.js      # 旧 bundle（参考保留）
│       ├── images/                 # 全部图标、演示图、头像（44 个文件）
│       ├── fonts/                  # 字体（SF Pro Text / ZenIcon）
│       └── ext/
│           └── auto-gen.js         # 旧扩展（参考保留）
│
├── src/
│   ├── composables/
│   │   └── useChat.ts              # ⭐ 核心业务逻辑（Vue 3 Composition API + TypeScript 类型安全）
│   │                               #   phone / setting / users / dialogs
│   │                               #   头像上传 / 对话 CRUD / 红包转账领取 / 截图导出
│   │
│   ├── App.vue                     # ⭐ 主模板（完整移植原 HTML）
│   │                               #   ① 外观设置面板（Tab1）
│   │                               #   ② 对话设置面板（Tab2：用户 + 对话 builder）
│   │                               #   ③ 手机预览区（顶部状态栏 + 聊天列表 + 底部导航）
│   │
│   ├── main.ts                     # 入口：createApp(App).mount('#app')
│   ├── types/
│   │   └── index.ts                # TypeScript 类型定义（Dialog / User / PhoneConfig / SettingConfig 等）
│   ├── utils/
│   │   ├── index.ts                # 工具函数（moneyFormat / getVoiceLength / readFileAsDataURL 等）
│   │   └── options.ts              # UI 下拉选项配置（时间/日期/信号等级等）
│   ├── style.css                   # 项目自定义样式（左右分栏、配置面板、用户卡片等）
│
├── index.html                      # 入口 HTML：挂载点 #app
│                                   #   <link> 引入 4 份 CSS
│                                   #   <script> 加载 html2canvas / gif.js / gif.worker.js / auto-gen.js
│
├── vite.config.ts                  # 路径别名 @/ → src/，关闭 CSS minify（兼容 zui.min.css）
├── package.json                    # 依赖：vue ^3.5.35 / html2canvas / gif.js / vite ^8.0.12
├── README.md                       # 项目简介 / 快速启动
├── bug.md                          # 已修复 Bug 记录（样式 / 功能 / 交互）
└── pnpm-lock.yaml                  # 依赖锁定（pnpm）
```

---

## 三、核心技术实现

### 3.1 响应式数据模型（useChat.ts）

| 模块 | 说明 |
|------|------|
| `phone` | 状态栏：信号格数 / 网络类型 / WiFi 信号 / 时间 / 电量 / 充电 / 听筒 |
| `setting` | 配置：聊天标题 / 消息数 / 语音模式 / 聊天背景 / 日期时间组件参数 / 对话默认值 |
| `users` | `reactive` 数组，动态管理多用户；支持头像 FileReader 上传 |
| `dialogs` | `reactive` 数组，统一数据模型，6 种对话类型 |

### 3.2 对话类型

| 类型 | 关键字段 | 说明 |
|------|----------|------|
| `text` | `content` | 文字消息，v-html 渲染，支持换行 |
| `image` | `image` | 图片消息，FileReader DataURL |
| `voice` | `time`, `isread` | 语音消息，宽度按 `time × 12px` |
| `notice` | `content`, `is_system` | 系统时间提示 |
| `redpacket` | `remark`, `is_get` | 红包（领取状态切换，同步对方记录） |
| `transfer` | `money`, `remark`, `is_get` | 转账（金额千分位格式化，同步对方记录） |

### 3.3 红包/转账领取逻辑

- **红包领取** (`redpacketGet`)：设为已领取，同时在另一方聊天记录中插入一条已领取的红包记录
- **转账领取** (`transferGet`)：设为已领取，备注改为"已被接收"，同时在另一方插入一条备注为"已收款"的转账记录

### 3.4 截图导出

```javascript
function save()
```
使用 `html2canvas` 对 `#element-to-record` 元素截图（2x 缩放），生成 PNG 并通过下载链接保存。

---

## 四、已修复 Bug 记录

详见 [bug.md](./bug.md)，包括：

### 样式修复
- ✅ 添加聊天时间输入框间距过大 → 添加 flex 布局
- ✅ 配置面板与手机预览左右布局 → flex 布局
- ✅ 用户选择徽标样式不一致 → CSS 对勾伪元素

### 功能修复
- ✅ 外观设置 Tab 无法点击 → Vue `activeTab` + `.active` 类
- ✅ 发送人固定为第一个用户 → `getSelectedUser()` 动态获取
- ✅ 无法添加时间 → `addNoticeDialog` 重构
- ✅ 红包/转账默认金额 → 默认 88
- ✅ 红包/转账领取缺少对方记录 → 同步追加对方记录
- ✅ 转账默认备注 → 默认值 "请收款"

### 额外修复
- ✅ zui.min.css `.tab-content>.tab-pane {display:none}` 与 Vue `v-show` 冲突 → 改用 `.active` 类

---

## 五、关键决策记录

| 决策 | 原因 |
|------|------|
| `public/static/app/` 路径保留原样 | CSS 内部引用 `url(./images/...)` 相对路径，直接迁移避免全量替换 |
| CSS 通过 `index.html <link>` 引入 | 防止 Vite 打包为 JS chunk，保持独立 CSS 文件 |
| 旧 bundle JS 保留在 `public/` 但未引用 | 原 Webpack 产物依赖 Vue 1/2 全局变量，与 Vue 3 不兼容，参考保留 |
| `vite.config.ts` 关闭 CSS minify | `zui.min.css` 含 lightningcss 无法解析的 hack 选择器 |
| 核心逻辑用 composable 而非 Vuex | 单组件应用，Composition API 足够，减少复杂度 |
| `bug.md` 独立记录 | 保留 Bug 修复历史，便于回归测试 |

---

## 六、快速启动

```bash
# 安装依赖
npm install

# 开发模式（热更新，默认 http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

构建输出在 `dist/`，可直接部署到任意静态文件服务器。

---

## 七、当前状态 & TODO

- [x] 项目脚手架搭建（Vue 3 + Vite 8）
- [x] 全部静态资源迁移（CSS / 图片 / 字体 / 工具库）
- [x] 100% 模板 HTML 移植（外观设置 + 对话设置 + 手机预览）
- [x] **useChat TypeScript 重构**：核心逻辑 useChat.ts，类型安全完成，工具函数消除重复
- [x] 核心业务逻辑用 Vue 3 重写（useChat.ts）
- [x] 头像上传、对话 CRUD、红包/转账领取（含对方同步）
- [x] 生成图片功能（html2canvas + 2x 缩放下载）
- [x] **GIF 录制**（gif.js 按帧捕获 + 渲染下载，100ms/帧）
- [x] **localStorage 持久化**（users + dialogs 自动保存/加载）
- [x] 项目可正常 build & 运行
- [x] 所有已知 Bug 已修复
- [x] **组件化重构**：App.vue 拆分为 ConfigPanel 和 PhonePreview
- [x] **TS 类型清理**：修复所有隐式 any 及 Ref 类型问题
- [ ] **视频录制**：引入 `MediaRecorder` 或结合现有工具实现（暂不开发）
- [ ] **预设用户库**：接入 `auto-gen.js` 中大量预设头像（暂不开发）
- [x] **对话时间戳渲染**：已实现
- [x] **生成图片直接下载**：已实现
- [x] **删除旧 bundle**：已完成
- [x] **组件拆分**：已完成
- [ ] **国际化支持**：面板文案支持中/英文切换（暂不开发）
## 八、技术栈

| 技术         | 版本       | 用途                  |
|--------------|------------|-----------------------|
| Vue          | ^3.5.35    | 前端框架              |
| Vite         | ^8.0.12    | 构建工具 / 热更新     |
| html2canvas  | ^1.4.1     | DOM → PNG 截图        |
| gif.js       | ^0.2.0     | 帧序列 → GIF 编码     |
| pnpm         | 包管理器   | 依赖管理              |

---

## 九、与原始项目的差异

| 维度 | 原始项目 | 本项目 |
|------|----------|--------|
| 框架 | Vue 2（CDN 引入） | Vue 3 Composition API |
| 构建 | Webpack | Vite |
| 模块化 | 单文件 + bundle.js | 标准 SFC + composable |
| 逻辑复用 | 闭包 bundle 黑盒 | 独立 `useChat.ts`，逻辑透明 |
| 开发体验 | 无源码，直接看打包文件 | 完整源码，热更新 |
| 状态管理 | 隐式 | 显式 reactive |
| 对话类型 | 6 种（文字/图片/语音/时间/红包/转账） | 6 种，完全相同 |
| 红包领取 | 仅当前记录 | 同步追加对方记录 ✅ |
| 转账领取 | 仅当前记录 | 同步追加对方记录 ✅ |

---

*文档生成时间：2026-06-05*