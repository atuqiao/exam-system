/**
 * 试卷批量导入控制器
 */
const fs = require('fs');
const path = require('path');
const db = require('../../utils/db');

// 文件名解析正则 - 支持多种格式
const EXAM_PATTERN = /精品解析：?(\d{4})年?(.+?)(市|区)?([初高]中|[一二三四五六七八九]年级|中考|高考)(.+?)(试题|试卷)/;

// 映射配置
const CITY_MAP = {
  '北京': 1, '北京市': 1,
  '上海': 2, '上海市': 2,
  '广州': 3, '广州市': 3,
  '深圳': 4, '深圳市': 4,
  '杭州': 5, '杭州市': 5
};

const GRADE_MAP = {
  '一年级': 1, '二年级': 2, '三年级': 3, '四年级': 4, '五年级': 5, '六年级': 6,
  '七年级': 7, '八年级': 8, '九年级': 9,
  '初一': 7, '初二': 8, '初三': 9,
  '高一': 10, '高二': 11, '高三': 12,
  '中考': 9,  // 中考对应九年级
  '高考': 12  // 高考对应高三
};

const SUBJECT_MAP = {
  '语文': 1, '数学': 2, '英语': 3, '物理': 4, '化学': 5,
  '生物': 6, '历史': 7, '地理': 8, '政治': 9, '科学': 10
};

/**
 * 解析文件名，返回基本信息
 */
function parseFilename(filename) {
  const nameWithoutExt = path.basename(filename, path.extname(filename));

  // 尝试匹配格式: {city_id}_{grade_id}_{subject_id}_{timestamp}.pdf
  const idPattern = /^(\d+)_(\d+)_(\d+)_(\d+)\.\w+$/;
  const idMatch = filename.match(idPattern);

  if (idMatch) {
    return {
      city_id: parseInt(idMatch[1]),
      grade_id: parseInt(idMatch[2]),
      subject_id: parseInt(idMatch[3]),
      year: new Date(parseInt(idMatch[4]) * 1000).getFullYear(),
      semester: '上学期',
      title: nameWithoutExt,
      file_type: path.extname(filename).toUpperCase().replace('.', ''),
      parseType: 'id'
    };
  }

  // 尝试解析中文文件名（支持原卷版和解析版）
  let cnMatch = nameWithoutExt.match(EXAM_PATTERN);

  // 如果没有匹配，尝试不带"精品解析："前缀的模式
  if (!cnMatch) {
    const simplePattern = /(\d{4})年?(.+?)(市|区)?([初高]中|[一二三四五六七八九]年级|中考|高考)(.+?)(试题|试卷)/;
    cnMatch = nameWithoutExt.match(simplePattern);
  }

  if (cnMatch) {
    const cityPart = cnMatch[2] || '';
    const citySuffix = cnMatch[3] || '';
    const cityName = cityPart + citySuffix;  // 组合完整城市名，如 "上海市浦东新区"
    const year = parseInt(cnMatch[1]) || new Date().getFullYear();
    const gradeName = cnMatch[4];

    // 从文件名中提取科目（使用单独的正则）
    const subjectMatch = nameWithoutExt.match(/(语文|数学|英语|物理|化学|生物|历史|地理|政治|科学)/);
    const subjectName = subjectMatch ? subjectMatch[1] : null;

    // 提取主城市名（不含区）
    const mainCityName = Object.keys(CITY_MAP).find(key => cityName.includes(key)) || cityName.split('市')[0] + '市';

    const cityId = CITY_MAP[mainCityName] || CITY_MAP[mainCityName.replace('市', '')] || 1;
    const gradeId = GRADE_MAP[gradeName] || 9;
    const subjectId = subjectName ? SUBJECT_MAP[subjectName] : 2;

    // 判断是原卷版还是解析版
    const isAnswer = nameWithoutExt.includes('（解析版）') || nameWithoutExt.includes('(解析版)');

    // 提取基础标题（去除版本标识）
    const baseTitle = nameWithoutExt
      .replace('精品解析：', '')
      .replace('（原卷版）', '')
      .replace('(原卷版)', '')
      .replace('（解析版）', '')
      .replace('(解析版)', '')
      .replace('（原卷版）', '')
      .replace('(原卷版)', '');

    // 提取学期信息
    let semester = '上学期';
    if (baseTitle.includes('下') || baseTitle.includes('期末')) {
      semester = '下学期';
    }

    return {
      city_id: cityId,
      grade_id: gradeId,
      subject_id: subjectId,
      year: year,
      semester: semester,
      title: baseTitle,
      file_type: path.extname(filename).toUpperCase().replace('.', '') || 'PDF',
      is_answer: isAnswer,
      parseType: 'name'
    };
  }

  return null;
}

