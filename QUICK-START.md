# 🚀 快速启动指南

## ✅ 问题已修复

**路由配置错误已解决！** 现在可以正常启动服务了。

---

## 🎯 立即开始（3 步）

### 步骤 1：启动后端 API 服务

```bash
cd api-service
npm start
```

✅ 看到 "服务运行正常" 提示即表示启动成功

### 步骤 2：配置微信开发者工具

1. 打开微信开发者工具
2. 点击右上角 **详情** 按钮
3. 选择 **本地设置** 标签
4. ✅ 勾选 **不校验合法域名**

### 步骤 3：打开小程序

在微信开发者工具中打开 `miniapp` 目录即可开始开发调试

---

## 📡 服务地址

启动后可访问：

- **API 服务**: http://localhost:3000/api
- **健康检查**: http://localhost:3000/health
- **管理后台**: http://localhost:3000/admin

---

## 🧪 测试服务

```bash
# 测试健康检查
curl http://localhost:3000/health

# 测试获取城市列表
curl http://localhost:3000/api/cities

# 测试获取年级列表
curl http://localhost:3000/api/grades
```

---

## 📚 可用的 API 端点

### 认证
- `POST /api/auth/login` - 微信登录
- `GET /api/auth/userinfo` - 获取用户信息

### 基础数据
- `GET /api/cities` - 城市列表
- `GET /api/grades` - 年级列表
- `GET /api/subjects` - 科目列表

### 试卷
- `GET /api/exams` - 试卷列表
- `GET /api/exams/:id` - 试卷详情
- `POST /api/exams/:id/download` - 下载试卷 ✅

### 标签
- `GET /api/tags/city/:cityId` - 城市标签

---

## 🔧 常用命令

```bash
# 启动服务
npm start

# 开发模式（自动重启）
npm run dev

# 运行测试
npm test

# 测试监听模式
npm run test:watch
```

---

## 📖 详细文档

- [问题修复报告](./ISSUE-FIXED-REPORT.md) - 路由配置错误修复详情
- [小程序域名问题](./MINIPAPP-DOMAIN-ISSUE-FIX.md) - 域名配置解决方案
- [测试流程指南](./TEST-GUIDE.md) - 完整测试文档
- [项目 README](./README.md) - 项目说明

---

## ⚠️ 注意事项

1. **开发环境**
   - 必须在微信开发者工具中关闭域名校验
   - 确保 API 服务已启动

2. **生产环境**
   - 需要配置 HTTPS 域名
   - 需要在微信公众平台配置域名白名单

3. **数据库**
   - 确保 MySQL 数据库已启动
   - 检查 `.env` 文件中的数据库配置

---

## 🐛 遇到问题？

### 服务无法启动
```bash
# 检查端口是否被占用
lsof -i :3000

# 检查数据库连接
# 查看 .env 文件配置
```

### 小程序无法连接
- 确保微信开发者工具中已关闭域名校验
- 确保 API 服务正在运行
- 查看小程序调试器的 Console 和 Network

### 数据库错误
- 检查 MySQL 服务是否启动
- 验证 `.env` 中的数据库配置
- 确保数据库已创建并初始化

---

**更新时间**: 2026-01-19
**状态**: ✅ 所有功能正常
**准备就绪**: 可以开始开发！
