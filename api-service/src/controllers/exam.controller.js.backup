const db = require('../utils/db');
const appConfig = require('../config/app');

// 获取试卷列表
exports.getList = async (req, res) => {
  try {
    const { cityId, gradeId, subjectId, tagId, examTypeId, examType, page = 1, limit = 20, featured, startYear } = req.query;

    console.log('[exam.list] 请求参数:', { cityId, gradeId, subjectId, tagId, examTypeId, examType, page, limit, featured, startYear });

    // 构建 WHERE 条件和参数
    const conditions = ['e.status = 1'];
    const params = [];

    if (cityId) {
      conditions.push('e.city_id = ?');
      const cityIdNum = parseInt(cityId);
      if (isNaN(cityIdNum)) {
        return res.status(400).json({ code: 400, message: 'cityId 参数无效' });
      }
      params.push(cityIdNum);
    }
    if (gradeId) {
      conditions.push('e.grade_id = ?');
      const gradeIdNum = parseInt(gradeId);
      if (isNaN(gradeIdNum)) {
        return res.status(400).json({ code: 400, message: 'gradeId 参数无效' });
      }
      params.push(gradeIdNum);
    }
    if (subjectId) {
      conditions.push('e.subject_id = ?');
      const subjectIdNum = parseInt(subjectId);
      if (isNaN(subjectIdNum)) {
        return res.status(400).json({ code: 400, message: 'subjectId 参数无效' });
      }
      params.push(subjectIdNum);
    }
    // tagId 用于区域标签过滤（支持按别名查询所有相同别名的试卷）
    if (tagId) {
      const tagIdNum = parseInt(tagId);
      if (isNaN(tagIdNum)) {
        return res.status(400).json({ code: 400, message: 'tagId 参数无效' });
      }

      // 查询该标签的别名
      const tagResult = await db.query('SELECT alias FROM tags WHERE id = ?', [tagIdNum]);
      if (tagResult.length > 0) {
        const tagAlias = tagResult[0].alias;
        // 使用别名查询：查找所有具有相同别名的标签
        conditions.push('(e.tag_id IN (SELECT id FROM tags WHERE alias = ?) OR e.tag_id = ?)');
        params.push(tagAlias, tagIdNum);
      } else {
        // 如果找不到标签，按原ID查询
        conditions.push('e.tag_id = ?');
        params.push(tagIdNum);
      }
    }
    // examTypeId 用于试卷类型标签过滤（模拟/真题）
    if (examTypeId) {
      conditions.push('e.exam_type_id = ?');
      const examTypeIdNum = parseInt(examTypeId);
      if (isNaN(examTypeIdNum)) {
        return res.status(400).json({ code: 400, message: 'examTypeId 参数无效' });
      }
      params.push(examTypeIdNum);
    }
    if (featured) {
      conditions.push('e.featured = 1');
    }
    // 年份筛选：只显示大于等于起始年份的试卷
    if (startYear) {
      conditions.push('e.year >= ?');
      const startYearNum = parseInt(startYear);
      if (isNaN(startYearNum)) {
        return res.status(400).json({ code: 400, message: 'startYear 参数无效' });
      }
      params.push(startYearNum);
    }
    if (examType) {
      const examTypeNum = parseInt(examType);
      if (isNaN(examTypeNum) || examTypeNum < 1 || examTypeNum > 2) {
        return res.status(400).json({ code: 400, message: 'examType 参数无效（1=中考，2=高考）' });
      }
      // examType: 1=中考 (grades 7,8,9,13), 2=高考 (grades 10,11,12,14)
      if (examTypeNum === 1) {
        conditions.push('e.grade_id IN (7, 8, 9, 13)');
      } else if (examTypeNum === 2) {
        conditions.push('e.grade_id IN (10, 11, 12, 14)');
      }
    }

    const whereClause = conditions.join(' AND ');
    console.log('[exam.list] WHERE:', whereClause);
    console.log('[exam.list] params:', params);

    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM exams e WHERE ' + whereClause;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;
    console.log('[exam.list] 总数:', total);

    // 获取列表
    const limitNum = parseInt(limit) || 20;
    const pageNum = parseInt(page) || 1;
    const offsetNum = (pageNum - 1) * limitNum;

    console.log('[exam.list] 分页:', { limitNum, pageNum, offsetNum });

    // 基础SELECT字段
    const selectFields = 'e.id, e.title, e.year, e.semester, e.file_type, e.file_url, e.download_count, e.featured, e.answer_url, e.city_id, e.grade_id, e.subject_id, c.name AS city_name, g.name AS grade_name, s.name AS subject_name, t.name AS tag_name, t.alias AS tag_alias, t.id AS tag_id, et.name AS exam_type_name, et.id AS exam_type_tag_id';
    const fromClause = 'FROM exams e LEFT JOIN cities c ON e.city_id = c.id LEFT JOIN grades g ON e.grade_id = g.id LEFT JOIN subjects s ON e.subject_id = s.id LEFT JOIN tags t ON e.tag_id = t.id LEFT JOIN tags et ON e.exam_type_id = et.id';
    const orderClause = 'ORDER BY e.featured DESC, e.download_count DESC, e.id DESC';

    // 由于 MySQL 某些版本的 prepared statement 对 LIMIT/OFFSET 参数支持有问题
    // 我们将 LIMIT/OFFSET 值直接拼接到 SQL 中(已经验证是整数,安全)
    let listSql;
    let finalParams;

    if (offsetNum > 0) {
      listSql = 'SELECT ' + selectFields + ' ' + fromClause + ' WHERE ' + whereClause + ' ' + orderClause + ' LIMIT ' + limitNum + ' OFFSET ' + offsetNum;
      finalParams = params;
    } else {
      listSql = 'SELECT ' + selectFields + ' ' + fromClause + ' WHERE ' + whereClause + ' ' + orderClause + ' LIMIT ' + limitNum;
      finalParams = params;
    }

    console.log('[exam.list] 最终参数:', finalParams);
    console.log('[exam.list] SQL:', listSql.replace(/\s+/g, ' '));
    const list = await db.query(listSql, finalParams);
    console.log('[exam.list] 查询结果:', list.length, '条');

    // 转换localhost URL为生产环境URL
    list.forEach(exam => {
      if (exam.file_url) {
        exam.file_url = appConfig.getDownloadUrl(exam.file_url);
      }
      if (exam.answer_url) {
        exam.answer_url = appConfig.getDownloadUrl(exam.answer_url);
      }
    });

    res.json({
      code: 200,
      data: {
        list,
        total,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('获取试卷列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取试卷列表失败'
    });
  }
};

// 获取试卷详情
exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const exams = await db.query(
      `SELECT
        e.*,
        c.name AS city_name,
        g.name AS grade_name,
        s.name AS subject_name,
        t.name AS tag_name,
        t.alias AS tag_alias
      FROM exams e
      LEFT JOIN cities c ON e.city_id = c.id
      LEFT JOIN grades g ON e.grade_id = g.id
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN tags t ON e.tag_id = t.id
      WHERE e.id = ?`,
      [id]
    );

    if (exams.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '试卷不存在'
      });
    }

    // 转换localhost URL为生产环境URL
    const exam = exams[0];
    if (exam.file_url) {
      exam.file_url = appConfig.getDownloadUrl(exam.file_url);
    }
    if (exam.answer_url) {
      exam.answer_url = appConfig.getDownloadUrl(exam.answer_url);
    }

    res.json({
      code: 200,
      data: exam
    });
  } catch (error) {
    console.error('获取试卷详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取试卷详情失败'
    });
  }
};

