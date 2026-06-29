# 在线微信对话生成器

> 基于 Vue 3 + Vite 构建，在线生成逼真的微信聊天截图 / GIF / 视频

## 在线体验

[点击体验](https://lovexu.fun/) | 开源项目

## 功能

- 🖼️ 生成微信对话截图（PNG）
- 👤 多用户管理，自定义头像与昵称
- 💬 支持文字、图片、语音、红包、转账等多类型对话
- 🎨 自定义状态栏（信号、电量、时间）、聊天背景
- 📱 逼真的 iOS 风格手机界面预览
- ⏱️ 自定义聊天时间戳
- 🎥 支持 GIF 录制 / 视频录制（开发中）

## 技术栈

| 技术        | 版本    | 用途              |
| ----------- | ------- | ----------------- |
| Vue         | ^3.5.35 | 前端框架          |
| Vite        | ^8.0.12 | 构建工具          |
| html2canvas | ^1.4.1  | DOM → PNG 截图    |
| gif.js      | ^0.2.0  | 帧序列 → GIF 编码 |

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
```

构建输出在 `dist/`，可直接部署到任意静态文件服务器。

## 项目结构

```
weichat-vue/
├── public/                      # 静态资源（CSS / 图片 / 字体 / 工具库）
│   └── static/app/
│       ├── css/                 # zui.min.css / app.css / wallet.css / jquery.range.css
│       ├── js/                  # html2canvas / gif.js / gif.worker.js
│       ├── images/              # 图标、演示图、头像
│       └── ext/
│           └── auto-gen.js      # 预设扩展（已保留）
├── src/
│   ├── composables/
│   │   └── useChat.js           # 核心业务逻辑（Vue 3 Composition API）
│   ├── App.vue                  # 主组件：配置面板 + 手机预览
│   ├── main.js                  # 应用入口
│   └── style.css                # 项目自定义样式
├── index.html                   # 入口 HTML
├── vite.config.js               # Vite 构建配置
└── package.json
```

## 详细文档

查看 [PROJECT.md](./PROJECT.md) 获取完整的迁移记录、开发决策和待办事项。
