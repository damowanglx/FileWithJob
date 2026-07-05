# FileWithJob - Markdown 编辑器

一款基于 Tauri 2.0 的桌面端 Markdown 编辑器，支持实时预览、语法高亮、导出 PDF/图片等功能。

## ✨ 功能特点

### 编辑器
- 📝 CodeMirror 6 编辑器，Markdown 语法高亮
- 🔤 支持 Tab 缩进（Tab/Shift+Tab）
- 🎨 当前行高亮显示
- ⌨️ 快捷键支持（Ctrl+S 保存、Ctrl+O 打开、Ctrl+N 新建）

### 预览
- 👁️ 右侧实时预览，所见即所得
- 🖥️ 代码块语法高亮（支持 190+ 语言）
- 📋 代码块一键复制
- 🔗 预览区链接可点击跳转
- 🏷️ 代码块显示语言标签
- 📌 标题锚点链接

### 工具栏
- 📁 文件操作：新建、打开、保存
- ✏️ Markdown 格式：加粗、斜体、删除线、标题、列表、链接、图片、代码块、引用、表格、分割线
- 📤 导出：PDF、PNG 图片
- 🌓 主题切换：亮色/暗色

### 其他
- 💾 自动保存（30 秒间隔）
- ⚠️ 未保存提醒
- 📊 状态栏：行号、列号、字数、字符数、编码格式
- 🚀 启动示例文档引导

## 📸 界面预览

```
┌──────────────────────────────────────────────────────────────┐
│  📁 新建 │ 📂 打开 │ 💾 保存 │ B I S │ H1 H2 H3 │ 🔗 🖼️ │ {} > │ 📤 │ 🌓  │
├─────────────┬────────────────────────────────────────────────┤
│  📝 编辑器   │  👁️ 预览                                        │
│             │                                                │
│  # 标题     │  ━━━━━━━━━━━━━━━━━━━                            │
│  正文内容... │  标题                                            │
│             │  正文内容...                                     │
│  **加粗**   │  加粗                                            │
│             │                                                │
│  ```js      │  ┌─────────────────────┐                        │
│  console.log│  │ console.log("hello")│                        │
│  ```        │  └─────────────────────┘                        │
├─────────────┴────────────────────────────────────────────────┤
│  未命名 · 已修改 │ 行 5, 列 12 │ 10 行 │ 256 字符 │ UTF-8 │ MD │
└──────────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| [Tauri 2.0](https://v2.tauri.app/) | 桌面应用框架（Rust 后端） |
| [React 19](https://react.dev/) | 前端 UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Vite 7](https://vite.dev/) | 前端构建工具 |
| [Tailwind CSS v4](https://tailwindcss.com/) | 样式方案 |
| [CodeMirror 6](https://codemirror.net/) | 代码编辑器 |
| [marked](https://github.com/markedjs/marked) | Markdown 解析 |
| [highlight.js](https://highlightjs.org/) | 代码语法高亮 |
| [html2canvas](https://html2canvas.hertzen.com/) | 页面截图 |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF 生成 |

## 📦 安装使用

### 方式一：下载安装包（推荐）

1. 前往 [Releases](https://github.com/damowanglx/FileWithJob/releases) 页面
2. 下载 `FileWithJob_0.1.0_x64-setup.exe`
3. 双击安装即可

> 💡 Windows 10/11 已内置 WebView2 运行时，无需额外安装依赖。

### 方式二：绿色版（免安装）

1. 下载 `filewithjob.exe`
2. 直接双击运行（仅限 Windows 10/11）

## 🔧 开发环境搭建

### 环境要求

| 工具 | 最低版本 | 安装命令 |
|------|---------|---------|
| Node.js | v18.0+ | `winget install OpenJS.NodeJS.LTS` |
| Rust | 最新稳定版 | `winget install Rustlang.Rustup` |
| VS Build Tools | 2022 | `winget install Microsoft.VisualStudio.2022.BuildTools` |
| Git | 2.x+ | `winget install Git.Git` |

### 详细安装步骤

#### 1. 安装 Node.js

```bash
# Windows (winget)
winget install OpenJS.NodeJS.LTS

# 或者前往官网下载: https://nodejs.org/
```

#### 2. 安装 Rust

```bash
# Windows (winget)
winget install Rustlang.Rustup

# 安装后设置默认工具链
rustup default stable

# 验证安装
rustc --version
cargo --version
```

#### 3. 安装 Visual Studio Build Tools

```bash
# Windows (winget)
winget install Microsoft.VisualStudio.2022.BuildTools
```

安装时选择 **"使用 C++ 的桌面开发"** 工作负载。

#### 4. 安装 Git

```bash
# Windows (winget)
winget install Git.Git

# 或者前往官网下载: https://git-scm.com/
```

### 项目安装

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
│   │   └── StatusBar/
│   │       └── StatusBar.tsx       # 状态栏
│   ├── hooks/
│   │   ├── useTheme.ts             # 主题切换 Hook
│   │   └── useFileOperation.ts     # 文件操作封装
│   ├── utils/
│   │   ├── markdown.ts             # Markdown 解析配置
│   │   └── export.ts               # PDF/图片导出
│   ├── styles/
│   │   └── preview.css             # 预览区样式
│   ├── App.tsx                     # 主应用组件
│   ├── main.tsx                    # 应用入口
│   └── index.css                   # 全局样式
├── src-tauri/                      # Rust 后端
│   ├── src/
│   │   ├── lib.rs                  # Tauri 命令（文件读写等）
│   │   └── main.rs                 # Rust 入口
│   ├── Cargo.toml                  # Rust 依赖
│   ├── tauri.conf.json             # Tauri 配置
│   └── capabilities/               # 权限配置
├── package.json                    # 前端依赖
├── vite.config.ts                  # Vite 配置
├── tailwind.config.js              # Tailwind 配置
├── tsconfig.json                   # TypeScript 配置
└── CLAUDE.md                       # 项目说明文档
```

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + N` | 新建文件 |
| `Ctrl + O` | 打开文件 |
| `Ctrl + S` | 保存文件 |
| `Ctrl + B` | 加粗 |
| `Ctrl + I` | 斜体 |
| `Tab` | 向右缩进 |
| `Shift + Tab` | 向左缩进 |

## 🎨 主题

支持亮色和暗色两种主题，点击工具栏右侧的 🌓 按钮切换。

主题设置会自动保存到本地存储，下次打开应用时自动恢复。

## 📤 导出功能

- **导出 PDF**：将预览区内容导出为 PDF 文件
- **导出图片**：将预览区内容导出为 PNG 图片

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: 添加某功能'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Tauri](https://tauri.app/) - 优秀的桌面应用框架
- [CodeMirror](https://codemirror.net/) - 强大的代码编辑器
- [marked](https://github.com/markedjs/marked) - 快速的 Markdown 解析器
- [highlight.js](https://highlightjs.org/) - 代码语法高亮库
