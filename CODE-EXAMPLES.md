# 项目核心代码示例

## 目录
1. [API Service 核心代码](#api-service-核心代码)
2. [Admin Dashboard 核心代码](#admin-dashboard-核心代码)
3. [Miniapp 核心代码](#miniapp-核心代码)
4. [数据库迁移代码](#数据库迁移代码)
5. [Docker 配置](#docker-配置)

---

## API Service 核心代码

### 1. 应用入口 (src/app.js)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const routes = require('./routes');
const { connectDB } = require('./utils/database');
const { initLogger } = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化日志
const logger = initLogger();

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://admin.yourdomain.com'] 
    : '*',
  credentials: true
}));

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api', routes);

// 错误处理
app.use(errorHandler);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'API endpoint not found',
    data: null
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
```

### 2. Service层示例 (src/services/exam.service.js)

```javascript
const ExamModel = require('../models/Exam');
const { AppError } = require('../utils/errors');

class ExamService {
  /**
   * 获取试卷列表
   */
  async getList(params) {
    const {
      cityId,
      gradeId,
      subjectId,
      tagId,
      page = 1,
      limit = 20,
      keyword,
      featured
    } = params;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where = { status: 1 };
    if (cityId) where.city_id = cityId;
    if (gradeId) where.grade_id = gradeId;
    if (subjectId) where.subject_id = subjectId;
    if (tagId) {
      // 支持标签别名查询
      where.$or = [
        { tag_id: tagId },
        { '$tag.alias$': tagId }
      ];
    }
    if (featured) where.featured = 1;
    if (keyword) {
      where.$or = [
        { title: { $like: `%${keyword}%` } }
      ];
    }

    // 查询数据
    const [list, total] = await Promise.all([
      ExamModel.findAndCountAll({
        where,
        include: [
          { model: CityModel, as: 'city', attributes: ['id', 'name'] },
          { model: GradeModel, as: 'grade', attributes: ['id', 'name'] },
          { model: SubjectModel, as: 'subject', attributes: ['id', 'name'] },
          { model: TagModel, as: 'tag', attributes: ['id', 'name', 'alias'] }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      }),
      ExamModel.count({ where })
    ]);

    return {
      list,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 获取试卷详情
   */
  async getDetail(id) {
    const exam = await ExamModel.findByPk(id, {
      include: [
        { model: CityModel, as: 'city' },
        { model: GradeModel, as: 'grade' },
        { model: SubjectModel, as: 'subject' },
        { model: TagModel, as: 'tag' }
      ]
    });

    if (!exam) {
      throw new AppError('试卷不存在', 404);
    }

    return exam;
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(id) {
    await ExamModel.increment(
      { download_count: 1 },
      { where: { id } }
    );
  }

  /**
   * 创建试卷
   */
  async create(data) {
    return await ExamModel.create(data);
  }

  /**
   * 更新试卷
   */
  async update(id, data) {
    const exam = await ExamModel.findByPk(id);
    if (!exam) {
      throw new AppError('试卷不存在', 404);
    }
    return await exam.update(data);
  }

  /**
   * 删除试卷
   */
  async delete(id) {
    const exam = await ExamModel.findByPk(id);
    if (!exam) {
      throw new AppError('试卷不存在', 404);
    }
    return await exam.destroy();
  }
}

module.exports = new ExamService();
```

### 3. Controller层示例 (src/controllers/exam.controller.js)

```javascript
const examService = require('../services/exam.service');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * 获取试卷列表
 */
exports.getList = async (req, res, next) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, {
        code: 400,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const result = await examService.getList(req.query);
    return successResponse(res, result, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取试卷详情
 */
exports.getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await examService.getDetail(id);
    return successResponse(res, exam, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 记录下载
 */
exports.recordDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    await examService.incrementDownloadCount(id);
    return successResponse(res, null, '记录成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建试卷（管理员）
 */
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, {
        code: 400,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const exam = await examService.create(req.body);
    return successResponse(res, exam, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新试卷（管理员）
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await examService.update(id, req.body);
    return successResponse(res, exam, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除试卷（管理员）
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await examService.delete(id);
    return successResponse(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};
```

### 4. Model层示例 (src/models/Exam.js)

```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const City = require('./City');
const Grade = require('./Grade');
const Subject = require('./Subject');
const Tag = require('./Tag');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '试卷标题'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '年份'
  },
  semester: {
    type: DataTypes.ENUM('上学期', '下学期'),
    allowNull: false,
    comment: '学期'
  },
  file_url: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    comment: '试卷文件URL'
  },
  answer_url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    comment: '答案文件URL'
  },
  file_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'PDF',
    comment: '文件类型'
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '下载次数'
  },
  featured: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否精选'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 1-启用 0-禁用'
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cities',
      key: 'id'
    }
  },
  grade_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'grades',
      key: 'id'
    }
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tags',
      key: 'id'
    }
  }
}, {
  tableName: 'exams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    { fields: ['city_id', 'grade_id', 'subject_id'] },
    { fields: ['status'] },
    { fields: ['featured'] }
  ]
});

// 关联关系
Exam.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
Exam.belongsTo(Grade, { foreignKey: 'grade_id', as: 'grade' });
Exam.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
Exam.belongsTo(Tag, { foreignKey: 'tag_id', as: 'tag' });

module.exports = Exam;
```

### 5. 路由示例 (src/routes/exam.routes.js)

```javascript
const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const { authenticate } = require('../middlewares/auth');
const { validateExamQuery, validateExamBody } = require('../validators/exam.validator');

// 公开路由
router.get('/', validateExamQuery, examController.getList);
router.get('/:id', examController.getDetail);
router.post('/:id/download', examController.recordDownload);

// 需要认证的路由
router.post('/', authenticate, validateExamBody, examController.create);
router.put('/:id', authenticate, examController.update);
router.delete('/:id', authenticate, examController.delete);

module.exports = router;
```

### 6. 中间件示例 (src/middlewares/auth.js)

```javascript
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * JWT认证中间件
 */
const authenticate = async (req, res, next) => {
  try {
    // 从header获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证token', 401);
    }

    const token = authHeader.substring(7);

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户信息添加到req对象
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token');
      return next(new AppError('无效的token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      logger.warn('Expired JWT token');
      return next(new AppError('token已过期', 401));
    }
    next(error);
  }
};

/**
 * 管理员权限中间件
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('需要管理员权限', 403));
  }
  next();
};

module.exports = { authenticate, requireAdmin };
```

### 7. 数据验证器 (src/validators/exam.validator.js)

```javascript
const { body, query, param } = require('express-validator');

/**
 * 试卷列表查询验证
 */
exports.validateExamQuery = [
  query('cityId').optional().isInt().withMessage('城市ID必须是整数'),
  query('gradeId').optional().isInt().withMessage('年级ID必须是整数'),
  query('subjectId').optional().isInt().withMessage('科目ID必须是整数'),
  query('tagId').optional().isInt().withMessage('标签ID必须是整数'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量在1-100之间'),
  query('keyword').optional().isLength({ max: 100 }).withMessage('关键词最多100字符'),
  query('featured').optional().isIn(['0', '1']).withMessage('精选标志必须是0或1')
];

/**
 * 试卷创建/更新验证
 */
exports.validateExamBody = [
  body('title').notEmpty().withMessage('标题不能为空')
    .isLength({ max: 500 }).withMessage('标题最多500字符'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('年份必须在2000-2100之间'),
  body('semester').isIn(['上学期', '下学期']).withMessage('学期必须是上学期或下学期'),
  body('city_id').isInt().withMessage('城市ID必须是整数'),
  body('grade_id').isInt().withMessage('年级ID必须是整数'),
  body('subject_id').isInt().withMessage('科目ID必须是整数'),
  body('file_url').isURL().withMessage('文件URL格式不正确'),
  body('tag_id').optional().isInt().withMessage('标签ID必须是整数')
];
```

---

## Admin Dashboard 核心代码

### 1. API请求封装 (src/api/request.ts)

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, data, message: msg } = response.data;
    
    if (code === 200) {
      return data;
    } else {
      message.error(msg || '请求失败');
      return Promise.reject(new Error(msg || '请求失败'));
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(data.message || '请求失败');
      }
    } else {
      message.error('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default request;
```

### 2. 试卷API (src/api/exam.ts)

```typescript
import request from './request';

export interface Exam {
  id: number;
  title: string;
  year: number;
  semester: string;
  city_name: string;
  grade_name: string;
  subject_name: string;
  tag_alias?: string;
  download_count: number;
  featured: number;
  status: number;
}

export interface ExamListParams {
  cityId?: number;
  gradeId?: number;
  subjectId?: number;
  tagId?: number;
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface ExamListResponse {
  list: Exam[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 获取试卷列表
 */
export const getExamList = (params: ExamListParams): Promise<ExamListResponse> => {
  return request.get('/admin/exams', { params });
};

/**
 * 获取试卷详情
 */
export const getExamDetail = (id: number): Promise<Exam> => {
  return request.get(`/admin/exams/${id}`);
};

/**
 * 创建试卷
 */
export const createExam = (data: Partial<Exam>): Promise<Exam> => {
  return request.post('/admin/exams', data);
};

/**
 * 更新试卷
 */
export const updateExam = (id: number, data: Partial<Exam>): Promise<Exam> => {
  return request.put(`/admin/exams/${id}`, data);
};

/**
 * 删除试卷
 */
export const deleteExam = (id: number): Promise<void> => {
  return request.delete(`/admin/exams/${id}`);
};

/**
 * 批量导入试卷
 */
export const importExams = (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/admin/exams/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### 3. 试卷列表页面 (src/pages/Exam/List.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getExamList, deleteExam } from '@/api/exam';
import type { Exam } from '@/api/exam';

const ExamList: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [keyword, setKeyword] = useState('');

  // 获取试卷列表
  const fetchExams = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await getExamList({
        page,
        limit: pageSize,
        keyword
      });
      
      setExams(res.list);
      setPagination({
        current: res.page,
        pageSize: res.limit,
        total: res.total
      });
    } catch (error) {
      message.error('获取试卷列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除试卷
  const handleDelete = async (id: number) => {
    try {
      await deleteExam(id);
      message.success('删除成功');
      fetchExams(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<Exam> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      key: 'id'
    },
    {
      title: '试卷标题',
      dataIndex: 'title',
      ellipsis: true,
      key: 'title'
    },
    {
      title: '城市',
      dataIndex: 'city_name',
      width: 100,
      key: 'city_name'
    },
    {
      title: '年级',
      dataIndex: 'grade_name',
      width: 100,
      key: 'grade_name'
    },
    {
      title: '科目',
      dataIndex: 'subject_name',
      width: 100,
      key: 'subject_name'
    },
    {
      title: '区域',
      dataIndex: 'tag_alias',
      width: 100,
      key: 'tag_alias',
      render: (text) => text || '-'
    },
    {
      title: '下载次数',
      dataIndex: 'download_count',
      width: 100,
      key: 'download_count'
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleEdit = (id: number) => {
    // 跳转到编辑页面
    window.location.href = `/exams/edit/${id}`;
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="exam-list">
      <div className="page-header">
        <Space>
          <Input.Search
            placeholder="搜索试卷标题"
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => {
              setKeyword(value);
              fetchExams(1, pagination.pageSize);
            }}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            新增试卷
          </Button>
          <Button icon={<UploadOutlined />}>
            批量导入
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchExams(page, pageSize)
        }}
      />
    </div>
  );
};

export default ExamList;
```

---

## Miniapp 核心代码

### 1. 配置文件 (utils/config.js)

```javascript
// 环境配置
const config = {
  // 开发环境
  dev: {
    apiUrl: 'http://localhost:3000/api',
    appId: 'your-dev-appid'
  },
  // 生产环境
  prod: {
    apiUrl: 'https://api.yourdomain.com/api',
    appId: 'your-prod-appid'
  }
};

// 根据版本号自动切换环境
const env = '__VERSION__' === 'prod' ? 'prod' : 'dev';

module.exports = config[env];
```

### 2. 网络请求封装 (api/request.js)

```javascript
const config = require('../utils/config');

/**
 * 网络请求封装
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${config.apiUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // token过期，跳转登录
          wx.removeStorageSync('token');
          wx.redirectTo({ url: '/pages/login/index' });
          reject(res);
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

module.exports = request;
```

### 3. 试卷API (api/exam.js)

```javascript
const request = require('./request');

/**
 * 获取试卷列表
 */
function getExamList(params) {
  return request({
    url: '/exams',
    method: 'GET',
    data: params
  });
}

/**
 * 获取试卷详情
 */
function getExamDetail(id) {
  return request({
    url: `/exams/${id}`,
    method: 'GET'
  });
}

/**
 * 记录下载
 */
function recordDownload(id) {
  return request({
    url: `/exams/${id}/download`,
    method: 'POST'
  });
}

module.exports = {
  getExamList,
  getExamDetail,
  recordDownload
};
```

### 4. 试卷列表页 (pages/exams/list.js)

```javascript
const { getExamList, recordDownload } = require('../../../api/exam');
const { formatSemester } = require('../../../utils/format');

Page({
  data: {
    // 筛选条件
    selectedCity: {},
    selectedGrade: {},
    selectedSubject: {},
    selectedTag: {},
    
    // 基础数据
    cities: [],
    grades: [],
    subjects: [],
    tags: [],
    
    // 试卷列表
    examList: [],
    loading: false,
    hasMore: true,
    
    // 分页
    page: 1,
    limit: 20
  },

  onLoad(options) {
    this.loadBaseData();
  },

  /**
   * 加载基础数据
   */
  async loadBaseData() {
    try {
      const [cities, grades, subjects] = await Promise.all([
        getCities(),
        getGrades(),
        getSubjects()
      ]);
      
      this.setData({ cities, grades, subjects });
    } catch (error) {
      wx.showToast({ title: '加载基础数据失败', icon: 'none' });
    }
  },

  /**
   * 加载试卷列表
   */
  async loadExams() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const { selectedCity, selectedGrade, selectedSubject, selectedTag, page, limit } = this.data;
      
      const params = {
        cityId: selectedCity.id,
        gradeId: selectedGrade.id,
        subjectId: selectedSubject.id,
        tagId: selectedTag.id,
        page,
        limit
      };
      
      const result = await getExamList(params);
      
      const exams = result.list.map(exam => ({
        ...exam,
        semester_text: formatSemester(exam.semester)
      }));
      
      this.setData({
        examList: page === 1 ? exams : [...this.data.examList, ...exams],
        hasMore: exams.length === limit,
        loading: false
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /**
   * 触底加载更多
   */
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({
      page: this.data.page + 1
    });
    
    this.loadExams();
  },

  /**
   * 下载试卷
   */
  async onDownload(e) {
    const { exam } = e.currentTarget.dataset;
    
    try {
      // 记录下载
      await recordDownload(exam.id);
      
      // 下载文件
      wx.downloadFile({
        url: exam.file_url,
        success: (res) => {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '下载成功', icon: 'success' });
            }
          });
        },
        fail: () => {
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      });
    } catch (error) {
      wx.showToast({ title: '下载失败', icon: 'none' });
    }
  },

  /**
   * 跳转详情页
   */
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/exams/detail/index?id=${id}`
    });
  }
});
```

---

## 数据库迁移代码

### 1. 迁移脚本 (database/migrations/001_create_tables.sql)

```sql
-- 创建城市表
CREATE TABLE IF NOT EXISTS cities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '城市名称',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='城市表';

