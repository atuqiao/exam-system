require('dotenv').config();
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 日志目录 - 确保目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // 添加额外的元数据
    if (Object.keys(meta).length > 0) {
      if (meta.stack) {
        // 错误堆栈
        msg += `\n${meta.stack}`;
      } else {
        // 其他元数据
        msg += ` ${JSON.stringify(meta)}`;
      }
    }

    return msg;
  })
);

// 创建 logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 控制台输出（带颜色）
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),

    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),

    // API 访问日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'api.log'),
      level: 'http',
      maxsize: 5242880,
      maxFiles: 3
    })
  ],

  // 异常时不退出程序
  exitOnError: false
});

// 在生产环境不输出到控制台
if (process.env.NODE_ENV === 'production') {
  logger.remove(winston.transports.Console);
}

module.exports = logger;
