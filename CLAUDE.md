# FileWithJob - Markdown Editor

## 项目概述
桌面端 Markdown 编辑器，支持编辑、预览、文件管理和导出。

## 技术栈
- **框架**: Tauri 2.0 (Rust 后端)
- **前端**: React 19 + TypeScript + Vite 7
- **样式**: Tailwind CSS v4
- **编辑器**: CodeMirror 6 (Markdown 语法高亮)
- **MD 解析**: marked + highlight.js
- **导出**: html2canvas + jsPDF

## 开发命令
```bash
npm run dev          # 启动前端开发服务器
npm run tauri dev    # 启动 Tauri 开发模式（前端 + Rust）
npm run tauri build  # 构建生产版本
```

## 项目结构
```
src/
├── components/
│   ├── Editor/       # CodeMirror 6 编辑器
│   ├── Preview/      # Markdown 实时预览
│   ├── Toolbar/      # 工具栏（文件操作/导出/主题）
│   └── StatusBar/    # 状态栏（字数/行号）
├── hooks/
│   ├── useTheme.ts       # 亮暗主题切换
│   └── useFileOperation.ts # 文件读写封装
├── utils/
│   ├── markdown.ts   # marked 配置 + 代码高亮
│   └── export.ts     # PDF/图片导出
├── styles/
│   └── preview.css   # 预览区 Markdown 样式
├── App.tsx           # 主布局
└── main.tsx          # 入口

src-tauri/
├── src/lib.rs        # Rust 命令（read_file, write_file, read_dir 等）
├── Cargo.toml        # Rust 依赖
├── tauri.conf.json   # Tauri 配置
└── capabilities/     # 权限配置
```

## 已实现功能（MVP）
- [x] CodeMirror 6 编辑器（Markdown 语法高亮、行号、自动缩进）
- [x] 右侧实时预览（marked 渲染 + highlight.js 代码高亮）
- [x] 打开 / 保存 / 新建文件（系统文件对话框）
- [x] 亮色 / 暗色主题切换
- [x] 工具栏（文件操作 + 导出 + 主题）
- [x] 状态栏（文件名、行数、字数）
- [x] 键盘快捷键（Ctrl+S 保存、Ctrl+O 打开、Ctrl+N 新建）
- [x] 导出 PDF / 图片

## 构建与分发

### 开发模式
```bash
npm run tauri dev    # 启动开发模式（热更新）
```

### 生产构建
```bash
npm run tauri build  # 构建安装包
```

构建产物位置：`src-tauri/target/release/bundle/`
- `nsis/` — NSIS 安装程序（.exe），双击安装，支持中文
- `msi/` — MSI 安装包，适合企业部署

### 目标机器要求
- **Windows 10/11**：WebView2 运行时已内置，无需额外安装
- **更旧系统**：安装包会自动下载安装 WebView2（需联网）
- **无需安装** Node.js、Rust 或任何开发工具

### 可移植性
| 方式 | 说明 |
|------|------|
| NSIS 安装包 | 推荐，自动处理依赖，支持自定义安装路径 |
| MSI 安装包 | 适合企业批量部署（GPO/SCCM） |
| 直接复制 .exe | Windows 10/11 可直接运行，无需安装 |

## 待实现功能
- [ ] 文件树侧栏
- [ ] 多标签页
- [ ] 最近打开记录
- [ ] 同步滚动
- [ ] 工具栏 Markdown 快捷按钮（加粗/斜体/标题等）
