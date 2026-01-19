require('dotenv').config();

module.exports = {
  // 服务器端口
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  // 下载服务器配置
  // 小程序无法访问localhost，使用本机IP
  // 在开发环境下，需要确保手机和电脑在同一局域网
  downloadBaseUrl: process.env.DOWNLOAD_BASE_URL || 'http://192.168.31.161:3000',

  // 获取完整的下载URL
  getDownloadUrl(relativePath) {
    // 如果已经是完整URL，直接返回
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    // 如果是相对路径，拼接基础URL
    const baseUrl = this.downloadBaseUrl.replace(/\/$/, '');
    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${baseUrl}${path}`;
  }
};
