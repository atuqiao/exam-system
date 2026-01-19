const express = require('express');
const multer = require('multer');
const cosService = require('../services/cos.service');
const cosConfig = require('../config/cos');

const router = express.Router();

// 配置 multer 用于内存存储文件
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: cosConfig.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const ext = require('path').extname(file.originalname).toLowerCase();
    if (cosConfig.allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${ext}`));
    }
  }
});

/**
 * 上传单个文件
 * POST /api/upload/file
 */
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的文件'
      });
    }

    console.log('开始上传文件:', req.file.originalname);

    // 上传到 COS
    const fileUrl = await cosService.uploadFile(req.file, req.file.originalname);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '文件上传失败'
    });
  }
});

/**
 * 批量上传文件
 * POST /api/upload/files
 */
router.post('/files', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的文件'
      });
    }

    console.log(`开始批量上传 ${req.files.length} 个文件`);

    // 并发上传所有文件
    const uploadPromises = req.files.map(file =>
      cosService.uploadFile(file, file.originalname)
    );

    const urls = await Promise.all(uploadPromises);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        count: urls.length,
        files: req.files.map((file, index) => ({
          url: urls[index],
          filename: file.originalname,
          size: file.size
        }))
      }
    });
  } catch (error) {
    console.error('批量上传失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '批量上传失败'
    });
  }
});

/**
 * 获取上传凭证（前端直接上传到 COS）
 * GET /api/upload/authorization?filename=xxx.pdf
 */
router.get('/authorization', async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({
        code: 400,
        message: '请提供文件名'
      });
    }

    // 验证文件类型
    const ext = require('path').extname(filename).toLowerCase();
    if (!cosConfig.allowedFileTypes.includes(ext)) {
      return res.status(400).json({
        code: 400,
        message: `不支持的文件类型: ${ext}，仅支持: ${cosConfig.allowedFileTypes.join(', ')}`
      });
    }

    const auth = await cosService.getUploadAuthorization(filename);

    res.json({
      code: 200,
      message: '获取凭证成功',
      data: auth
    });
  } catch (error) {
    console.error('获取上传凭证失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取上传凭证失败'
    });
  }
});

/**
 * 删除文件
 * DELETE /api/upload/file
 * Body: { url: '文件URL' }
 */
router.delete('/file', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的文件URL'
      });
    }

    await cosService.deleteFile(url);

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('文件删除失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '文件删除失败'
    });
  }
});

module.exports = router;