// 下载试卷
exports.download = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { type = 'original' } = req.query; // type: original(原卷) 或 answer(解析)

    // 获取试卷信息
    const exams = await db.query('SELECT * FROM exams WHERE id = ?', [id]);
    if (exams.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '试卷不存在'
      });
    }

    const exam = exams[0];

    // 检查是否已开通科目
    const opened = await db.query(
      'SELECT * FROM user_subjects WHERE user_id = ? AND city_id = ? AND grade_id = ? AND subject_id = ? AND status = 1',
      [userId, exam.city_id, exam.grade_id, exam.subject_id]
    );

    if (opened.length === 0) {
      return res.status(403).json({
        code: 403,
        message: '请先开通该科目'
      });
    }

    // 根据下载类型选择文件
    let downloadUrl = exam.file_url;
    let downloadType = '原卷';

    if (type === 'answer') {
      if (!exam.answer_url) {
        return res.status(404).json({
          code: 404,
          message: '该试卷暂无解析版'
        });
      }
      downloadUrl = exam.answer_url;
      downloadType = '解析';
    }

    // 转换localhost URL为生产环境URL（小程序无法访问localhost）
    downloadUrl = appConfig.getDownloadUrl(downloadUrl);

    // 记录下载日志
    await db.query(
      `INSERT INTO download_logs (user_id, exam_id, city_id, grade_id, subject_id, exam_title, city_name, grade_name, subject_name)
      SELECT ?, ?, e.city_id, e.grade_id, e.subject_id, e.title, c.name, g.name, s.name
      FROM exams e
      LEFT JOIN cities c ON e.city_id = c.id
      LEFT JOIN grades g ON e.grade_id = g.id
      LEFT JOIN subjects s ON e.subject_id = s.id
      WHERE e.id = ?`,
      [userId, id, id]
    );

    // 更新下载次数
    await db.query('UPDATE exams SET download_count = download_count + 1 WHERE id = ?', [id]);

    res.json({
      code: 200,
      message: '下载成功',
      data: {
        downloadUrl: downloadUrl,
        downloadType: downloadType,
        hasAnswer: !!exam.answer_url
      }
    });
  } catch (error) {
    console.error('下载试卷错误:', error);
    res.status(500).json({
      code: 500,
      message: '下载失败'
    });
  }
};

