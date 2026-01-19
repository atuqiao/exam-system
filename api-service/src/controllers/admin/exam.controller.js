/**
 * 试卷管理控制器
 */
const AdminBaseController = require('../adminBase.controller');
const db = require('../../utils/db');
const fs = require('fs');
const path = require('path');

class ExamController extends AdminBaseController {
  constructor() {
    super('exams');
  }

  /**
   * 获取试卷列表（带关联信息）
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        cityId,
        gradeId,
        subjectId,
        featured,
        year,
        keyword,
        orderBy = 'exams.id',
        order = 'DESC'
      } = req.body;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (status !== undefined && status !== '') {
        whereClause += ' AND exams.status = ?';
        params.push(status);
      }

      if (cityId) {
        whereClause += ' AND exams.city_id = ?';
        params.push(cityId);
      }

      if (gradeId) {
        whereClause += ' AND exams.grade_id = ?';
        params.push(gradeId);
      }

      if (subjectId) {
        whereClause += ' AND exams.subject_id = ?';
        params.push(subjectId);
      }

      if (featured !== undefined && featured !== '') {
        whereClause += ' AND exams.featured = ?';
        params.push(featured);
      }

      if (year) {
        whereClause += ' AND exams.year = ?';
        params.push(year);
      }

      if (keyword) {
        whereClause += ' AND exams.title LIKE ?';
        params.push(`%${keyword}%`);
      }

      const countSql = `SELECT COUNT(*) as total FROM exams ${whereClause}`;
      const countResult = await db.query(countSql, params);
      const total = countResult[0].total;

      const limit = pageSizeNum;
      const dataSql = `
        SELECT exams.*,
          cities.name as city_name,
          grades.name as grade_name,
          subjects.name as subject_name,
          tags.name as tag_name
        FROM exams
        LEFT JOIN cities ON exams.city_id = cities.id
        LEFT JOIN grades ON exams.grade_id = grades.id
        LEFT JOIN subjects ON exams.subject_id = subjects.id
        LEFT JOIN tags ON exams.tag_id = tags.id
        ${whereClause}
        ORDER BY ${orderBy} ${order}
        LIMIT ${limit} OFFSET ${offset}
      `;
      const data = await db.query(dataSql, params);

      res.json({
        code: 200,
        message: '获取成功',
        data: {
          list: data,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total,
            totalPages: Math.ceil(total / pageSizeNum)
          }
        }
      });
    } catch (error) {
      console.error('获取试卷列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取列表失败',
        error: error.message
      });
    }
  }

  /**
   * 创建试卷（带文件上传）
   */
  async create(req, res) {
    try {
      const data = req.body;

      // 处理文件上传（如果有）
      if (req.file) {
        data.file_url = `/downloads/${req.file.filename}`;
        data.file_size = req.file.size;
      }

      delete data.id;
      delete data.created_at;
      delete data.updated_at;

      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const sql = `INSERT INTO exams (${fields}) VALUES (${placeholders})`;
      const result = await db.query(sql, values);

      const newRecord = await db.query(`SELECT * FROM exams WHERE id = ?`, [result.insertId]);

      res.json({
        code: 200,
        message: '创建成功',
        data: newRecord[0]
      });
    } catch (error) {
      console.error('创建试卷失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建失败',
        error: error.message
      });
    }
  }

  /**
   * 删除试卷（同时删除文件）
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      // 查询试卷信息
      const exam = await db.query(`SELECT * FROM exams WHERE id = ?`, [id]);

      if (exam.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '试卷不存在'
        });
      }

      // 删除数据库记录
      const sql = `DELETE FROM exams WHERE id = ?`;
      await db.query(sql, [id]);

      // 删除文件
      const filePath = path.join(__dirname, '../../../downloads', path.basename(exam[0].file_url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除试卷失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除失败',
        error: error.message
      });
    }
  }
}

module.exports = new ExamController();
