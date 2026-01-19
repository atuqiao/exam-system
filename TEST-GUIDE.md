# 项目测试流程文档

## 📋 目录
1. [测试环境配置](#测试环境配置)
2. [测试工具介绍](#测试工具介绍)
3. [测试类型](#测试类型)
4. [测试命令](#测试命令)
5. [编写测试](#编写测试)
6. [当前测试状态](#当前测试状态)

---

## 🔧 测试环境配置

### 已安装的测试依赖

在 `api-service/package.json` 中已配置以下测试工具：

```json
{
  "devDependencies": {
    "jest": "^29.7.0",        // 测试框架
    "supertest": "^6.3.3",    // HTTP测试库
    "eslint": "^8.55.0"       // 代码检查
  }
}
```

### Jest 配置

Jest 可以通过以下方式配置：

#### 1. 创建 `jest.config.js` 文件

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

#### 2. 在 package.json 中配置

```json
{
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

---

## 🛠️ 测试工具介绍

### Jest
- JavaScript 测试框架
- 提供断言库、Mock功能、代码覆盖率
- 自动侦测文件变化并重新运行测试

### Supertest
- 用于测试 Node.js HTTP 服务器的库
- 提供高级断言方法
- 可以测试 Express 应用

---

## 📊 测试类型

### 1. 单元测试 (Unit Tests)
测试单个函数、类或组件

**目录**: `tests/unit/`

**示例**:
```javascript
// tests/unit/exam.service.test.js
const ExamService = require('../../src/services/exam.service');

describe('ExamService', () => {
  test('should get exam list', async () => {
    const result = await ExamService.getList({ cityId: 1 });
    expect(result).toBeDefined();
    expect(result.list).toBeInstanceOf(Array);
  });
});
```

### 2. 集成测试 (Integration Tests)
测试多个模块或服务的集成

**目录**: `tests/integration/`

**示例**:
```javascript
// tests/integration/exam.api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Exam API Integration', () => {
  test('GET /api/exams should return exam list', async () => {
    const response = await request(app)
      .get('/api/exams')
      .expect(200);

    expect(response.body.code).toBe(200);
    expect(response.body.data).toHaveProperty('list');
  });
});
```

### 3. 端到端测试 (E2E Tests)
测试完整的用户流程

**示例**:
```javascript
describe('Complete User Flow', () => {
  test('User login -> browse exams -> download', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ code: 'test-code' });

    // 2. Browse exams
    const examResponse = await request(app)
      .get('/api/exams?cityId=1')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    // 3. Download exam
    const downloadResponse = await request(app)
      .post(`/api/exams/${examResponse.body.data.list[0].id}/download`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(downloadResponse.status).toBe(200);
  });
});
```

---

## 🚀 测试命令

### 运行所有测试
```bash
cd api-service
npm test
```

### 运行测试并查看覆盖率
```bash
npm test
# Jest 默认使用 --coverage 参数
```

### 监听模式（开发时使用）
```bash
npm run test:watch
# 文件变化时自动重新运行测试
```

### 运行特定测试文件
```bash
npm test exam.controller.test.js
```

### 运行特定测试套件
```bash
npm test -- --testNamePattern="Exam API"
```

---

## ✍️ 编写测试

### 测试文件结构

```
tests/
├── setup.js              # 测试环境初始化
├── unit/                 # 单元测试
│   ├── exam.service.test.js
│   └── user.service.test.js
├── integration/          # 集成测试
│   ├── exam.api.test.js
│   └── auth.api.test.js
└── fixtures/             # 测试数据
    ├── exams.json
    └── users.json
```

### 测试环境设置

创建 `tests/setup.js`:

```javascript
// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test_exam_management';

// Mock 数据库连接
jest.mock('../src/utils/db', () => ({
  query: jest.fn(),
  transaction: jest.fn()
}));

// 全局测试钩子
beforeAll(async () => {
  // 测试开始前的操作（如连接测试数据库）
});

afterAll(async () => {
  // 测试结束后的操作（如关闭数据库连接）
});

beforeEach(() => {
  // 每个测试前的操作
});

afterEach(() => {
  // 每个测试后的操作（如清理数据）
  jest.clearAllMocks();
});
```

### 编写第一个测试

#### 示例 1: 测试 Controller

```javascript
// tests/unit/exam.controller.test.js
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/utils/db');

// Mock 数据库
jest.mock('../../src/utils/db');

describe('Exam Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/exams', () => {
    test('should return exam list', async () => {
      // Mock 数据库返回
      db.query.mockResolvedValue([
        { count: 1 }
      ]);
      db.query.mockResolvedValueOnce([
        { id: 1, title: '2024年北京中考数学试卷' }
      ]);

      const response = await request(app)
        .get('/api/exams')
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data.list).toBeDefined();
      expect(db.query).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/exams')
        .expect(500);

      expect(response.body.code).toBe(500);
    });
  });

  describe('GET /api/exams/:id', () => {
    test('should return exam detail', async () => {
      const mockExam = {
        id: 1,
        title: '2024年北京中考数学试卷',
        year: 2024,
        city_name: '北京',
        grade_name: '九年级',
        subject_name: '数学'
      };

      db.query.mockResolvedValue([mockExam]);

      const response = await request(app)
        .get('/api/exams/1')
        .expect(200);

      expect(response.body.data.title).toBe('2024年北京中考数学试卷');
    });

    test('should return 404 for non-existent exam', async () => {
      db.query.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/exams/999')
        .expect(404);

      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe('试卷不存在');
    });
  });
});
```

#### 示例 2: 测试 Service

```javascript
// tests/unit/exam.service.test.js
const ExamService = require('../../src/services/exam.service');
const db = require('../../src/utils/db');

