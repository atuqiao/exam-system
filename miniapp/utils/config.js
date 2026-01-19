// 配置文件
const config = {
  // API基础URL
  baseURL: 'http://localhost:3000/api',

  // 开发环境配置
  dev: {
    baseURL: 'http://localhost:3000/api'
  },

  // 生产环境配置（需要替换为实际的服务器地址）
  prod: {
    baseURL: 'https://your-domain.com/api'
  }
}

// 根据环境获取配置
const getConfig = () => {
  // 小程序生产环境
  // 可以通过版本类型判断
  const accountInfo = wx.getAccountInfoSync()
  if (accountInfo.miniProgram.envVersion === 'release') {
    return config.prod
  }
  return config.dev
}

module.exports = getConfig()