// 获取下载记录
exports.getDownloads = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    console.log('[downloads] userId:', userId, 'page:', pageNum, 'limit:', limitNum);

    // 获取总数
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM download_logs WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;
    console.log('[downloads] 总数:', total);

    // 获取列表 - 修复 LIMIT/OFFSET 参数绑定问题
    const listSql = `SELECT
      dl.id,
      dl.exam_id,
      dl.exam_title,
      dl.city_name,
      dl.grade_name,
      dl.subject_name,
      dl.download_time,
      DATE_FORMAT(dl.download_time, '%Y-%m-%d %H:%i') as download_time_text,
      e.year,
      e.semester
    FROM download_logs dl
    LEFT JOIN exams e ON dl.exam_id = e.id
    WHERE dl.user_id = ?
    ORDER BY dl.download_time DESC
    LIMIT ${limitNum} OFFSET ${offset}`;

    console.log('[downloads] SQL:', listSql.replace(/\s+/g, ' '));
    const list = await db.query(listSql, [userId]);
    console.log('[downloads] 查询结果:', list.length, '条');

    res.json({
      code: 200,
      data: {
        list,
        total,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('获取下载记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取下载记录失败'
    });
  }
};

// 搜索试卷
exports.search = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        code: 400,
        message: '请输入搜索关键词'
      });
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    const likeKeyword = `%${keyword}%`;

    console.log('[search] keyword:', keyword, 'page:', pageNum, 'limit:', limitNum);

    // 获取总数
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM exams WHERE title LIKE ? AND status = 1',
      [likeKeyword]
    );
    const total = countResult[0].total;
    console.log('[search] 总数:', total);

    // 获取列表 - 修复 LIMIT/OFFSET 参数绑定问题
    const listSql = `SELECT
      e.id,
      e.title,
      e.year,
      e.semester,
      e.download_count,
      c.name AS city_name,
      g.name AS grade_name,
      s.name AS subject_name
    FROM exams e
    LEFT JOIN cities c ON e.city_id = c.id
    LEFT JOIN grades g ON e.grade_id = g.id
    LEFT JOIN subjects s ON e.subject_id = s.id
    WHERE e.title LIKE ? AND e.status = 1
    ORDER BY e.download_count DESC
    LIMIT ${limitNum} OFFSET ${offset}`;

    console.log('[search] SQL:', listSql.replace(/\s+/g, ' '));
    const list = await db.query(listSql, [likeKeyword]);
    console.log('[search] 查询结果:', list.length, '条');

    res.json({
      code: 200,
      data: {
        list,
        total,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('搜索试卷错误:', error);
    res.status(500).json({
      code: 500,
      message: '搜索失败'
    });
  }
};
