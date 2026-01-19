# 🔧 路由顺序问题修复

## 🐛 问题描述

**错误信息**:
```
GET http://localhost:3000/api/exams/downloads?page=1&limit=1 404 (Not Found)
{code: 404, message: "试卷不存在"}
```

## 🔍 根本原因

### Express 路由匹配机制

Express 按照路由**定义顺序**进行匹配，找到第一个匹配的路由后就停止。

### 错误的路由顺序 ❌

```javascript
// 第 24 行
router.get('/exams/:id', examController.getDetail);  // 会匹配 /exams/downloads！

// 第 27 行
router.get('/exams/downloads', authMiddleware, examController.getDownloads);  // 永远不会被执行
```

### 问题分析

当请求 `GET /api/exams/downloads` 时：

1. Express 按顺序检查路由
2. 遇到 `/exams/:id`，将 "downloads" 匹配为 `:id` 参数
3. 调用 `examController.getDetail` 方法
4. `getDetail` 尝试查找 ID 为 "downloads" 的试卷
5. 找不到，返回 404 "试卷不存在"

**错误流程**:
```
请求: GET /api/exams/downloads
  ↓
匹配: /exams/:id (id = "downloads")
  ↓
调用: examController.getDetail
  ↓
查询: SELECT * FROM exams WHERE id = 'downloads'
  ↓
结果: 找不到记录
  ↓
返回: 404 "试卷不存在"
```

---

## ✅ 修复方案

### 正确的路由顺序

**原则**: 具体路由在前，动态路由在后

```javascript
// 试卷相关 - 修复后的正确顺序 ✅
router.get('/exams', examController.getList);                    // 1. 列表
router.get('/exams/search', examController.search);              // 2. 搜索（具体路径）
router.get('/exams/downloads', authMiddleware, examController.getDownloads);  // 3. 下载记录（具体路径）
router.get('/exams/:id', examController.getDetail);              // 4. 详情（动态路径）- 放最后
router.post('/exams/:id/download', examController.download);     // 5. 下载（动态路径）
```

### 修复后的流程

```
请求: GET /api/exams/downloads
  ↓
检查: /exams - 不匹配
  ↓
检查: /exams/search - 不匹配
  ↓
检查: /exams/downloads - ✅ 匹配！
  ↓
调用: examController.getDownloads
  ↓
查询: SELECT * FROM download_logs WHERE user_id = ?
  ↓
结果: 返回下载记录列表
```

---

## 📋 路由顺序最佳实践

### 规则 1: 具体优先，动态在后

```javascript
// ✅ 正确
router.get('/users/me', getMe);           // 具体
router.get('/users/:id', getUser);        // 动态

// ❌ 错误
router.get('/users/:id', getUser);        // 会匹配 /users/me
router.get('/users/me', getMe);           // 永远不会执行
```

### 规则 2: 静态路径优先，动态路径在后

```javascript
// ✅ 正确
router.get('/posts/search', search);      // 具体
router.get('/posts/latest', latest);      // 具体
router.get('/posts/:id', detail);         // 动态 - 放最后

// ❌ 错误
router.get('/posts/:id', detail);         // 会匹配 /posts/search
router.get('/posts/search', search);
```

### 规则 3: 特殊路径优先

```javascript
// ✅ 正确
router.get('/api/health', health);
router.get('/api/stats', stats);
router.get('/api/:resource', list);       // 动态 - 放最后

// ❌ 错误
router.get('/api/:resource', list);
router.get('/api/health', health);        // 会被 :resource 匹配
```

---

## 🧪 验证修复

### 测试命令

```bash
# 1. 测试获取下载记录（需要登录 token）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/exams/downloads?page=1&limit=10"

# 预期输出:
# {
#   "code": 200,
#   "data": {
#     "list": [...],
#     "total": N,
#     "page": 1,
#     "limit": 10
#   }
# }
```

### 检查路由顺序

```bash
# 查看当前路由配置
cat api-service/src/routes/index.js | grep "router.get.*exams"
```

应该看到:
```
router.get('/exams', ...)
router.get('/exams/search', ...)
router.get('/exams/downloads', ...)
router.get('/exams/:id', ...)
```

**顺序**: 具体路径在前，动态路径 (`:id`) 在后 ✅

---

## 📊 影响的端点

修复后，以下端点将正常工作：

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/exams/search` | GET | 搜索试卷 | ✅ 已修复 |
| `/api/exams/downloads` | GET | 获取下载记录 | ✅ 已修复 |
| `/api/exams/:id` | GET | 获取试卷详情 | ✅ 正常 |
| `/api/exams/:id/download` | POST | 下载试卷 | ✅ 正常 |

---

## 🔄 重启服务

**重要**: 修改路由后需要重启服务才能生效！

```bash
# 1. 停止旧服务（在终端按 Ctrl+C）

# 2. 重新启动
cd api-service
node src/app.js
```

应该看到:
```
========================================
🚀 资料管理小程序后端服务
========================================
📡 服务地址: http://localhost:3000
🏥 健康检查: http://localhost:3000/health
📚 API地址: http://localhost:3000/api
========================================
```

---

## 🎯 修复验证清单

- [ ] 1. 路由顺序已调整（具体路由在前）
- [ ] 2. 语法检查通过
- [ ] 3. 服务已重启
- [ ] 4. 小程序刷新
- [ ] 5. 下载记录接口返回 200
- [ ] 6. 搜索接口正常工作

---

## 📝 相关问题

### 类似的路由顺序问题

如果将来遇到以下情况，都要考虑路由顺序：

1. `/users/:id` vs `/users/me`
2. `/posts/:id` vs `/posts/new`
3. `/api/:version/users` vs `/api/v1/users`
4. `/files/:category/:id` vs `/files/downloads`

**通用规则**: 越具体的路由定义越靠前

---

## 🔗 相关文档

- [Express 路由匹配](https://expressjs.com/en/guide/routing.html)
- [路由最佳实践](https://restfulapi.net/resource-naming/)
- [API-ROUTES-FIXED.md](./API-ROUTES-FIXED.md) - 之前的路由修复

---

**修复时间**: 2026-01-19
**问题级别**: 🔧 路由顺序错误
**影响范围**: `/api/exams/search` 和 `/api/exams/downloads` 端点
**修复状态**: ✅ 已修复，需要重启服务
