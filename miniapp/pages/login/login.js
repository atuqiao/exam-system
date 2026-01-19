const api = require('../../api/index.js')
const store = require('../../utils/store.js')

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 不自动跳转，让用户选择是否登录
    // 用户可以浏览，需要登录时（如下载）会提示
  },

  // 微信一键登录
  handleLogin() {
    if (this.data.loading) return

    this.setData({ loading: true })

    // 获取微信登录code
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('微信登录code:', res.code)
          this.doLogin(res.code)
        } else {
          console.error('获取微信登录code失败:', res.errMsg)
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      },
      fail: (err) => {
        console.error('wx.login失败:', err)
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    })
  },

  // 调用后端登录接口
  doLogin(code) {
    api.authApi.login({ code }).then(res => {
      console.log('登录成功:', res)

      // 保存token
      wx.setStorageSync('token', res.token)

      // 保存用户信息
      if (res.userInfo) {
        wx.setStorageSync('userInfo', res.userInfo)
        // 更新store中的用户信息
        store.setData('userInfo', res.userInfo)
      }

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/exams/exams'
        })
      }, 1500)
    }).catch(err => {
      console.error('登录失败:', err)
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none'
      })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 查看用户协议
  goToAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '1. 用户应遵守国家法律法规\n2. 禁止将下载的试卷用于商业用途\n3. 本平台保留最终解释权',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 查看隐私政策
  goToPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '1. 我们重视用户隐私保护\n2. 不会泄露用户个人信息\n3. 仅用于提供更好的服务',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
})
