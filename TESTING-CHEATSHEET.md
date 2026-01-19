# 📋 项目测试流程 - 快速参考

## 🎯 测试概览

### 项目结构
```
exam-system/
├── api-service/          # 后端 API 服务
│   ├── src/              # 源代码
│   ├── tests/            # 测试文件 ⭐
│   └── coverage/         # 覆盖率报告
├── admin-dashboard/      # 管理后台（React）
└── miniapp/              # 微信小程序
```

### 测试技术栈
- **Jest** - 测试框架
- **Supertest** - HTTP 测试
- **ESLint** - 代码检查

---

## 🚀 快速开始

### 1. 运行测试
```bash
cd api-service
npm test
```

### 2. 监听模式
```bash
npm run test:watch
```

### 3. 查看覆盖率
```bash
open coverage/lcov-report/index.html
```

---

## 📁 测试文件结构

```
tests/
├── setup.js              # 全局测试设置
├── fixtures/             # Mock 数据
│   └── exam-data.js
├── unit/                 # 单元测试
│   ├── exam.service.test.js
│   └── user.service.test.js
└── integration/          # 集成测试
    ├── health.test.js    ✅
    └── base.api.test.js  ✅
```

---

## 📝 测试模板

### 集成测试模板
```javascript
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/utils/db');

jest.mock('../../src/utils/db');

describe('API 测试组', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该返回成功响应', async () => {
    db.query.mockResolvedValue([{ id: 1, name: 'Test' }]);

    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body.code).toBe(200);
    expect(db.query).toHaveBeenCalled();
  });
});
```

### 单元测试模板
```javascript
const Service = require('../../src/services/exam.service');
const db = require('../../src/utils/db');

jest.mock('../../src/utils/db');

describe('Service 测试组', () => {
  test('应该返回数据', async () => {
    db.query.mockResolvedValue([{ id: 1 }]);

    const result = await Service.getList();

    expect(result).toBeDefined();
  });
});
```

---

## 🎯 测试检查清单

### 测试环境 ✓
- [ ] Jest 配置文件创建
- [ ] 测试目录结构设置
- [ ] Mock 数据准备
- [ ] 环境变量配置

### 测试编写 ✓
- [ ] 单元测试（Service 层）
- [ ] 集成测试（API 层）
- [ ] 错误处理测试
- [ ] 边界条件测试

### 测试质量 ✓
- [ ] 测试隔离（独立运行）
- [ ] Mock 清理（beforeEach）
- [ ] 异步测试处理（async/await）
- [ ] 错误断言完整

---

## 📊 覆盖率目标

| 模块 | 目标 | 当前 |
|------|------|------|
| Controllers | 80% | 0% |
| Services | 80% | 0% |
| Models | 90% | 0% |
| Middlewares | 70% | 0% |
| Utils | 90% | 0% |

---

## 🐛 常见问题

### Q: 测试失败 - "Route.post() requires a callback"
**A**: 检查路由引用的控制器方法是否存在

### Q: 数据库连接错误
**A**: 使用 `jest.mock()` Mock 数据库连接

### Q: 测试超时
**A**: 增加 `jest.setTimeout(10000)` 或优化异步操作

### Q: Mock 不生效
**A**: 确保在测试文件顶部，require 之前调用 `jest.mock()`

---

## 🔧 Jest 配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80
    }
  }
};
```

---

## 📚 命令参考

```bash
# 运行所有测试
npm test

# 运行特定文件
npm test filename.test.js

# 监听模式
npm run test:watch

# 覆盖率报告
npm test -- --coverage

# 详细输出
npm test -- --verbose

# 只运行匹配的测试
npm test -- --testNamePattern="API"

# 更新快照
npm test -- -u
```

---

## 📖 相关文档

- [完整测试指南](./TEST-GUIDE.md)
- [测试演示报告](./TEST-DEMO.md)
- [Jest 官方文档](https://jestjs.io/)
- [Supertest 文档](https://github.com/visionmedia/supertest)

---

## 🎓 测试最佳实践

1. **测试隔离**: 每个测试独立运行
2. **描述清晰**: test 名称应该描述测试内容
3. **AAA 模式**: Arrange（准备）→ Act（执行）→ Assert（断言）
4. **Mock 外部依赖**: 数据库、API、文件系统
5. **测试边界**: 正常情况 + 异常情况
6. **保持简单**: 一个测试只验证一件事

---

**最后更新**: 2026-01-19
**测试框架**: Jest v29.7.0
**HTTP 测试**: Supertest v6.3.3
