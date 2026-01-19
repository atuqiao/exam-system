const db = require('../utils/db');

// 开通科目
exports.open = async (req, res) => {
  try {
    const userId = req.userId;
    const { cityId, gradeId, subjectId } = req.body;

    if (!cityId || !gradeId || !subjectId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    // 检查是否已开通
    const existing = await db.query(
      'SELECT * FROM user_subjects WHERE user_id = ? AND city_id = ? AND grade_id = ? AND subject_id = ? AND status = 1',
      [userId, cityId, gradeId, subjectId]
    );

    if (existing.length > 0) {
      return res.json({
        code: 200,
        message: '科目已开通'
      });
    }

    // 获取用户积分
    const users = await db.query('SELECT points FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    const pointsCost = 50; // 开通所需积分
    const userPoints = users[0].points;

    if (userPoints < pointsCost) {
      return res.status(400).json({
        code: 400,
        message: '积分不足'
      });
    }

    // 使用事务开通科目
    await db.transaction(async (connection) => {
      // 扣除积分
      await connection.execute(
        'UPDATE users SET points = points - ? WHERE id = ?',
        [pointsCost, userId]
      );

      // 记录积分日志
      await connection.execute(
        'INSERT INTO point_logs (user_id, type, points, before_points, after_points, description) VALUES (?, 3, ?, ?, ?, ?)',
        [userId, -pointsCost, userPoints, userPoints - pointsCost, '开通科目扣除']
      );

      // 添加开通记录
      await connection.execute(
        'INSERT INTO user_subjects (user_id, city_id, grade_id, subject_id, points_cost, status) VALUES (?, ?, ?, ?, ?, 1)',
        [userId, cityId, gradeId, subjectId, pointsCost]
      );
    });

    res.json({
      code: 200,
      message: '开通成功'
    });
  } catch (error) {
    console.error('开通科目错误:', error);
    res.status(500).json({
      code: 500,
      message: '开通失败'
    });
  }
};

// 获取已开通科目
exports.getOpened = async (req, res) => {
  try {
    const userId = req.userId;

    const list = await db.query(
      `SELECT
        us.id,
        us.city_id,
        us.grade_id,
        us.subject_id,
        us.created_at AS open_time,
        c.name AS city_name,
        g.name AS grade_name,
        s.name AS subject_name
      FROM user_subjects us
      LEFT JOIN cities c ON us.city_id = c.id
      LEFT JOIN grades g ON us.grade_id = g.id
      LEFT JOIN subjects s ON us.subject_id = s.id
      WHERE us.user_id = ? AND us.status = 1
      ORDER BY us.created_at DESC`,
      [userId]
    );

    res.json({
      code: 200,
      data: list
    });
  } catch (error) {
    console.error('获取已开通科目错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取已开通科目失败'
    });
  }
};

// 检查科目是否已开通
exports.check = async (req, res) => {
  try {
    const userId = req.userId;
    const { cityId, gradeId, subjectId } = req.query;

    if (!cityId || !gradeId || !subjectId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    const result = await db.query(
      'SELECT * FROM user_subjects WHERE user_id = ? AND city_id = ? AND grade_id = ? AND subject_id = ? AND status = 1',
      [userId, cityId, gradeId, subjectId]
    );

    res.json({
      code: 200,
      data: {
        opened: result.length > 0
      }
    });
  } catch (error) {
    console.error('检查科目状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '检查失败'
    });
  }
};
