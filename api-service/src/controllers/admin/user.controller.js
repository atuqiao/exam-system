/**
 * 用户管理控制器
 */
const AdminBaseController = require('../adminBase.controller');
const db = require('../../utils/db');

class UserController extends AdminBaseController {
  constructor() {
    super('users');
  }

  /**
   * 获取用户列表（带筛选）
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        keyword,
        orderBy = 'users.id',
        order = 'DESC'
      } = req.body;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (status !== undefined && status !== '') {
        whereClause += ' AND users.status = ?';
        params.push(status);
      }

      if (keyword) {
        whereClause += ' AND (users.nickname LIKE ? OR users.openid LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
      const countResult = await db.query(countSql, params);
      const total = countResult[0].total;

      const limit = pageSizeNum;
      const dataSql = `
        SELECT users.*,
          (SELECT COUNT(*) FROM user_subjects WHERE user_id = users.id AND status = 1) as subject_count,
          (SELECT COUNT(*) FROM download_logs WHERE user_id = users.id) as download_count
        FROM users
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
      console.error('获取用户列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取列表失败',
        error: error.message
      });
    }
  }

  /**
   * 更新用户积分
   */
  async updatePoints(req, res) {
    try {
      const { id } = req.params;
      const { points, type = 4, description } = req.body;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      if (points === undefined || points === null) {
        return res.status(400).json({
          code: 400,
          message: '积分数值不能为空'
        });
      }

      // 查询用户当前积分
      const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }

      const user = users[0];
      const beforePoints = user.points;
      const afterPoints = beforePoints + parseInt(points);

      // 更新用户积分
      await db.query('UPDATE users SET points = ? WHERE id = ?', [afterPoints, id]);

      // 记录积分变动
      await db.query(
        'INSERT INTO point_logs (user_id, type, points, before_points, after_points, description) VALUES (?, ?, ?, ?, ?, ?)',
        [id, type, points, beforePoints, afterPoints, description || '后台管理员调整积分']
      );

      res.json({
        code: 200,
        message: '积分更新成功',
        data: {
          beforePoints,
          afterPoints,
          change: points
        }
      });
    } catch (error) {
      console.error('更新用户积分失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新失败',
        error: error.message
      });
    }
  }

  /**
   * 禁用/启用用户
   */
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }

      const newStatus = users[0].status === 1 ? 0 : 1;
      await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

      res.json({
        code: 200,
        message: newStatus === 1 ? '用户已启用' : '用户已禁用',
        data: {
          id,
          status: newStatus
        }
      });
    } catch (error) {
      console.error('切换用户状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '操作失败',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
