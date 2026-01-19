const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const baseController = require('../controllers/base.controller');
const examController = require('../controllers/exam.controller');
const subjectController = require('../controllers/subject.controller');
const tagController = require('../controllers/tag.controller');
const authMiddleware = require('../middlewares/auth');
const adminRouter = require('./admin');
// const uploadRouter = require('./upload.routes'); // 暂时注释，缺少cos.service

// 认证相关
router.post('/auth/login', authController.login);
router.get('/auth/userinfo', authMiddleware, authController.getUserInfo);

// 基础数据
router.get('/cities', baseController.getCities);
router.get('/grades', baseController.getGrades);
router.get('/subjects', baseController.getSubjects);

// 试卷相关
router.get('/exams', examController.getList);
router.get('/exams/search', examController.search);
router.get('/exams/downloads', authMiddleware, examController.getDownloads);
router.get('/exams/:id', examController.getDetail);
router.post('/exams/:id/download', examController.download);

// 科目相关
router.post('/subjects/open', authMiddleware, subjectController.open);
router.get('/subjects/opened', authMiddleware, subjectController.getOpened);
router.get('/subjects/check', authMiddleware, subjectController.check);

// 标签相关
router.get('/tags/city/:cityId', baseController.getTagsByCity);

// 文件上传
// router.use('/upload', uploadRouter); // 暂时注释，缺少cos.service

// 管理员后台
router.use('/admin', adminRouter);

module.exports = router;
