/**
 * 管理员后台路由
 */
const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { adminLogin, adminAuthMiddleware } = require('../middlewares/adminAuth');

// 导入控制器
const cityController = require('../controllers/admin/city.controller');
const gradeController = require('../controllers/admin/grade.controller');
const subjectController = require('../controllers/admin/subject.controller');
const tagController = require('../controllers/admin/tag.controller');
const examController = require('../controllers/admin/exam.controller');
const examImportController = require('../controllers/admin/examImport.controller');
const userController = require('../controllers/admin/user.controller');

// ==================== 认证 ====================
router.post('/auth/login', (req, res, next) => {
  console.log('🔐 登录请求:', {
    body: req.body,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  adminLogin(req, res, (err) => {
    if (err) {
      console.error('❌ 登录失败:', err);
      return res.status(500).json({
        code: 500,
        message: '登录失败',
        error: err.message
      });
    }
    next();
  });
});

// ==================== 统计数据 ====================
router.get('/stats/overview', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('📊 获取统计数据, token:', req.headers['admin-token']?.substring(0, 20) + '...');
    const db = require('../utils/db');

    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const examCount = await db.query('SELECT COUNT(*) as count FROM exams');
    const downloadCount = await db.query('SELECT COUNT(*) as count FROM download_logs');
    const cityCount = await db.query('SELECT COUNT(*) as count FROM cities');

    // 计算覆盖率和热门科目
    const [subjects] = await db.query('SELECT COUNT(*) as count FROM subjects');
    const [grades] = await db.query('SELECT COUNT(*) as count FROM grades');

    // 获取热门科目（按试卷数量统计）
    const popularSubjects = await db.query(`
      SELECT s.name, COUNT(e.id) as count
      FROM subjects s
      LEFT JOIN exams e ON s.id = e.subject_id
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT 3
    `);

    // 计算覆盖率（简化版本）
    const subjectCoverage = subjects.count > 0 ? 75 : 0; // 示例值
    const gradeCoverage = grades.count > 0 ? 90 : 0; // 示例值

    const stats = {
      totalUsers: userCount[0].count,
      totalExams: examCount[0].count,
      totalDownloads: downloadCount[0].count,
      totalCities: cityCount[0].count,
      subjectCoverage: subjectCoverage,
      gradeCoverage: gradeCoverage,
      popularSubjects: popularSubjects.map(s => ({
        name: s.name,
        count: s.count,
        percent: examCount[0].count > 0 ? Math.round((s.count / examCount[0].count) * 100) : 0
      }))
    };

    console.log('✅ 统计数据:', stats);
    res.json({
      code: 200,
      message: '获取成功',
      data: stats
    });
  } catch (error) {
    console.error('❌ 获取统计数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

// ==================== 城市管理 ====================
router.post('/cities/list', adminAuthMiddleware, (req, res) => {
  console.log('🏙️ 获取城市列表, params:', req.body);
  cityController.list(req, res);
});

router.get('/cities/:id', adminAuthMiddleware, (req, res) => {
  console.log('🏙️ 获取城市详情, id:', req.params.id);
  cityController.detail(req, res);
});

router.post('/cities', adminAuthMiddleware, (req, res) => {
  console.log('➕ 创建城市, data:', req.body);
  cityController.create(req, res);
});

router.put('/cities/:id', adminAuthMiddleware, (req, res) => {
  console.log('✏️ 更新城市, id:', req.params.id, 'data:', req.body);
  cityController.update(req, res);
});

router.delete('/cities/:id', adminAuthMiddleware, (req, res) => {
  console.log('🗑️ 删除城市, id:', req.params.id);
  cityController.delete(req, res);
});

router.post('/cities/batch-delete', adminAuthMiddleware, (req, res) => {
  console.log('🗑️ 批量删除城市, ids:', req.body.ids);
  cityController.batchDelete(req, res);
});

// ==================== 年级管理 ====================
router.post('/grades/list', adminAuthMiddleware, (req, res) => {
  console.log('📚 获取年级列表, params:', req.body);
  gradeController.list(req, res);
});

router.get('/grades/:id', adminAuthMiddleware, (req, res) => gradeController.detail(req, res));
router.post('/grades', adminAuthMiddleware, (req, res) => {
  console.log('➕ 创建年级, data:', req.body);
  gradeController.create(req, res);
});
router.put('/grades/:id', adminAuthMiddleware, (req, res) => {
  console.log('✏️ 更新年级, id:', req.params.id, 'data:', req.body);
  gradeController.update(req, res);
});
router.delete('/grades/:id', adminAuthMiddleware, (req, res) => {
  console.log('🗑️ 删除年级, id:', req.params.id);
  gradeController.delete(req, res);
});
router.post('/grades/batch-delete', adminAuthMiddleware, (req, res) => gradeController.batchDelete(req, res));

// ==================== 科目管理 ====================
router.post('/subjects/list', adminAuthMiddleware, (req, res) => {
  console.log('📖 获取科目列表, params:', req.body);
  subjectController.list(req, res);
});

router.get('/subjects/:id', adminAuthMiddleware, (req, res) => subjectController.detail(req, res));
router.post('/subjects', adminAuthMiddleware, (req, res) => {
  console.log('➕ 创建科目, data:', req.body);
  subjectController.create(req, res);
});
router.put('/subjects/:id', adminAuthMiddleware, (req, res) => {
  console.log('✏️ 更新科目, id:', req.params.id, 'data:', req.body);
  subjectController.update(req, res);
});
router.delete('/subjects/:id', adminAuthMiddleware, (req, res) => {
  console.log('🗑️ 删除科目, id:', req.params.id);
  subjectController.delete(req, res);
});
router.post('/subjects/batch-delete', adminAuthMiddleware, (req, res) => subjectController.batchDelete(req, res));

// ==================== 标签管理 ====================
router.post('/tags/list', adminAuthMiddleware, (req, res) => {
  console.log('🏷️ 获取标签列表, params:', req.body);
  tagController.list(req, res);
});

router.get('/tags/:id', adminAuthMiddleware, (req, res) => tagController.detail(req, res));
router.post('/tags', adminAuthMiddleware, (req, res) => {
  console.log('➕ 创建标签, data:', req.body);
  tagController.create(req, res);
});
router.put('/tags/:id', adminAuthMiddleware, (req, res) => {
  console.log('✏️ 更新标签, id:', req.params.id, 'data:', req.body);
  tagController.update(req, res);
});
router.delete('/tags/:id', adminAuthMiddleware, (req, res) => {
  console.log('🗑️ 删除标签, id:', req.params.id);
  tagController.delete(req, res);
});
router.post('/tags/batch-delete', adminAuthMiddleware, (req, res) => tagController.batchDelete(req, res));

// ==================== 试卷管理 ====================
router.post('/exams/list', adminAuthMiddleware, (req, res) => examController.list(req, res));
router.get('/exams/:id', adminAuthMiddleware, (req, res) => examController.detail(req, res));
router.post('/exams', adminAuthMiddleware, (req, res) => examController.create(req, res));
router.put('/exams/:id', adminAuthMiddleware, (req, res) => examController.update(req, res));
router.delete('/exams/:id', adminAuthMiddleware, (req, res) => examController.delete(req, res));
router.post('/exams/batch-delete', adminAuthMiddleware, (req, res) => examController.batchDelete(req, res));

// 试卷批量导入
router.post('/exams/import/analyze', adminAuthMiddleware, (req, res) => examImportController.analyzeDirectory(req, res));
router.post('/exams/import/batch', adminAuthMiddleware, (req, res) => examImportController.batchImport(req, res));

// ==================== 用户管理 ====================
router.post('/users/list', adminAuthMiddleware, (req, res) => userController.list(req, res));
router.get('/users/:id', adminAuthMiddleware, (req, res) => userController.detail(req, res));
router.put('/users/:id', adminAuthMiddleware, (req, res) => userController.update(req, res));
router.delete('/users/:id', adminAuthMiddleware, (req, res) => userController.delete(req, res));
router.post('/users/batch-delete', adminAuthMiddleware, (req, res) => userController.batchDelete(req, res));
router.put('/users/:id/points', adminAuthMiddleware, (req, res) => userController.updatePoints(req, res));
router.put('/users/:id/toggle-status', adminAuthMiddleware, (req, res) => userController.toggleStatus(req, res));

module.exports = router;