-- 创建年级表
CREATE TABLE IF NOT EXISTS grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '年级名称',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='年级表';

-- 创建科目表
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '科目名称',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科目表';

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '标签名称',
  alias VARCHAR(50) COMMENT '标签别名',
  city_id INT COMMENT '所属城市',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX idx_city_id (city_id),
  INDEX idx_alias (alias)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar VARCHAR(500) COMMENT '头像',
  role ENUM('user', 'admin') DEFAULT 'user' COMMENT '角色',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 创建试卷表
CREATE TABLE IF NOT EXISTS exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL COMMENT '试卷标题',
  year INT NOT NULL COMMENT '年份',
  semester ENUM('上学期', '下学期') NOT NULL COMMENT '学期',
  file_url VARCHAR(1000) NOT NULL COMMENT '试卷文件URL',
  answer_url VARCHAR(1000) COMMENT '答案文件URL',
  file_type VARCHAR(50) DEFAULT 'PDF' COMMENT '文件类型',
  download_count INT DEFAULT 0 COMMENT '下载次数',
  featured TINYINT DEFAULT 0 COMMENT '是否精选: 1-是 0-否',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
  city_id INT NOT NULL COMMENT '城市ID',
  grade_id INT NOT NULL COMMENT '年级ID',
  subject_id INT NOT NULL COMMENT '科目ID',
  tag_id INT COMMENT '标签ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (grade_id) REFERENCES grades(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL,
  INDEX idx_city_grade_subject (city_id, grade_id, subject_id),
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试卷表';
```

---

## Docker 配置

### docker-compose.yml

```yaml
version: '3.8'

services:
  # API服务
  api:
    build: ./api-service
    container_name: exam-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: always
    networks:
      - exam-network

  # 管理后台
  admin:
    build: ./admin-dashboard
    container_name: exam-admin
    ports:
      - "8080:80"
    depends_on:
      - api
    restart: always
    networks:
      - exam-network

  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: exam-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: exam_management
      MYSQL_USER: exam_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/schema:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    restart: always
    networks:
      - exam-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: exam-redis
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    restart: always
    networks:
      - exam-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: exam-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - admin
    restart: always
    networks:
      - exam-network

volumes:
  mysql-data:
  redis-data:

networks:
  exam-network:
    driver: bridge
```

---

