/**
 * 年级管理控制器
 */
const AdminBaseController = require('../adminBase.controller');
const db = require('../../utils/db');

class GradeController extends AdminBaseController {
  constructor() {
    super('grades');
  }

  /**
   * 获取年级列表（带搜索和层级筛选）
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        level,
        keyword,
        orderBy = 'sort_order',
        order = 'ASC'
      } = req.body;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (status !== undefined && status !== '') {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      if (level !== undefined && level !== '') {
        whereClause += ' AND level = ?';
        params.push(level);
      }

      if (keyword) {
        whereClause += ' AND name LIKE ?';
        params.push(`%${keyword}%`);
      }

      const countSql = `SELECT COUNT(*) as total FROM grades ${whereClause}`;
      const countResult = await db.query(countSql, params);
      const total = countResult[0].total;

      const limit = pageSizeNum;
      const dataSql = `
        SELECT * FROM grades
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
      console.error('获取年级列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取列表失败',
        error: error.message
      });
    }
  }
}

module.exports = new GradeController();
