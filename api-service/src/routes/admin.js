/**
 * 管理员后台路由
 */
const express = require('express');
const router = express.Router();
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
router.post('/auth/login', adminLogin);

// ==================== 统计数据 ====================
router.get('/stats/overview', adminAuthMiddleware, async (req, res) => {
  try {
    const db = require('../utils/db');

    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const examCount = await db.query('SELECT COUNT(*) as count FROM exams');
    const downloadCount = await db.query('SELECT COUNT(*) as count FROM download_logs');
    const cityCount = await db.query('SELECT COUNT(*) as count FROM cities');

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        userCount: userCount[0].count,
        examCount: examCount[0].count,
        downloadCount: downloadCount[0].count,
        cityCount: cityCount[0].count
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

// ==================== 城市管理 ====================
router.post('/cities/list', adminAuthMiddleware, (req, res) => cityController.list(req, res));
router.get('/cities/:id', adminAuthMiddleware, (req, res) => cityController.detail(req, res));
router.post('/cities', adminAuthMiddleware, (req, res) => cityController.create(req, res));
router.put('/cities/:id', adminAuthMiddleware, (req, res) => cityController.update(req, res));
router.delete('/cities/:id', adminAuthMiddleware, (req, res) => cityController.delete(req, res));
router.post('/cities/batch-delete', adminAuthMiddleware, (req, res) => cityController.batchDelete(req, res));

// ==================== 年级管理 ====================
router.post('/grades/list', adminAuthMiddleware, (req, res) => gradeController.list(req, res));
router.get('/grades/:id', adminAuthMiddleware, (req, res) => gradeController.detail(req, res));
router.post('/grades', adminAuthMiddleware, (req, res) => gradeController.create(req, res));
router.put('/grades/:id', adminAuthMiddleware, (req, res) => gradeController.update(req, res));
router.delete('/grades/:id', adminAuthMiddleware, (req, res) => gradeController.delete(req, res));
router.post('/grades/batch-delete', adminAuthMiddleware, (req, res) => gradeController.batchDelete(req, res));

// ==================== 科目管理 ====================
router.post('/subjects/list', adminAuthMiddleware, (req, res) => subjectController.list(req, res));
router.get('/subjects/:id', adminAuthMiddleware, (req, res) => subjectController.detail(req, res));
router.post('/subjects', adminAuthMiddleware, (req, res) => subjectController.create(req, res));
router.put('/subjects/:id', adminAuthMiddleware, (req, res) => subjectController.update(req, res));
router.delete('/subjects/:id', adminAuthMiddleware, (req, res) => subjectController.delete(req, res));
router.post('/subjects/batch-delete', adminAuthMiddleware, (req, res) => subjectController.batchDelete(req, res));

// ==================== 标签管理 ====================
router.post('/tags/list', adminAuthMiddleware, (req, res) => tagController.list(req, res));
router.get('/tags/:id', adminAuthMiddleware, (req, res) => tagController.detail(req, res));
router.post('/tags', adminAuthMiddleware, (req, res) => tagController.create(req, res));
router.put('/tags/:id', adminAuthMiddleware, (req, res) => tagController.update(req, res));
router.delete('/tags/:id', adminAuthMiddleware, (req, res) => tagController.delete(req, res));
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