/**
 * 获取或创建标签
 */
async function getOrCreateTag(cityId, tagName) {
  try {
    const existing = await db.query(
      'SELECT * FROM tags WHERE city_id = ? AND name = ?',
      [cityId, tagName]
    );

    if (existing.length > 0) {
      return existing[0].id;
    }

    const result = await db.query(
      'INSERT INTO tags (city_id, name, sort_order, status) VALUES (?, ?, 0, 1)',
      [cityId, tagName]
    );

    return result.insertId;
  } catch (error) {
    console.error('获取或创建标签失败:', error);
    return null;
  }
}

/**
 * 批量导入试卷（支持原卷版和解析版配对）
 */
async function importExams(sourceDir, targetDir) {
  const results = {
    total: 0,
    success: 0,
    paired: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  try {
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`源目录不存在: ${sourceDir}`);
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir).filter(f =>
      f.toLowerCase().endsWith('.pdf') ||
      f.toLowerCase().endsWith('.doc') ||
      f.toLowerCase().endsWith('.docx')
    );

    results.total = files.length;

    if (files.length === 0) {
      results.errors.push('源目录中没有找到试卷文件');
      return results;
    }

    // 解析所有文件，按基础标题分组
    const examGroups = {};

    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const stats = fs.statSync(sourcePath);

      if (!stats.isFile()) continue;

      const parsed = parseFilename(file);

      if (!parsed) {
        results.failed++;
        results.errors.push(`${file}: 无法解析文件名`);
        continue;
      }

      // 使用基础标题作为分组键
      const groupKey = `${parsed.city_id}_${parsed.grade_id}_${parsed.subject_id}_${parsed.year}_${parsed.title}`;

      if (!examGroups[groupKey]) {
        examGroups[groupKey] = {
          parsed: parsed,
          originalFile: null,
          answerFile: null
        };
      }

      // 分类存储原卷版和解析版
      if (parsed.is_answer) {
        examGroups[groupKey].answerFile = {
          filename: file,
          path: sourcePath,
          size: stats.size
        };
      } else {
        examGroups[groupKey].originalFile = {
          filename: file,
          path: sourcePath,
          size: stats.size
        };
      }
    }

    // 处理每个分组
    for (const groupKey in examGroups) {
      try {
        const group = examGroups[groupKey];
        const parsed = group.parsed;

        // 检查是否已存在
        const existing = await db.query(
          'SELECT id FROM exams WHERE city_id = ? AND grade_id = ? AND subject_id = ? AND year = ? AND title = ?',
          [parsed.city_id, parsed.grade_id, parsed.subject_id, parsed.year, parsed.title]
        );

        if (existing.length > 0) {
          // 如果已存在，尝试补充解析文件
          if (group.answerFile && !existing[0].answer_url) {
            const timestamp = Date.now();
            const answerFilename = `${parsed.city_id}_${parsed.grade_id}_${parsed.subject_id}_${timestamp}_answer.pdf`;
            const answerTargetPath = path.join(targetDir, answerFilename);

            fs.copyFileSync(group.answerFile.path, answerTargetPath);

            await db.query(
              'UPDATE exams SET answer_url = ? WHERE id = ?',
              [`/downloads/${answerFilename}`, existing[0].id]
            );

            results.paired++;
            console.log(`✅ 成功补充解析文件: ${group.answerFile.filename}`);
          } else {
            results.skipped++;
            results.errors.push(`${parsed.title}: 试卷已存在`);
          }
          continue;
        }

        // 必须有原卷版文件
        if (!group.originalFile) {
          results.failed++;
          results.errors.push(`${parsed.title}: 缺少原卷版文件`);
          continue;
        }

        const timestamp = Date.now();
        const newFilename = `${parsed.city_id}_${parsed.grade_id}_${parsed.subject_id}_${timestamp}.pdf`;
        const targetPath = path.join(targetDir, newFilename);

        // 复制原卷版文件
        fs.copyFileSync(group.originalFile.path, targetPath);

        // 提取区域标签
        const tagMatch = group.originalFile.filename.match(/(东城区|西城区|朝阳区|海淀区|丰台区|石景山区)/);
        let tagId = null;
        if (tagMatch) {
          tagId = await getOrCreateTag(parsed.city_id, tagMatch[1]);
        }

        // 如果有解析版文件，也复制并重命名
        let answerUrl = null;
        if (group.answerFile) {
          const answerFilename = `${parsed.city_id}_${parsed.grade_id}_${parsed.subject_id}_${timestamp}_answer.pdf`;
          const answerTargetPath = path.join(targetDir, answerFilename);

          fs.copyFileSync(group.answerFile.path, answerTargetPath);
          answerUrl = `/downloads/${answerFilename}`;
          results.paired++;
        }

        // 插入数据库
        await db.query(
          `INSERT INTO exams (
            city_id, grade_id, subject_id, tag_id, title, year, semester,
            file_type, file_url, answer_url, file_size, points_cost, featured, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`,
          [
            parsed.city_id,
            parsed.grade_id,
            parsed.subject_id,
            tagId,
            parsed.title,
            parsed.year,
            parsed.semester,
            parsed.file_type,
            `/downloads/${newFilename}`,
            answerUrl,
            group.originalFile.size,
            50
          ]
        );

        results.success++;
        console.log(`✅ 成功导入: ${group.originalFile.filename}${group.answerFile ? ' + ' + group.answerFile.filename : ''}`);

      } catch (error) {
        results.failed++;
        results.errors.push(`${examGroups[groupKey].parsed.title}: ${error.message}`);
        console.error(`❌ 导入失败:`, error);
      }
    }

  } catch (error) {
    console.error('批量导入失败:', error);
    results.errors.push(`批量导入失败: ${error.message}`);
  }

  return results;
}

