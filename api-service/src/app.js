require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const routes = require('./routes');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务 - 用于提供下载文件
app.use('/downloads', express.static(path.join(__dirname, '../downloads')));

// 管理后台静态文件
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// 请求日志 - 同时记录到文件和终端
app.use((req, res, next) => {
  const logMessage = `${req.method} ${req.path}`;

  // 记录到控制台（兼容原有格式）
  console.log(`${new Date().toISOString()} - ${logMessage}`);

  // 记录到文件
  logger.http(logMessage, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip
  });

  next();
});

// API路由
app.use('/api', routes);

// 根路径 - API 信息
app.get('/', (req, res) => {
  res.json({
    name: '资料管理小程序 API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: {
        cities: '/api/cities',
        grades: '/api/grades',
        subjects: '/api/subjects',
        exams: '/api/exams',
        admin: '/api/admin'
      }
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 资料管理小程序后端服务');
  console.log('========================================');
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log(`📚 API地址: http://localhost:${PORT}/api`);
  console.log('========================================');
  console.log('');
});

module.exports = app;
