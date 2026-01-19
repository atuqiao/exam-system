// 测试环境设置
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // 使用不同的端口避免冲突
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = process.env.DB_NAME || 'exam_management';

// 设置测试超时时间
jest.setTimeout(10000);

// 全局测试钩子
beforeAll(async () => {
  console.log('✅ 测试环境初始化完成');
});

afterAll(async () => {
  console.log('✅ 测试环境清理完成');
});

beforeEach(() => {
  // 每个测试前清空所有 mocks
  jest.clearAllMocks();
});

// 抑制控制台输出（测试时）
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
}
