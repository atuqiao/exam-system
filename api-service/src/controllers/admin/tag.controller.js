/**
 * 标签管理控制器
 */
const AdminBaseController = require('../adminBase.controller');
const db = require('../../utils/db');

class TagController extends AdminBaseController {
  constructor() {
    super('tags');
  }

  /**
   * 获取标签列表（带城市名称）
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        cityId,
        keyword,
        orderBy = 'tags.sort_order',
        order = 'ASC'
      } = req.body;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (status !== undefined && status !== '') {
        whereClause += ' AND tags.status = ?';
        params.push(status);
      }

      if (cityId !== undefined && cityId !== '') {
        whereClause += ' AND tags.city_id = ?';
        params.push(cityId);
      }

      if (keyword) {
        whereClause += ' AND tags.name LIKE ?';
        params.push(`%${keyword}%`);
      }

      const countSql = `SELECT COUNT(*) as total FROM tags ${whereClause}`;
      const countResult = await db.query(countSql, params);
      const total = countResult[0].total;

      const limit = pageSizeNum;
      const dataSql = `
        SELECT tags.*, cities.name as city_name
        FROM tags
        LEFT JOIN cities ON tags.city_id = cities.id
        ${whereClause}
        ORDER BY ${orderBy} ${order}
        LIMIT ${limit} OFFSET ${offset}
      `;
      const data = await db.query(dataSql, params);

      // 确保每个标签都有alias字段
      data.forEach(tag => {
        if (!tag.alias) {
          tag.alias = '';
        }
      });

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
      console.error('获取标签列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取列表失败',
        error: error.message
      });
    }
  }
}

module.exports = new TagController();
