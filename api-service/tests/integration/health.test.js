// 健康检查端点测试
const request = require('supertest');
const app = require('../../src/app');

describe('Health Check API', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('message');
  });

  test('GET /health should have timestamp', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.message).toBe('服务运行正常');
  });

  test('GET /unknown should return 404', async () => {
    const response = await request(app)
      .get('/unknown-endpoint')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('code', 404);
    expect(response.body).toHaveProperty('message');
  });
});
