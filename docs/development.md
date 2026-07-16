# 开发环境搭建

## 前置要求

### 必须安装
1. **Node.js** (v18 或更高版本)
   - 推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本
   - 下载地址：https://nodejs.org/

2. **Rust** (最新稳定版)
   - 安装 rustup：https://rustup.rs/
   - Windows 用户需要安装 Visual Studio Build Tools

3. **Visual Studio Build Tools** (Windows)
   - 下载地址：https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - 安装时选择 "C++ build tools" 工作负载

### 可选工具
- **Git**：版本控制
- **VS Code**：推荐的代码编辑器
- **Rust Analyzer**：VS Code 的 Rust 语言支持插件

## 安装步骤

### 1. 克隆仓库
```bash
git clone https://github.com/damowanglx/FileWithJob.git
cd FileWithJob
```

### 2. 安装前端依赖
```bash
npm install
```

### 3. 启动开发模式
```bash
npm run tauri dev
```

> ⚠️ 首次运行 `npm run tauri dev` 会下载 Rust 依赖并编译，耗时约 5-10 分钟。后续热更新会很快。

## 项目结构

```
FileWithJob/
├── src/                            # 前端源码
│   ├── components/                 # React 组件
│   │   ├── Editor/                 # CodeMirror 6 编辑器
│   │   ├── Preview/                # Markdown 实时预览
│   │   ├── Toolbar/                # 工具栏
│   │   ├── StatusBar/              # 状态栏
│   │   ├── Notification/           # 通知组件
│   │   ├── Settings/               # 设置面板
│   │   └── ErrorBoundary/          # 错误边界
│   ├── hooks/                      # 自定义 React Hooks
│   │   ├── useTheme.ts             # 主题切换 Hook
│   │   ├── useFileOperation.ts     # 文件操作封装
│   │   ├── useKeyboardShortcuts.ts # 键盘快捷键
│   │   ├── useNotifications.ts     # 通知系统
│   │   ├── useSettings.ts          # 设置管理
│   │   ├── useDebounce.ts          # 防抖和节流
│   │   ├── useI18n.ts              # 国际化
│   │   └── usePerformanceMonitor.ts # 性能监控
│   ├── utils/                      # 工具函数
│   │   ├── markdown.ts             # Markdown 解析配置
│   │   └── export.ts               # PDF/图片导出
│   ├── styles/                     # 样式文件
│   ├── App.tsx                     # 主应用组件
│   ├── main.tsx                    # 应用入口
│   └── index.css                   # 全局样式
├── src-tauri/                      # Rust 后端
│   ├── src/
│   │   ├── lib.rs                  # Tauri 命令
│   │   └── main.rs                 # Rust 入口
│   ├── Cargo.toml                  # Rust 依赖
│   ├── tauri.conf.json             # Tauri 配置
│   ├── capabilities/               # 权限配置
│   ├── icons/                      # 应用图标
│   └── target/                     # Rust 编译输出
├── public/                         # 静态资源
├── docs/                           # 项目文档
├── .github/                        # GitHub 配置
├── package.json                    # 前端依赖
├── vite.config.ts                  # Vite 配置
├── tsconfig.json                   # TypeScript 配置
└── README.md                       # 项目说明文档
```

## 可用命令

### 开发命令
```bash
# 启动前端开发服务器（仅前端）
npm run dev

# 启动 Tauri 开发模式（前端 + Rust 后端）
npm run tauri dev

# 启动 Tauri 开发模式（带调试日志）
npm run tauri dev -- --verbose
```

### 构建命令
```bash
# 构建前端
npm run build

# 构建生产版本（包含安装包）
npm run tauri build

# 构建 Debug 版本
npm run tauri build --debug
```

### 代码质量
```bash
# 运行 ESLint 检查
npm run lint

# 运行 TypeScript 类型检查
npx tsc --noEmit
```

### 其他命令
```bash
# 更新 Rust 依赖
cd src-tauri && cargo update

# 清理构建缓存
npm run clean

# 查看 Tauri 版本
npx tauri --version
```

## 调试技巧

### 前端调试
1. 在开发模式下，按 `F12` 打开开发者工具
2. 使用 React DevTools 扩展调试组件状态

### Rust 后端调试
1. 使用 `println!` 或 `log` 宏输出调试信息
2. 在 `src-tauri/src/lib.rs` 中添加 `dbg!` 宏
3. 查看终端输出的 Rust 日志

### 常见问题
1. **编译错误**：确保 Rust 工具链是最新的 (`rustup update`)
2. **依赖问题**：删除 `node_modules` 和 `target` 目录后重新安装
3. **权限问题**：Windows 上以管理员身份运行终端

## 热重载

开发模式支持热重载：
- 前端代码修改后自动刷新
- Rust 代码修改后需要重新编译（约 10-30 秒）

## 测试

```bash
# 运行前端测试
npm test

# 运行 Rust 测试
cd src-tauri && cargo test
```
