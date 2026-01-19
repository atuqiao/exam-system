const db = require('../utils/db');

class BaseService {
  async getCities() {
    const sql = 'SELECT * FROM cities WHERE status = 1 ORDER BY id';
    try {
      const results = await db.query(sql);
      return results;
    } catch (error) {
      console.error('[BaseService.getCities] Error:', error);
      throw error;
    }
  }

  async getGrades() {
    const sql = 'SELECT * FROM grades WHERE status = 1 ORDER BY id';
    try {
      const results = await db.query(sql);
      return results;
    } catch (error) {
      console.error('[BaseService.getGrades] Error:', error);
      throw error;
    }
  }

  async getSubjects() {
    const sql = 'SELECT * FROM subjects WHERE status = 1 ORDER BY id';
    try {
      const results = await db.query(sql);
      return results;
    } catch (error) {
      console.error('[BaseService.getSubjects] Error:', error);
      throw error;
    }
  }

  async getTagsByCity(cityId) {
    const sql = `
      SELECT DISTINCT t.id, t.name, t.alias
      FROM tags t
      WHERE t.status = 1 AND t.city_id = ?
      ORDER BY t.name
    `;
    try {
      const results = await db.query(sql, [cityId]);
      return results;
    } catch (error) {
      console.error('[BaseService.getTagsByCity] Error:', error);
      throw error;
    }
  }
}

module.exports = new BaseService();
