// 请求封装
const config = require('./config.js')

const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('token') || ''

    const fullUrl = config.baseURL + options.url
    console.log('[request] 请求:', options.method || 'GET', fullUrl)
    if (options.data && Object.keys(options.data).length > 0) {
      console.log('[request] 参数:', options.data)
    }

    wx.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        console.log('[request] 响应:', res.statusCode, res.data)
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data)
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // token过期或未登录
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')

          // 检查是否是需要强制登录的操作（如下载）
          const requireAuth = options.requireAuth || false

          if (requireAuth) {
            // 需要登录的操作，跳转到登录页面
            wx.showModal({
              title: '提示',
              content: '请先登录后再进行此操作',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.navigateTo({
                    url: '/pages/login/login'
                  })
                }
              }
            })
          } else {
            // 非强制登录的操作，静默处理或显示提示
            // 不自动跳转，让用户可以继续浏览
          }
          reject(res.data)
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        console.error('[request] 失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = request
