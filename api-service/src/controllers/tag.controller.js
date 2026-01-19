const db = require('../utils/db');

// 根据城市获取标签
exports.getByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { type, keyword } = req.query; // type: 'region' 或 'exam' 或不传（全部）; keyword: 按别名搜索

    let sql = 'SELECT id, city_id, name, alias, sort_order FROM tags WHERE city_id = ? AND status = 1';
    const params = [cityId];

    // 根据type过滤标签
    if (type === 'region') {
      // 只显示区域标签（排除"模拟"、"真题"）
      sql += " AND name NOT IN ('模拟', '真题')";
    } else if (type === 'exam') {
      // 只显示试卷类型标签（只显示"模拟"、"真题"）
      sql += " AND name IN ('模拟', '真题')";
    }

    // 按别名或名称搜索
    if (keyword) {
      sql += ' AND (name LIKE ? OR alias LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword);
    }

    sql += ' ORDER BY id DESC';  // 按ID倒序排列，最新的标签在前面

    const tags = await db.query(sql, params);

    res.json({
      code: 200,
      data: tags
    });
  } catch (error) {
    console.error('获取标签列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取标签列表失败'
    });
  }
};

// 获取所有标签
exports.getAll = async (req, res) => {
  try {
    const tags = await db.query(
      'SELECT id, city_id, name, alias, sort_order FROM tags WHERE status = 1 ORDER BY city_id, sort_order ASC'
    );

    res.json({
      code: 200,
      data: tags
    });
  } catch (error) {
    console.error('获取所有标签错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取所有标签失败'
    });
  }
};