/**
 * 批量导入接口
 */
async function batchImport(req, res) {
  try {
    const { sourceDir } = req.body;

    if (!sourceDir) {
      return res.status(400).json({
        code: 400,
        message: '请指定源目录路径'
      });
    }

    const targetDir = path.join(__dirname, '../../../downloads');

    console.log(`开始批量导入试卷...`);
    console.log(`源目录: ${sourceDir}`);
    console.log(`目标目录: ${targetDir}`);

    const results = await importExams(sourceDir, targetDir);

    res.json({
      code: 200,
      message: '批量导入完成',
      data: results
    });

  } catch (error) {
    console.error('批量导入失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量导入失败',
      error: error.message
    });
  }
}

/**
 * 分析目录中的文件
 */
async function analyzeDirectory(req, res) {
  try {
    const { sourceDir } = req.body;

    if (!sourceDir) {
      return res.status(400).json({
        code: 400,
        message: '请指定源目录路径'
      });
    }

    if (!fs.existsSync(sourceDir)) {
      return res.status(404).json({
        code: 404,
        message: `源目录不存在: ${sourceDir}`
      });
    }

    const files = fs.readdirSync(sourceDir).filter(f =>
      f.toLowerCase().endsWith('.pdf') ||
      f.toLowerCase().endsWith('.doc') ||
      f.toLowerCase().endsWith('.docx')
    );

    const analysis = {
      total: files.length,
      groups: []
    };

    const examGroups = {};

    for (const file of files) {
      const filePath = path.join(sourceDir, file);
      const stats = fs.statSync(filePath);

      if (!stats.isFile()) continue;

      const parsed = parseFilename(file);

      if (parsed) {
        const groupKey = `${parsed.city_id}_${parsed.grade_id}_${parsed.subject_id}_${parsed.year}_${parsed.title}`;

        if (!examGroups[groupKey]) {
          examGroups[groupKey] = {
            parsed: parsed,
            files: []
          };
        }

        examGroups[groupKey].files.push({
          filename: file,
          size: stats.size,
          type: parsed.is_answer ? '解析版' : '原卷版'
        });
      }
    }

    // 转换为数组格式
    analysis.groups = Object.values(examGroups).map(group => ({
      title: group.parsed.title,
      parsed: group.parsed,
      files: group.files,
      hasOriginal: group.files.some(f => f.type === '原卷版'),
      hasAnswer: group.files.some(f => f.type === '解析版')
    }));

    // 同时生成文件列表格式（兼容前端旧代码）
    analysis.files = [];
    for (const file of files) {
      const filePath = path.join(sourceDir, file);
      const stats = fs.statSync(filePath);
      const parsed = parseFilename(file);

      analysis.files.push({
        filename: file,
        size: stats.size,
        canParse: !!parsed,
        parsed: parsed
      });
    }

    res.json({
      code: 200,
      message: '分析完成',
      data: analysis
    });

  } catch (error) {
    console.error('分析目录失败:', error);
    res.status(500).json({
      code: 500,
      message: '分析目录失败',
      error: error.message
    });
  }
}

module.exports = {
  batchImport,
  analyzeDirectory,
  parseFilename
};
