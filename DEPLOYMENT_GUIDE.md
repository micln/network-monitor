# Cloudflare Pages 自动部署配置指南

## 🎯 目标
实现 `network-monitor` 项目的完全自动化部署到 Cloudflare Pages

## ✅ 已完成
- [x] 项目代码准备完成
- [x] Worker 脚本创建 (`deploy-worker.js`)
- [x] GitHub 仓库连接配置

## 🚀 快速开始（3步完成）

### 步骤 1：访问 Cloudflare Dashboard
访问：https://dash.cloudflare.com/864f04d6c1c0931d34d097f516a9eba5/pages

### 步骤 2：创建/配置 Pages 项目
1. 点击 **Create a project**
2. 选择 **Connect to Git**
3. 选择仓库：`micln/network-monitor`
4. 配置：
   - **Build command:** （留空）
   - **Build output directory:** （留空）
   - **Root directory:** / （根目录）
5. 点击 **Save and Deploy**

### 步骤 3：配置自动部署（已自动完成 ✓）
由于已连接 GitHub，每次 push 到 `main` 分支将自动触发部署。

## 🌐 自定义域名配置

### 方案 A：在 Cloudflare Dashboard 配置
1. 进入你的 Pages 项目
2. 点击 **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入域名（如：`monitor.yourdomain.com`）
5. 按提示完成 DNS 配置

### 方案 B：通过 API 配置
```bash
# 设置自定义域名
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/domains" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "monitor.yourdomain.com"
  }'
```

## 📊 访问地址

部署成功后，你可以使用：

1. **Cloudflare Pages URL:**
   ```
   https://network-monitor.pages.dev
   ```

2. **自定义域名:**
   ```
   https://monitor.yourdomain.com
   ```

3. **GitHub Pages（已有）:**
   ```
   https://micln.github.io/network-monitor/
   ```

## 🔧 GitHub Webhook 配置（可选）

如需更精细的控制，可以配置 GitHub Webhook：

1. 访问 GitHub 仓库：https://github.com/micln/network-monitor/settings/hooks

2. 点击 **Add webhook**

3. 配置：
   - **Payload URL:** `https://your-worker.your-subdomain.workers.dev/github-webhook`
   - **Content type:** application/json
   - **Events:** Push events

4. 点击 **Add webhook**

## 📝 常用命令

### 手动触发部署（通过 Dashboard）
1. 进入 Cloudflare Pages 项目
2. 点击 **Deployments**
3. 点击 **Retry deployment**

### 查看部署日志
在 Cloudflare Pages 项目 → **Deployments** → 点击最近一次部署查看日志

## 🔄 更新代码流程

```bash
# 1. 本地修改代码
cd /root/network-monitor
vim app.js  # 或其他文件

# 2. 提交到 GitHub
git add .
git commit -m "Update: 描述你的修改"
git push origin main

# 3. 自动触发部署（2-3分钟后生效）
# 无需其他操作！
```

## 📦 项目文件说明

```
network-monitor/
├── index.html      # 主页面
├── app.js         # 核心逻辑
├── styles.css     # 样式文件
├── sites.json     # 站点配置
└── deploy-worker.js  # 自动化部署 Worker（可选）
```

## ⚠️ 注意事项

1. **首次部署**：首次连接 GitHub 后会自动触发部署，约 1-2 分钟
2. **后续更新**：每次 push 自动触发，无需手动操作
3. **预览部署**：创建 Pull Request 时会自动创建预览环境
4. **域名生效**：自定义域名 DNS 更改可能需要几分钟到几小时

## 🆘 常见问题

### Q: 部署失败怎么办？
A: 检查 Cloudflare Dashboard → Deployments → 查看错误日志

### Q: 自域名无法访问？
A: 确认 DNS 记录已正确配置，等待 DNS 生效

### Q: 想删除项目？
A: Cloudflare Dashboard → Pages → 项目 → Settings → Delete

## 📞 获取帮助

- Cloudflare 文档：https://developers.cloudflare.com/pages/
- GitHub Issues：在仓库中创建 Issue

---

**状态：等待配置** 📋
请访问 Cloudflare Dashboard 开始配置！
