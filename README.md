# 在线微信对话生成器

> 基于 Vue 3 + Vite 构建，在线生成逼真的微信聊天截图 / GIF

## 在线体验

[点击体验](https://lovexu.fun/) | 开源项目

## 功能

- 🖼️ 生成微信对话截图（PNG）
- 🎞️ 支持 GIF 录制导出（gif.js 按帧捕获，100ms/帧）
- 👤 多用户管理，自定义头像与昵称
- 💬 支持文字、图片、语音、红包、转账等多类型对话
- 😀️ 内置 emoji 表情选择器 + 自定义表情包支持
- 📥 批量导入（emoji 占位符 `[表情:N]` 解析）
- 🎨 自定义状态栏（信号、电量、时间）、聊天背景
- 📱 逼真的 iOS 风格手机界面预览
- ⏱️ 自定义聊天时间戳
- 💾 localStorage 自动保存（用户 + 对话记录持久化）

## 技术栈

| 技术              | 版本       | 用途                  |
|-------------------|------------|-----------------------|
| Vue               | ^3.5.35    | 前端框架              |
| Vite              | ^8.0.12    | 构建工具              |
| TypeScript        | ^6.0.3     | 类型安全              |
| html2canvas       | ^1.4.1     | DOM → PNG 截图       |
| gif.js            | ^0.2.0     | 帧序列 → GIF 编码     |
| Vitest            | ^4.1.8     | 单元测试              |

## 快速启动

```bash
# 克隆仓库
git clone <repo-url>
cd weichat-vue

# 安装依赖
pnpm install

# 开发模式（热更新）
pnpm run dev

# 生产构建
pnpm run build

# 预览构建结果
pnpm run preview

# 运行测试
pnpm run test
```

构建输出在 `dist/`，可直接部署到任意静态文件服务器。

## 项目结构

```
weichat-vue/
├── public/                      # 静态资源（原样复制，路径不变）
│   └── static/app/
│       ├── css/                 # zui.min.css / app.css / wallet.css
│       ├── js/                  # html2canvas / gif.js / gif.worker.js
│       ├── images/              # 图标、演示图、头像
│       ├── fonts/               # SF Pro Text / ZenIcon 字体
│       └── emojis/              # 自定义表情包（自动加载）
├── src/
│   ├── assets/                  # 入口样式
│   ├── components/
│   │   ├── ConfigPanel.vue      # 配置面板（外观 + 对话设置）
│   │   └── PhonePreview.vue     # 手机模拟器预览
│   ├── composables/
│   │   └── useChat.ts           # 核心业务逻辑
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   ├── utils/
│   │   ├── index.ts            # 工具函数
│   │   └── options.ts           # UI 下拉选项配置
│   ├── App.vue                  # 主组件
│   ├── main.ts                  # 应用入口
│   └── style.css                # 项目自定义样式
├── index.html                   # 入口 HTML
├── vite.config.ts               # Vite 构建配置
├── package.json
└── pnpm-lock.yaml
```

## 详细文档

查看 [PROJECT.md](./PROJECT.md) 获取完整的迁移记录、开发决策和待办事项。