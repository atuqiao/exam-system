/**
 * 管理员认证中间件
 */

const logger = require('../config/logger');

// 简单的管理员认证（生产环境应使用更安全的方案）
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * 验证管理员身份
 */
function authenticateAdmin(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

/**
 * 生成管理员 Token（简单的 base64 编码，生产环境应使用 JWT）
 */
function generateAdminToken() {
  const token = Buffer.from(`${ADMIN_USERNAME}:${Date.now()}`).toString('base64');
  return token;
}

/**
 * 验证管理员 Token
 */
function verifyAdminToken(token) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username] = decoded.split(':');
    return username === ADMIN_USERNAME;
  } catch (error) {
    return false;
  }
}

/**
 * 管理员登录
 */
function adminLogin(req, res, next) {
  const { username, password } = req.body;

  logger.info('管理员登录请求', { username, ip: req.ip });

  if (!username || !password) {
    logger.warn('登录失败：用户名或密码为空', { username });
    return res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空'
    });
  }

  if (authenticateAdmin(username, password)) {
    const token = generateAdminToken();
    logger.info('登录成功', { username, tokenPrefix: token.substring(0, 20) });
    return res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        username
      }
    });
  } else {
    logger.warn('登录失败：用户名或密码错误', { username });
    return res.status(401).json({
      code: 401,
      message: '用户名或密码错误'
    });
  }
}

/**
 * 管理员认证中间件
 */
function adminAuthMiddleware(req, res, next) {
  // 支持多种 header 名称格式
  const token = req.headers['admin-token'] || req.headers['Admin-Token'] || req.headers['ADMIN-TOKEN'];
  const path = req.path;

  logger.http('管理员认证', { path, tokenPrefix: token?.substring(0, 20) });

  if (!token) {
    logger.warn('认证失败：未提供token', { path });
    return res.status(401).json({
      code: 401,
      message: '未提供管理员令牌'
    });
  }

  if (verifyAdminToken(token)) {
    logger.info('Token验证成功', { username: ADMIN_USERNAME, path });
    req.admin = { username: ADMIN_USERNAME };
    next();
  } else {
    logger.warn('认证失败：无效的token', { path });
    return res.status(403).json({
      code: 403,
      message: '无效的管理员令牌'
    });
  }
}

module.exports = {
  adminLogin,
  adminAuthMiddleware,
  authenticateAdmin,
  generateAdminToken,
  verifyAdminToken
};
