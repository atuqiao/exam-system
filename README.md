# 试卷管理系统 - 项目重构完成

## 📁 项目结构

```
exam-system/
├── api-service/          # 后端API服务
├── admin-dashboard/      # 后台管理系统
├── miniapp/              # 微信小程序
├── database/             # 数据库脚本
├── CODE-EXAMPLES.md      # 核心代码示例
└── README.md             # 本文档
```

---

## ✅ 已完成的工作

### 1. 项目骨架创建
- ✅ 创建了三个独立项目的目录结构
- ✅ 配置了package.json和依赖
- ✅ 设置了环境变量模板
- ✅ 配置了TypeScript和构建工具

### 2. 核心代码示例
- ✅ API Service：Controller、Service、Model三层架构
- ✅ Admin Dashboard：React + TypeScript组件示例
- ✅ Miniapp：页面和API封装示例
- ✅ 数据库迁移SQL脚本

### 3. 配置文件
- ✅ Docker Compose编排文件
- ✅ 环境变量配置模板
- ✅ 项目配置文件

---

## 🚀 快速开始

### 前置要求
- Node.js >= 16.0.0
- MySQL >= 8.0
- Redis >= 6.0
- Docker & Docker Compose (可选)

### 1. 克隆项目
```bash
git clone <repository-url>
cd exam-system
```

### 2. 安装依赖

#### API Service
```bash
cd api-service
npm install
cp .env.example .env
# 编辑.env配置数据库等信息
npm run dev
```

#### Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
# 访问 http://localhost:5173
```

#### Miniapp
```bash
# 使用微信开发者工具打开 miniapp 目录
# 配置 project.config.json 中的 appid
```

### 3. 数据库初始化
```bash
cd database
mysql -u root -p < migrations/001_create_tables.sql
mysql -u root -p exam_management < seeds/data.sql
```

### 4. Docker部署（推荐）
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 📚 详细文档

### [核心代码示例 (CODE-EXAMPLES.md)](CODE-EXAMPLES.md)
包含所有项目的核心代码实现：
- API Service完整的三层架构代码
- Admin Dashboard的React组件
- Miniapp的页面和API调用
- 数据库迁移脚本
- Docker配置

### [重构方案 (REFACTORING-PLAN.md)](../miniprogram-native/REFACTORING-PLAN.md)
完整的项目重构方案和架构说明。

### [部署文档 (DEPLOYMENT.md)](../miniprogram-native/DEPLOYMENT.md)
详细的部署步骤和运维指南。

---

## 🏗️ 架构说明

### API Service (Node.js + Express)
**目录结构**：
```
src/
├── config/          # 配置文件
├── controllers/     # 控制器层
├── models/          # 数据模型层
├── routes/          # 路由定义
├── services/        # 业务逻辑层 ⭐新增
├── middlewares/     # 中间件
├── validators/      # 数据验证 ⭐新增
└── utils/           # 工具类
```

**主要改进**：
- ✅ Service层：业务逻辑从Controller分离
- ✅ Model层：封装数据库操作
- ✅ Validator层：统一数据验证
- ✅ 错误处理中间件
- ✅ 日志系统
- ✅ Redis缓存

### Admin Dashboard (React + TypeScript)
**技术栈**：
- React 18 + TypeScript
- Vite（构建工具）
- Ant Design（UI组件）
- React Router（路由）
- Redux Toolkit（状态管理）

**主要功能**：
- 试卷管理（CRUD）
- 批量导入
- 数据可视化
- 用户管理
- 基础数据管理

### Miniapp (微信小程序原生)
**目录结构**：
```
pages/          # 页面
components/     # 组件
api/            # API封装
utils/          # 工具类
static/         # 静态资源
```

**主要改进**：
- ✅ 删除所有后端代码
- ✅ API配置分离
- ✅ 统一的请求封装
- ✅ 错误处理

---

## 🔑 环境变量配置

### API Service (.env)
```bash
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=exam_user
DB_PASSWORD=your_password
DB_NAME=exam_management

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-jwt-secret
WECHAT_APP_ID=your-appid
WECHAT_APP_SECRET=your-secret
```

### Admin Dashboard (.env.development)
```bash
VITE_API_URL=http://localhost:3000/api
```

### Miniapp (utils/config.js)
```javascript
const config = {
  dev: {
    apiUrl: 'http://localhost:3000/api'
  },
  prod: {
    apiUrl: 'https://api.yourdomain.com/api'
  }
};
```

---

## 📊 API接口文档

### 试卷接口
```
GET    /api/exams              获取试卷列表
GET    /api/exams/:id          获取试卷详情
POST   /api/exams/:id/download 记录下载
POST   /api/admin/exams        创建试卷（管理员）
PUT    /api/admin/exams/:id    更新试卷（管理员）
DELETE /api/admin/exams/:id    删除试卷（管理员）
```

### 基础数据接口
```
GET    /api/cities             获取城市列表
GET    /api/grades             获取年级列表
GET    /api/subjects           获取科目列表
GET    /api/tags/city/:id      根据城市获取标签
```

### 认证接口
```
POST   /api/auth/login         微信登录
POST   /api/auth/register      用户注册
GET    /api/auth/user          获取用户信息
```

---

## 🐳 Docker部署

### 使用Docker Compose一键部署
```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑.env文件