jest.mock('../../src/utils/db');

describe('ExamService', () => {
  describe('getList', () => {
    test('should return paginated exam list', async () => {
      const mockData = {
        total: 100,
        list: [
          { id: 1, title: 'Exam 1' },
          { id: 2, title: 'Exam 2' }
        ]
      };

      db.query.mockResolvedValueOnce([{ total: 100 }]);
      db.query.mockResolvedValueOnce(mockData.list);

      const result = await ExamService.getList({
        cityId: 1,
        page: 1,
        limit: 20
      });

      expect(result.total).toBe(100);
      expect(result.list).toHaveLength(2);
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    test('should filter by cityId', async () => {
      db.query.mockResolvedValue([{ total: 50 }]);
      db.query.mockResolvedValue([]);

      await ExamService.getList({ cityId: 1 });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('e.city_id = ?'),
        [1]
      );
    });
  });
});
```

#### 示例 3: 测试 API 端点

```javascript
// tests/integration/exam.api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Exam API Integration Tests', () => {
  describe('Exam List API', () => {
    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/exams?page=1&limit=10')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
    });

    test('should support filtering by city', async () => {
      const response = await request(app)
        .get('/api/exams?cityId=1')
        .expect(200);

      expect(response.body.code).toBe(200);
    });

    test('should support filtering by grade', async () => {
      const response = await request(app)
        .get('/api/exams?gradeId=7')
        .expect(200);

      expect(response.body.code).toBe(200);
    });

    test('should support multiple filters', async () => {
      const response = await request(app)
        .get('/api/exams?cityId=1&gradeId=7&subjectId=1')
        .expect(200);

      expect(response.body.code).toBe(200);
    });
  });

  describe('Exam Detail API', () => {
    test('should return exam detail with related data', async () => {
      const response = await request(app)
        .get('/api/exams/1')
        .expect(200);

      expect(response.body.data).toHaveProperty('city_name');
      expect(response.body.data).toHaveProperty('grade_name');
      expect(response.body.data).toHaveProperty('subject_name');
    });
  });

  describe('Error Handling', () => {
    test('should return 400 for invalid cityId', async () => {
      const response = await request(app)
        .get('/api/exams?cityId=invalid')
        .expect(400);

      expect(response.body.message).toContain('cityId 参数无效');
    });

    test('should return 400 for invalid gradeId', async () => {
      const response = await request(app)
        .get('/api/exams?gradeId=abc')
        .expect(400);

      expect(response.body.message).toContain('gradeId 参数无效');
    });
  });
});
```

### 测试数据管理

创建测试数据文件 `tests/fixtures/exam-data.js`:

```javascript
module.exports = {
  mockExams: [
    {
      id: 1,
      title: '2024年北京中考数学试卷',
      year: 2024,
      semester: '上学期',
      city_id: 1,
      grade_id: 9,
      subject_id: 1,
      tag_id: 1,
      file_url: '/downloads/exam1.pdf',
      download_count: 100,
      status: 1
    },
    {
      id: 2,
      title: '2024年上海高考物理试卷',
      year: 2024,
      semester: '下学期',
      city_id: 2,
      grade_id: 12,
      subject_id: 2,
      tag_id: 2,
      file_url: '/downloads/exam2.pdf',
      download_count: 200,
      status: 1
    }
  ],

  mockCities: [
    { id: 1, name: '北京' },
    { id: 2, name: '上海' }
  ],

  mockGrades: [
    { id: 9, name: '九年级' },
    { id: 12, name: '高三' }
  ],

  mockSubjects: [
    { id: 1, name: '数学' },
    { id: 2, name: '物理' }
  ]
};
```

### Mock 策略

#### 1. Mock 数据库查询

```javascript
const db = require('../../src/utils/db');

jest.mock('../../src/utils/db');

test('should query database', async () => {
  db.query.mockResolvedValue([{ id: 1, name: 'Test' }]);

  const result = await someFunction();

  expect(db.query).toHaveBeenCalledWith(
    'SELECT * FROM exams WHERE id = ?',
    [1]
  );
});
```

#### 2. Mock 外部服务

```javascript
// Mock 微信 API
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({
    data: { openid: 'test-openid' }
  }))
}));
```

#### 3. Mock 文件系统

```javascript
const fs = require('fs');

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'mock file content')
}));
```

---

## 📈 当前测试状态

### ✅ 已配置
- Jest 测试框架
- Supertest HTTP 测试库
- 测试目录结构
- npm 测试脚本

### ❌ 待完成
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 创建测试数据库
- [ ] 设置测试环境变量
- [ ] 编写 Mock 数据
- [ ] 实现代码覆盖率目标
- [ ] CI/CD 集成

### 测试覆盖目标

| 模块 | 当前覆盖率 | 目标覆盖率 |
|------|----------|-----------|
| Controllers | 0% | 80% |
| Services | 0% | 80% |
| Models | 0% | 90% |
| Middlewares | 0% | 70% |
| Utils | 0% | 90% |

### 下一步行动

1. **创建测试数据库**
   ```sql
   CREATE DATABASE test_exam_management;
   -- 导入测试数据
   ```

2. **编写第一个测试**
   ```bash
   # 创建测试文件
   touch tests/integration/health.test.js
   ```

3. **运行测试**
   ```bash
   npm test
   ```

4. **查看覆盖率报告**
   ```bash
   open coverage/lcov-report/index.html
   ```

---

## 🔗 相关文档

- [Jest 官方文档](https://jestjs.io/)
- [Supertest 文档](https://github.com/visionmedia/supertest)
- [项目 README](../README.md)
- [核心代码示例](../CODE-EXAMPLES.md)
