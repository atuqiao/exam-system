# 🔧 下拉框问题快速修复指南

## ✅ 好消息：后端服务正常！

从日志可以看到，后端正在成功处理请求：
```
2026-01-19T10:04:14.786Z - GET /api/grades  ✅
2026-01-19T10:04:18.052Z - GET /api/cities  ✅
```

---

## 🎯 立即检查（3 步）

### 步骤 1: 检查小程序控制台 📱

打开微信开发者工具 → 调试器 → Console 标签

**查找以下日志**：

#### ✅ 正常情况（数据加载成功）
```
[request] 请求: GET http://localhost:3000/api/cities
[request] 响应: 200 {code: 200, message: "获取成功", data: Array}
[request] 请求: GET http://localhost:3000/api/grades
[request] 响应: 200 {code: 200, message: "获取成功", data: Array}
[request] 请求: GET http://localhost:3000/api/subjects
[request] 响应: 200 {code: 200, message: "获取成功", data: Array}
基础数据加载成功: {cities: Array(3), grades: Array(6), subjects: Array(6)}
```

#### ❌ 异常情况（域名校验失败）
```
[request] 失败: {errMsg: "request:fail url not in domain list"}
```

---

### 步骤 2: 检查域名校验设置 ⚠️

**如果看到域名校验失败，请立即执行：**

1. 打开微信开发者工具
2. 点击右上角 **详情** 按钮
3. 选择 **本地设置** 标签
4. ✅ **勾选** "不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

**截图示意**:
```
┌─────────────────────────────────┐
│ 详情 - exam-miniapp              │
├─────────────────────────────────┤
│ 本地设置                         │
│ ┌─────────────────────────────┐ │
│ │ ☑ 不校验合法域名、web-view...│ │ ← 勾选这个！
│ │ ☐ 启用调试                   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 步骤 3: 检查 AppData 💾

**如果请求成功但下拉框仍然为空：**

打开微信开发者工具 → 调试器 → AppData 标签

**检查以下数据是否存在**：
- `cities` - 应该有 3 个城市（北京、上海、广州等）
- `grades` - 应该有 6 个年级（五年级到高三）
- `subjects` - 应该有 6 个科目（语文、数学、英语等）

---

## 🔍 问题诊断树

```
问题：下拉框没有数据
│
├─ 情况 A：控制台显示 "url not in domain list"
│  └─ ✅ 解决：关闭域名校验（步骤 2）
│
├─ 情况 B：控制台显示 "基础数据加载成功" 但下拉框为空
│  │
│  ├─ 检查 AppData
│  │  ├─ 有数据 → UI 渲染问题，检查 wxml 绑定
│  │  └─ 无数据 → setData 问题，检查页面代码
│
├─ 情况 C：控制台显示 "基础数据加载失败"
│  └─ ✅ 解决：检查后端服务是否运行
│
└─ 情况 D：控制台完全没有日志
   └─ ✅ 解决：页面未正确加载，刷新小程序
```

---

## 📋 完整检查清单

请按顺序检查每一项：

- [ ] 1. 后端服务正在运行（终端显示服务启动信息）
- [ ] 2. 微信开发者工具已关闭域名校验
- [ ] 3. 小程序控制台显示请求日志
- [ ] 4. 请求返回 200 状态码
- [ ] 5. 控制台显示 "基础数据加载成功"
- [ ] 6. AppData 中有 cities、grades、subjects 数据
- [ ] 7. 下拉框 UI 正确绑定了数据

---

## 🚀 快速修复命令

### 重启后端服务
```bash
cd api-service
node src/app.js
```

### 重启小程序
1. 在微信开发者工具中点击 **编译** 按钮
2. 或使用快捷键：Ctrl/Cmd + B

### 清除缓存
1. 微信开发者工具 → 菜单栏
2. 工具 → 清除缓存
3. 清除全部缓存

---

## 📊 预期的正常输出

### 控制台应该显示：
```
[request] 请求: GET http://localhost:3000/api/cities
[request] 响应: 200 {code: 200, message: "获取成功", data: Array(3)}
[request] 请求: GET http://localhost:3000/api/grades
[request] 响应: 200 {code: 200, message: "获取成功", data: Array(6)}
[request] 请求: GET http://localhost:3000/api/subjects
[request] 响应: 200 {code: 200, message: "获取成功", data: Array(6)}
基础数据加载成功: {cities: Array(3), grades: Array(6), subjects: Array(6)}
```

### AppData 应该显示：
```javascript
{
  cities: [
    {id: 1, name: "北京市", ...},
    {id: 2, name: "上海市", ...},
    {id: 3, name: "广州市", ...}
  ],
  grades: [
    {id: 5, name: "五年级", ...},
    {id: 6, name: "六年级", ...},
    ...
  ],
  subjects: [
    {id: 1, name: "语文", ...},
    {id: 2, name: "数学", ...},
    ...
  ]
}
```

---

## 💡 调试小技巧

### 实时查看网络请求
1. 打开调试器 → Network 标签
2. 刷新页面
3. 查看 `/api/cities`、`/api/grades`、`/api/subjects` 请求
4. 点击查看响应内容

### 手动测试 API
```bash
# 在终端执行
curl http://localhost:3000/api/cities
curl http://localhost:3000/api/grades
curl http://localhost:3000/api/subjects
```

### 查看页面数据
在 `exams.js` 的 `loadBaseData` 成功回调中添加：
```javascript
console.log('当前页面数据:', this.data)
```

---

## 📞 如果问题仍未解决

请提供以下信息：

1. **小程序控制台截图**（Console 标签）
2. **网络请求截图**（Network 标签）
3. **AppData 截图**（显示数据结构）
4. **后端服务日志**（最新的 20 行）

---

**最后更新**: 2026-01-19 18:04
**后端状态**: ✅ 运行正常
**建议**: 优先检查域名校验设置
