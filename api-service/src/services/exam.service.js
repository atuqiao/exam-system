const db = require('../utils/db');

class ExamService {
  async getList(params) {
    const {
      cityId,
      gradeId,
      subjectId,
      tagId,
      page = 1,
      limit = 20,
      keyword,
      featured
    } = params;

    const offset = (page - 1) * limit;

    let where = ['e.status = 1'];
    let queryParams = [];

    if (cityId) {
      where.push('e.city_id = ?');
      queryParams.push(parseInt(cityId));
    }

    if (gradeId) {
      where.push('e.grade_id = ?');
      queryParams.push(parseInt(gradeId));
    }

    if (subjectId) {
      where.push('e.subject_id = ?');
      queryParams.push(parseInt(subjectId));
    }

    if (tagId) {
      where.push('(e.tag_id = ? OR t.alias = ?)');
      queryParams.push(parseInt(tagId), tagId);
    }

    if (featured) {
      where.push('e.featured = 1');
    }

    if (keyword) {
      where.push('e.title LIKE ?');
      queryParams.push('%' + keyword + '%');
    }

    const whereClause = where.join(' AND ');

    const sql = 'SELECT e.*, c.name as city_name, g.name as grade_name, s.name as subject_name, t.name as tag_name, t.alias as tag_alias FROM exams e LEFT JOIN cities c ON e.city_id = c.id LEFT JOIN grades g ON e.grade_id = g.id LEFT JOIN subjects s ON e.subject_id = s.id LEFT JOIN tags t ON e.tag_id = t.id WHERE ' + whereClause + ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';

    const countSql = 'SELECT COUNT(*) as total FROM exams e LEFT JOIN tags t ON e.tag_id = t.id WHERE ' + whereClause;

    try {
      const [list, [countResult]] = await Promise.all([
        db.query(sql, [...queryParams, parseInt(limit), offset]),
        db.query(countSql, queryParams)
      ]);

      return {
        list,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit)
      };
    } catch (error) {
      console.error('[ExamService.getList] Error:', error);
      throw error;
    }
  }

  async getDetail(id) {
    const sql = 'SELECT e.*, c.name as city_name, g.name as grade_name, s.name as subject_name, t.name as tag_name, t.alias as tag_alias FROM exams e LEFT JOIN cities c ON e.city_id = c.id LEFT JOIN grades g ON e.grade_id = g.id LEFT JOIN subjects s ON e.subject_id = s.id LEFT JOIN tags t ON e.tag_id = t.id WHERE e.id = ? AND e.status = 1';

    try {
      const [results] = await db.query(sql, [id]);
      
      if (!results || results.length === 0) {
        const error = new Error('试卷不存在');
        error.status = 404;
        throw error;
      }

      return results[0];
    } catch (error) {
      console.error('[ExamService.getDetail] Error:', error);
      throw error;
    }
  }

  async incrementDownloadCount(id) {
    const sql = 'UPDATE exams SET download_count = download_count + 1 WHERE id = ?';
    try {
      await db.query(sql, [id]);
    } catch (error) {
      console.error('[ExamService.incrementDownloadCount] Error:', error);
      throw error;
    }
  }
}

module.exports = new ExamService();
