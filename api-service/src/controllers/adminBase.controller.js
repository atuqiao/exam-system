/**
 * 管理员基础控制器 - 提供 CRUD 操作
 */
const db = require('../utils/db');

class AdminBaseController {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * 获取列表
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        keyword,
        orderBy = 'id',
        order = 'DESC'
      } = req.body;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;

      // 构建查询条件
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (status !== undefined && status !== '') {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      // 如果表格有 name 字段，支持关键词搜索
      if (keyword) {
        whereClause += ' AND name LIKE ?';
        params.push(`%${keyword}%`);
      }

      // 查询总数
      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      const countResult = await db.query(countSql, params);
      const total = countResult[0].total;

      // 查询数据
      const limit = pageSizeNum;
      const dataSql = `
        SELECT * FROM ${this.tableName}
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
      console.error(`获取${this.tableName}列表失败:`, error);
      res.status(500).json({
        code: 500,
        message: '获取列表失败',
        error: error.message
      });
    }
  }

  /**
   * 获取详情
   */
  async detail(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const result = await db.query(sql, [id]);

      if (result.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '记录不存在'
        });
      }

      res.json({
        code: 200,
        message: '获取成功',
        data: result[0]
      });
    } catch (error) {
      console.error(`获取${this.tableName}详情失败:`, error);
      res.status(500).json({
        code: 500,
        message: '获取详情失败',
        error: error.message
      });
    }
  }

  /**
   * 创建
   */
  async create(req, res) {
    try {
      const data = req.body;

      // 移除 id 和时间戳字段
      delete data.id;
      delete data.created_at;
      delete data.updated_at;

      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const sql = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
      const result = await db.query(sql, values);

      // 查询创建的记录
      const newRecord = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [result.insertId]);

      res.json({
        code: 200,
        message: '创建成功',
        data: newRecord[0]
      });
    } catch (error) {
      console.error(`创建${this.tableName}失败:`, error);
      res.status(500).json({
        code: 500,
        message: '创建失败',
        error: error.message
      });
    }
  }

  /**
   * 更新
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      // 移除 id 和时间戳字段
      delete data.id;
      delete data.created_at;
      delete data.updated_at;

      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      await db.query(sql, values);

      // 查询更新后的记录
      const updatedRecord = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);

      if (updatedRecord.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '记录不存在'
        });
      }

      res.json({
        code: 200,
        message: '更新成功',
        data: updatedRecord[0]
      });
    } catch (error) {
      console.error(`更新${this.tableName}失败:`, error);
      res.status(500).json({
        code: 500,
        message: '更新失败',
        error: error.message
      });
    }
  }

  /**
   * 删除
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

      // 检查记录是否存在
      const existing = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '记录不存在'
        });
      }

      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      await db.query(sql, [id]);

      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error(`删除${this.tableName}失败:`, error);
      res.status(500).json({
        code: 500,
        message: '删除失败',
        error: error.message
      });
    }
  }

  /**
   * 批量删除
   */
  async batchDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请选择要删除的记录'
        });
      }

      const placeholders = ids.map(() => '?').join(', ');
      const sql = `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`;
      await db.query(sql, ids);

      res.json({
        code: 200,
        message: `成功删除 ${ids.length} 条记录`
      });
    } catch (error) {
      console.error(`批量删除${this.tableName}失败:`, error);
      res.status(500).json({
        code: 500,
        message: '批量删除失败',
        error: error.message
      });
    }
  }
}

module.exports = AdminBaseController;
