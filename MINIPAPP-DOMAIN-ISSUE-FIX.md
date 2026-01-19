# 🔧 小程序域名配置问题解决方案

## 问题描述

小程序运行时出现错误：
```
request:fail url not in domain list
```

## 📋 问题原因

微信小程序有严格的网络安全限制：
1. **开发版**和**体验版**：可以请求任何域名
2. **正式版**：只能请求已配置的合法域名白名单
3. **本地开发**：需要在微信开发者工具中关闭"不校验合法域名"

---

## ✅ 解决方案

### 方案一：开发环境设置（推荐用于本地开发）

#### 1. 在微信开发者工具中设置

1. 打开微信开发者工具
2. 点击右上角 **详情**
3. 选择 **本地设置** 标签
4. 勾选以下选项：
   - ✅ **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**

#### 2. 确认 API 配置

在 [miniapp/utils/config.js](miniapp/utils/config.js:4) 中：

```javascript
const config = {
  // 开发环境使用本地服务器
  baseURL: 'http://localhost:3000/api',

  dev: {
    baseURL: 'http://localhost:3000/api'  // 本地开发
  },

  // 生产环境需要改为实际域名
  prod: {
    baseURL: 'https://your-domain.com/api'  // 需要替换
  }
}
```

#### 3. 启动本地 API 服务

```bash
cd api-service
npm start
```

服务将在 `http://localhost:3000` 启动。

---

### 方案二：配置生产环境域名（用于正式发布）

#### 1. 准备工作

- 需要一个已备案的域名
- 需要一台服务器部署 API 服务
- 需要配置 HTTPS 证书（微信小程序要求）

#### 2. 在微信公众平台配置域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入小程序后台
3. 选择 **开发** → **开发管理** → **开发设置**
4. 找到 **服务器域名** 部分
5. 点击 **修改**
6. 添加以下域名：

```
request 合法域名：
https://api.yourdomain.com

uploadFile 合法域名：
https://api.yourdomain.com

downloadFile 合法域名：
https://api.yourdomain.com
```

**注意事项**：
- 域名必须是 HTTPS
- 域名必须已备案
- 不能使用 IP 地址
- 不能使用端口号
- 每月只能修改 5 次

#### 3. 修改小程序配置

在 [miniapp/utils/config.js](miniapp/utils/config.js:12) 中：

```javascript
prod: {
  baseURL: 'https://api.yourdomain.com/api'  // 改为实际域名
}
```

#### 4. 部署 API 服务

```bash
# 使用 PM2 部署
pm2 start src/app.js --name exam-api

# 或使用 Docker
docker-compose up -d
```

---

### 方案三：使用云开发（推荐用于快速上线）

#### 1. 使用微信云开发

如果项目已经在使用云开发（从错误信息看到 tcb 域名），可以：

1. 在云开发控制台创建云函数
2. 将 API 逻辑迁移到云函数
3. 小程序直接调用云函数

#### 2. 优势

- 不需要配置服务器域名
- 自动 HTTPS
- 无需部署
- 按量付费

---

## 🚀 快速解决（当前最佳方案）

### 开发环境设置

**步骤 1：** 关闭域名校验
```
微信开发者工具 → 详情 → 本地设置
→ 勾选"不校验合法域名"
```

**步骤 2：** 启动本地 API 服务
```bash
cd api-service
npm start
```

**步骤 3：** 修复路由错误（重要！）

发现项目中存在路由配置错误，需要修复：

在 [api-service/src/routes/index.js](api-service/src/routes/index.js:25) 中：

```javascript
// 当前（错误）
router.post('/exams/:id/download', examController.recordDownload);

// 修改为（正确）
router.post('/exams/:id/download', examController.download);
```

---

## 📊 域名配置检查清单

### 开发环境 ✓
- [ ] 微信开发者工具中关闭域名校验
- [ ] 本地 API 服务已启动
- [ ] 确认 baseURL 配置正确
- [ ] 修复路由配置错误

### 生产环境
- [ ] 域名已备案
- [ ] 域名已配置 HTTPS
- [ ] 服务器已部署 API 服务
- [ ] 微信公众平台已配置域名白名单
- [ ] 修改生产环境配置

---

## 🐛 调试技巧

### 1. 检查当前使用的配置

```javascript
// 在 app.js 中添加
const config = require('./utils/config.js')
console.log('当前 API 地址:', config.baseURL)
```

### 2. 查看请求详情

在 [miniapp/utils/request.js](miniapp/utils/request.js:10) 中已有日志输出：
```javascript
console.log('[request] 请求:', options.method || 'GET', fullUrl)
```

### 3. 测试网络请求

在微信开发者工具的 **调试器** → **Network** 中查看请求详情。

---

## 📝 相关文件

- [API 配置文件](miniapp/utils/config.js)
- [请求封装](miniapp/utils/request.js)
- [API 接口定义](miniapp/api/index.js)
- [API 服务路由](api-service/src/routes/index.js)

---

## 🎯 推荐步骤

### 现在立即做：

1. **关闭域名校验**
   - 打开微信开发者工具
   - 详情 → 本地设置 → 勾选"不校验合法域名"

2. **启动 API 服务**
   ```bash
   cd api-service
   npm start
   ```

3. **修复路由错误**
   ```javascript
   // 在 api-service/src/routes/index.js:25
   router.post('/exams/:id/download', examController.download);
   ```

### 后续需要做：

1. 部署 API 服务到服务器
2. 配置 HTTPS 证书
3. 在微信公众平台配置域名白名单
4. 修改生产环境配置

---

**更新时间**: 2026-01-19
**问题状态**: 🔧 待解决
**优先级**: ⚠️ 高（影响小程序正常使用）
