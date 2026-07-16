# FileWithJob - Markdown 编辑器

一款基于 Tauri 2.0 的桌面端 Markdown 编辑器，支持实时预览、语法高亮、导出 PDF/图片等功能。

## ✨ 功能特点

### 编辑器
- 📝 CodeMirror 6 编辑器，Markdown 语法高亮
- 🔤 支持 Tab 缩进（Tab/Shift+Tab）
- 📍 当前行高亮显示
- ⌨️ 快捷键支持（Ctrl+S 保存、Ctrl+O 打开、Ctrl+N 新建）

### 预览
- 👁️ 右侧实时预览，所见即所得
- 💻 代码块语法高亮（支持 190+ 语言）
- 📋 代码块一键复制
- 🔗 预览区链接可点击跳转

### 工具栏
- 📁 文件操作：新建、打开、保存
- ✏️ Markdown 格式：加粗、斜体、删除线、标题、列表、链接、图片、代码块、引用、表格、分割线
- 📤 导出：PDF、PNG 图片
- 🎨 主题切换：亮色/暗色

### 其他
- 💾 自动保存（1 秒间隔）
- ⚠️ 未保存提醒
- 📊 状态栏：行号、列号、字数、字符数、编码格式
- 📖 启动示例文档引导
- 🔄 关闭后自动恢复内容
- 📱 响应式设计


## 📸 功能截图

> 截图待添加

| 功能 | 截图 |
|------|------|
| 编辑器界面 | ![编辑器界面](./screenshot.png) |
| 暗色主题 | ![暗色主题](./screenshot-dark.png) |
| 导出功能 | ![导出功能](./screenshot-export.png) |

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| [Tauri 2.0](https://v2.tauri.app/) | 桌面应用框架（Rust 后端） |
| [React 19](https://react.dev/) | 前端 UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Vite 7](https://vite.dev/) | 前端构建工具 |
| [Tailwind CSS v4](https://tailwindcss.com/) | 样式方案 |
| [CodeMirror 6](https://codemirror.net/) | 代码编辑器 |
| [marked](https://github.com/markedjs/marked) | 快速的 Markdown 解析器 |
| [highlight.js](https://highlightjs.org/) | 代码语法高亮库 |

## 📦 安装

### 前置要求

- [Node.js](https://nodejs.org/) (v18 或更高版本)
- [Rust](https://www.rust-lang.org/) (最新稳定版)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows)

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/damowanglx/FileWithJob.git
cd FileWithJob

# 2. 安装前端依赖
npm install

# 3. 启动开发模式
npm run tauri dev
```

> ⚠️ 首次运行 `npm run tauri dev` 会下载 Rust 依赖并编译，耗时约 5-10 分钟。后续热更新会很快。

### 构建安装包

```bash
# 构建生产版本
npm run tauri build
```

构建产物位置：

| 文件 | 路径 | 说明 |
|------|------|------|
| NSIS 安装包 | `src-tauri/target/release/bundle/nsis/` | 推荐，双击安装 |
| MSI 安装包 | `src-tauri/target/release/bundle/msi/` | 企业部署 |
| 可执行文件 | `src-tauri/target/release/filewithjob.exe` | 绿色版 |


## 🚀 开发环境搭建

详细的开发环境搭建指南请参考 [开发环境搭建文档](./docs/development.md)。

## 🎯 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + N` | 新建文件 |
| `Ctrl + O` | 打开文件 |
| `Ctrl + S` | 保存文件 |
| `Ctrl + Shift + S` | 另存为 |
| `Ctrl + Z` | 撤销 |
| `Ctrl + Shift + Z` | 重做 |
| `Ctrl + X` | 剪切 |
| `Ctrl + C` | 复制 |
| `Ctrl + V` | 粘贴 |
| `Ctrl + A` | 全选 |
| `Ctrl + F` | 查找 |
| `Ctrl + H` | 替换 |
| `Ctrl + B` | 加粗 |
| `Ctrl + I` | 斜体 |
| `Ctrl + P` | 切换预览 |
| `Ctrl + \` | 切换侧边栏 |
| `Ctrl + =` | 放大 |
| `Ctrl + -` | 缩小 |
| `Ctrl + 0` | 重置缩放 |
| `Ctrl + W` | 关闭标签页 |
| `Ctrl + T` | 新建标签页 |
| `Ctrl + Tab` | 下一个标签页 |
| `Ctrl + Shift + Tab` | 上一个标签页 |
| `Ctrl + Shift + F` | 全屏预览 |
| `Tab` | 向右缩进 |
| `Shift + Tab` | 向左缩进 |


支持亮色和暗色两种主题，点击工具栏右侧的 🌙 按钮切换。

主题设置会自动保存到本地存储，下次打开应用时自动恢复。

## 📤 导出功能

- **导出 PDF**：将预览区内容导出为 PDF 文件
- **导出图片**：将预览区内容导出为 PNG 图片

## 📁 项目结构

```
FileWithJob/
├── src/                            # 前端源码
│   ├── components/
│   │   ├── Editor/
│   │   │   └── Editor.tsx          # CodeMirror 6 编辑器
│   │   ├── Preview/
│   │   │   └── Preview.tsx         # Markdown 实时预览
│   │   ├── Toolbar/
│   │   │   └── Toolbar.tsx         # 工具栏
│   │   ├── StatusBar/
│   │   │   └── StatusBar.tsx       # 状态栏
│   │   ├── Notification/
│   │   │   └── Notification.tsx    # 通知组件
│   │   ├── Settings/
│   │   │   └── SettingsPanel.tsx   # 设置面板
│   │   └── ErrorBoundary/
│   │       └── ErrorBoundary.tsx   # 错误边界
│   ├── hooks/
│   │   ├── useTheme.ts             # 主题切换 Hook
│   │   ├── useFileOperation.ts     # 文件操作封装
│   │   ├── useKeyboardShortcuts.ts # 键盘快捷键
│   │   ├── useNotifications.ts     # 通知系统
│   │   ├── useSettings.ts          # 设置管理
│   │   ├── useDebounce.ts          # 防抖和节流
│   │   ├── useI18n.ts              # 国际化
│   │   └── usePerformanceMonitor.ts # 性能监控
│   ├── utils/
│   │   ├── markdown.ts             # Markdown 解析配置
│   │   └── export.ts               # PDF/图片导出
│   ├── App.tsx                     # 主应用组件
│   ├── main.tsx                    # 应用入口
│   └── index.css                   # 全局样式
├── src-tauri/                      # Rust 后端
│   ├── src/
│   │   ├── lib.rs                  # Tauri 命令
│   │   └── main.rs                 # Rust 入口
│   ├── Cargo.toml                  # Rust 依赖
│   ├── tauri.conf.json             # Tauri 配置
│   └── capabilities/               # 权限配置
├── package.json                    # 前端依赖
├── vite.config.ts                  # Vite 配置
├── tsconfig.json                   # TypeScript 配置
└── CLAUDE.md                       # 项目说明文档
```


## 🤝 贡献

详细的贡献指南请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)。


## 📄 许可证

MIT License

## 🙏 致谢

- [Tauri](https://tauri.app/) - 优秀的桌面应用框架
- [CodeMirror](https://codemirror.net/) - 强大的代码编辑器
- [marked](https://github.com/markedjs/marked) - 快速的 Markdown 解析器
- [highlight.js](https://highlightjs.org/) - 代码语法高亮库





