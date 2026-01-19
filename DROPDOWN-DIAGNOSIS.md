# 🔍 小程序下拉框无数据问题诊断

## 问题描述
小程序试卷页面的下拉框（城市、年级、科目）没有显示数据

## ✅ 后端验证

### API 端点测试
```bash
# 测试城市接口
curl http://localhost:3000/api/cities
# ✅ 返回正常，有数据

# 测试年级接口
curl http://localhost:3000/api/grades
# ✅ 返回正常，有数据

# 测试科目接口
curl http://localhost:3000/api/subjects
# ✅ 返回正常，有数据
```

### 数据格式验证

**城市数据示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "北京市",
      "code": "110000",
      "province": "北京市"
    }
  ]
}
```

**结论**: ✅ 后端 API 正常，数据格式正确

---

## 📱 小程序代码分析

### 1. 数据加载流程

#### 页面加载 (exams.js:77-96)
```javascript
loadBaseData() {
  Promise.all([
    api.baseApi.getCities(),
    api.baseApi.getGrades(),
    api.baseApi.getSubjects()
  ]).then(([cities, grades, subjects]) => {
    console.log('基础数据加载成功:', { cities, grades, subjects })
    this.setData({
      cities,
      grades,
      subjects
    })
  }).catch(err => {
    console.error('基础数据加载失败:', err)
    wx.showToast({
      title: '数据加载失败',
      icon: 'none'
    })
  })
}
```

### 2. API 调用配置

#### API 定义 (api/index.js:26-45)
```javascript
const baseApi = {
  getCities: () => request({
    url: '/cities',
    method: 'GET'
  }),

  getGrades: () => request({
    url: '/grades',
    method: 'GET'
  }),

  getSubjects: () => request({
    url: '/subjects',
    method: 'GET'
  })
}
```

#### 请求配置 (utils/config.js:1-28)
```javascript
const config = {
  baseURL: 'http://localhost:3000/api',  // ✅ 指向本地开发服务器
  // ...
}
```

---

## 🐛 可能的问题原因

### 1. 域名校验问题 ⚠️

**症状**: 小程序控制台显示 `request:fail url not in domain list`

**原因**: 微信小程序默认不允许访问 localhost 地址

**解决方案**:
1. 打开微信开发者工具
2. 点击右上角 **详情** 按钮
3. 选择 **本地设置** 标签
4. ✅ 勾选 **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**

### 2. 服务未启动问题 ⚠️

**症状**: `request:fail url not in domain list` 或连接失败

**验证方法**:
```bash
# 在终端执行
curl http://localhost:3000/api/cities
```

**解决方案**:
```bash
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

### 3. 数据解析问题 ⚠️

**症状**: 请求成功但下拉框仍为空

**检查点**:
- 小程序控制台是否显示 `基础数据加载成功`
- 数据格式是否正确（应该是数组）
- 页面是否正确绑定数据

### 4. 页面渲染问题 ⚠️

**症状**: 数据已加载但 UI 不显示

**检查方法**:
查看 `exams.wxml` 中的数据绑定是否正确

---

## 🔧 诊断步骤

### 步骤 1: 检查微信开发者工具配置

1. 打开微信开发者工具
2. 点击 **详情** → **本地设置**
3. ✅ 确保 **不校验合法域名** 已勾选

### 步骤 2: 检查后端服务状态

```bash
# 测试服务是否运行
curl http://localhost:3000/health

# 预期输出:
# {"status":"ok","message":"服务运行正常"}
```

### 步骤 3: 查看小程序控制台

打开小程序的 **调试器** → **Console** 标签，查找以下日志：

#### 正常情况应该看到:
```
[request] 请求: GET http://localhost:3000/api/cities
[request] 响应: 200 {code: 200, message: "获取成功", data: Array}
[request] 请求: GET http://localhost:3000/api/grades
[request] 响应: 200 {code: 200, message: "获取成功", data: Array}
[request] 请求: GET http://localhost:3000/api/subjects
[request] 响应: 200 {code: 200, message: "获取成功", data: Array}
基础数据加载成功: {cities: Array(3), grades: Array(6), subjects: Array(6)}
```

#### 异常情况可能看到:
```
[request] 失败: {errMsg: "request:fail url not in domain list"}
基础数据加载失败: {...}
```

### 步骤 4: 检查网络请求

打开 **调试器** → **Network** 标签，查看：
- 请求 URL 是否正确
- 请求状态码（应该是 200）
- 响应数据格式是否正确

### 步骤 5: 检查页面数据绑定

在 **调试器** → **AppData** 标签中查看：
- `cities` 数组是否有数据
- `grades` 数组是否有数据
- `subjects` 数组是否有数据

---

## 📋 快速修复清单

- [ ] 1. 微信开发者工具中关闭域名校验
- [ ] 2. 确认后端服务正在运行
- [ ] 3. 查看小程序控制台日志
- [ ] 4. 检查网络请求状态
- [ ] 5. 验证 AppData 中是否有数据
- [ ] 6. 如果数据存在但 UI 不显示，检查 wxml 绑定

---

## 🎯 预期的正常流程

### 1. 启动服务
```bash
cd api-service
node src/app.js
```

### 2. 配置小程序
微信开发者工具 → 详情 → 本地设置 → ✅ 不校验合法域名

### 3. 打开小程序
- 进入试卷页面
- 查看控制台输出
- 下拉框应该有数据

### 4. 验证数据
点击下拉框，应该看到：
- 城市列表：北京市、上海市、广州市...
- 年级列表：五年级、六年级、七年级...
- 科目列表：语文、数学、英语...

---

## 📊 数据结构参考

### cities 数据结构
```javascript
[
  {id: 1, name: "北京市", code: "110000", province: "北京市"},
  {id: 2, name: "上海市", code: "310000", province: "上海市"}
]
```

### grades 数据结构
```javascript
[
  {id: 5, name: "五年级", level: 1},
  {id: 6, name: "六年级", level: 1},
  {id: 7, name: "七年级", level: 2}
]
```

### subjects 数据结构
```javascript
[
  {id: 1, name: "语文", icon: null},
  {id: 2, name: "数学", icon: null},
  {id: 3, name: "英语", icon: null}
]
```

---

## 💡 调试技巧

### 在页面中添加调试日志

在 `exams.js` 的 `loadBaseData` 方法中添加：
```javascript
loadBaseData() {
  console.log('开始加载基础数据...')
  Promise.all([
    api.baseApi.getCities(),
    api.baseApi.getGrades(),
    api.baseApi.getSubjects()
  ]).then(([cities, grades, subjects]) => {
    console.log('基础数据加载成功:', {
      cities: cities.length,
      grades: grades.length,
      subjects: subjects.length
    })
    console.log('城市数据:', cities)
    console.log('年级数据:', grades)
    console.log('科目数据:', subjects)

    this.setData({
      cities,
      grades,
      subjects
    }, () => {
      console.log('setData 完成')
      console.log('页面数据 cities:', this.data.cities)
      console.log('页面数据 grades:', this.data.grades)
      console.log('页面数据 subjects:', this.data.subjects)
    })
  }).catch(err => {
    console.error('基础数据加载失败:', err)
    wx.showToast({
      title: '数据加载失败',
      icon: 'none'
    })
  })
}
```

### 检查 wxml 数据绑定

确保 `exams.wxml` 中正确绑定数据：
```xml
<picker mode="selector" range="{{cities}}" range-key="name">
  <view>{{selectedCity.name || '选择城市'}}</view>
</picker>
```

---

**更新时间**: 2026-01-19
**状态**: ⚠️ 等待用户反馈具体错误信息