# 2. 启动所有服务
docker-compose up -d

# 3. 查看服务状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f api
docker-compose logs -f admin

# 5. 停止服务
docker-compose down
```

### 服务端口
- API服务: http://localhost:3000
- 管理后台: http://localhost:8080
- MySQL: localhost:3306
- Redis: localhost:6379

---

## 📝 迁移现有代码

### 从miniprogram-native迁移

#### 1. 后端代码 → api-service/
```bash
# 复制backend目录内容到api-service/src
cp -r ../miniprogram-native/backend/src/* api-service/src/
cp ../miniprogram-native/backend/package.json api-service/
```

#### 2. 后台管理 → admin-dashboard/
需要将HTML页面重写为React组件，参考CODE-EXAMPLES.md中的示例

#### 3. 小程序 → miniapp/
```bash
# 复制前端代码
cp -r ../miniprogram-native/pages miniapp/
cp -r ../miniprogram-native/components miniapp/
cp -r ../miniprogram-native/utils miniapp/
cp -r ../miniprogram-native/api miniapp/
cp -r ../miniprogram-native/static miniapp/
cp ../miniprogram-native/app.* miniapp/
```

---

## 🧪 测试

### API Service测试
```bash
cd api-service
npm test
npm run test:watch
```

### 运行集成测试
```bash
npm run test:integration
```

---

## 📈 监控和日志

### 日志位置
- API服务: `api-service/logs/app.log`
- Docker: `docker-compose logs`

### 查看实时日志
```bash
# API服务
tail -f api-service/logs/app.log

# Docker
docker-compose logs -f api
```

---

## 🔧 常见问题

### 1. 数据库连接失败
检查.env中的数据库配置是否正确，确保MySQL服务已启动

### 2. Redis连接失败
检查Redis服务是否启动：`redis-cli ping`

### 3. 端口冲突
修改.env或docker-compose.yml中的端口配置

### 4. Docker构建失败
检查Docker版本，确保Docker >= 20.0

---

## 🎯 下一步工作

- [ ] 完成单元测试覆盖
- [ ] 添加API文档（Swagger）
- [ ] 实现文件上传功能
- [ ] 添加数据可视化图表
- [ ] 优化性能和缓存
- [ ] 配置CI/CD流程

---

## 📞 技术支持

如有问题，请查看：
- [核心代码示例](CODE-EXAMPLES.md)
- [重构方案](../miniprogram-native/REFACTORING-PLAN.md)
- [部署文档](../miniprogram-native/DEPLOYMENT.md)

---

## 📄 许可证

MIT License
