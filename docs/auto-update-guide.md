# Tauri 自动更新配置指南

## 前提条件
1. GitHub 仓库
2. GitHub Personal Access Token (用于创建 Release)

## 步骤

### 1. 添加 Rust 依赖
在 `src-tauri/Cargo.toml` 的 `[dependencies]` 中添加：
```toml
tauri-plugin-updater = "2"
```

### 2. 注册插件
在 `src-tauri/src/lib.rs` 的 `tauri::Builder` 中添加：
```rust
.plugin(tauri_plugin_updater::Builder::new().build())
```

### 3. 配置更新源
在 `src-tauri/tauri.conf.json` 中添加：
```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://github.com/YOUR_USERNAME/FileWithJob/releases/latest/download/latest.json"
      ],
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### 4. 生成签名密钥
```bash
npx tauri signer generate -w ~/.tauri/filewithjob.key
```
将输出的公钥填入 `pubkey` 字段。

### 5. 配置 GitHub Actions
在 `.github/workflows/ci.yml` 中使用 `tauri-apps/tauri-action`，它会自动：
- 构建多平台安装包
- 生成 `latest.json` 更新清单
- 创建 GitHub Release

### 6. 权限配置
在 `src-tauri/capabilities/default.json` 中添加：
```json
{
  "permissions": [
    "updater:default",
    "updater:allow-check",
    "updater:allow-download-and-install"
  ]
}
```

## 测试
1. 推送代码并创建 Release
2. 安装旧版本
3. 启动应用，应该会提示更新
