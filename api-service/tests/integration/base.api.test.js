// 基础数据 API 测试
const request = require('supertest');
const app = require('../../src/app');
const { mockCities, mockGrades, mockSubjects } = require('../fixtures/exam-data');

// Mock 数据库
const db = require('../../src/utils/db');
jest.mock('../../src/utils/db');

describe('Base Data API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cities', () => {
    test('should return cities list', async () => {
      db.query.mockResolvedValue(mockCities);

      const response = await request(app)
        .get('/api/cities')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM cities ORDER BY id');
    });

    test('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/cities')
        .expect(500);

      expect(response.body.code).toBe(500);
      expect(response.body.message).toContain('获取城市列表失败');
    });
  });

  describe('GET /api/grades', () => {
    test('should return grades list', async () => {
      db.query.mockResolvedValue(mockGrades);

      const response = await request(app)
        .get('/api/grades')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(6);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM grades ORDER BY id');
    });

    test('should return empty array when no grades', async () => {
      db.query.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/grades')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/subjects', () => {
    test('should return subjects list', async () => {
      db.query.mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(6);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM subjects ORDER BY id');
    });
  });

  describe('GET /api/tags/city/:cityId', () => {
    test('should return tags for specific city', async () => {
      const cityTags = [
        { id: 1, name: '海淀区', alias: 'haidian', city_id: 1 }
      ];
      db.query.mockResolvedValue(cityTags);

      const response = await request(app)
        .get('/api/tags/city/1')
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM tags WHERE city_id = ? ORDER BY id',
        ['1']
      );
    });

    test('should handle invalid cityId', async () => {
      const response = await request(app)
        .get('/api/tags/city/invalid')
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('参数验证失败');
    });
  });
});
