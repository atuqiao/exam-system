module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 覆盖率配置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!**/node_modules/**'
  ],

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // 测试环境设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/'
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },

  // 详细输出
  verbose: true
};
