const db = require('../utils/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 生成邀请码
const generateInviteCode = () => {
  return 'INV' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// 微信登录
exports.login = async (req, res) => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少登录code'
      });
    }

    // TODO: 实际项目中需要调用微信API验证code并获取openid
    // 这里为演示目的，使用code作为openid
    const openid = 'wx_' + code;

    // 查询用户是否存在
    const users = await db.query(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    );

    let user, token;

    if (users.length === 0) {
      // 新用户注册
      const inviteCode = generateInviteCode();
      const points = 100; // 新用户赠送积分

      const result = await db.query(
        'INSERT INTO users (openid, nickname, avatar_url, gender, points, invite_code, status) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [
          openid,
          userInfo?.nickName || '微信用户',
          userInfo?.avatarUrl || null,
          userInfo?.gender || 0,
          points,
          inviteCode
        ]
      );

      user = {
        id: result.insertId,
        openid,
        nickname: userInfo?.nickName || '微信用户',
        avatarUrl: userInfo?.avatarUrl || null,
        points,
        inviteCode
      };

      // 记录积分日志
      await db.query(
        'INSERT INTO point_logs (user_id, type, points, before_points, after_points, description) VALUES (?, 4, ?, 0, ?, ?)',
        [user.id, points, points, '新用户注册赠送']
      );
    } else {
      user = users[0];
    }

    // 生成JWT token
    token = jwt.sign({ userId: user.id, openid: user.openid }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          points: user.points,
          inviteCode: user.invite_code
        },
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败',
      error: error.message
    });
  }
};

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.userId; // 从中间件获取

    const users = await db.query(
      'SELECT id, nickname, avatar_url as avatarUrl, gender, points, invite_code as inviteCode FROM users WHERE id = ? AND status = 1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败'
    });
  }
};
