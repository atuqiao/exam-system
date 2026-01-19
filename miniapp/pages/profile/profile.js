const api = require('../../api/index.js')

Page({
  data: {
    userInfo: {},
    openedCount: 0,
    downloadCount: 0
  },

  onLoad() {
    // 更新 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }

    this.loadUserInfo()
    this.loadStats()
  },

  onShow() {
    // 页面显示时更新 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }

    // 每次显示页面时刷新数据
    this.loadUserInfo()
    this.loadStats()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')

    if (userInfo) {
      console.log('本地用户信息:', userInfo)
      this.setData({ userInfo })
    }

    // 从服务器获取最新用户信息
    api.authApi.getUserInfo().then(user => {
      console.log('服务器用户信息:', user)
      this.setData({ userInfo })
      wx.setStorageSync('userInfo', user)
    }).catch(err => {
      console.error('获取用户信息失败:', err)
      // 如果是未登录错误，静默处理，不清除本地数据（用于展示）
      if (err.code !== 401) {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  },

  // 加载统计信息
  loadStats() {
    // 获取已开通科目数量
    api.subjectApi.getOpened().then(list => {
      console.log('已开通科目:', list.length)
      this.setData({ openedCount: list.length })
    }).catch(err => {
      console.error('获取已开通科目失败:', err)
      // 未登录时静默处理
      if (err.code !== 401) {
        wx.showToast({
          title: '获取已开通科目失败',
          icon: 'none'
        })
      }
    })

    // 获取下载记录数量
    api.examApi.getDownloads({ page: 1, limit: 1 }).then(res => {
      console.log('下载记录总数:', res.total)
      this.setData({ downloadCount: res.total })
    }).catch(err => {
      console.error('获取下载记录失败:', err)
      // 未登录时静默处理
      if (err.code !== 401) {
        wx.showToast({
          title: '获取下载记录失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到下载记录页面
  goToDownloads() {
    wx.navigateTo({
      url: '/pages/profile/downloads'
    })
  },

  // 跳转到已开通科目页面
  goToSubjects() {
    wx.navigateTo({
      url: '/pages/profile/subjects'
    })
  },

  // 跳转到联系客服页面
  goToContact() {
    wx.navigateTo({
      url: '/pages/profile/contact'
    })
  },

  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清除本地存储
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')

            // 清除store中的用户信息
            const store = require('../../utils/store.js')
            store.clearUserInfo()

            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })

            // 重新加载页面数据
            setTimeout(() => {
              this.loadUserInfo()
              this.loadStats()
            }, 1000)
          } catch (err) {
            console.error('退出登录失败:', err)
            wx.showToast({
              title: '退出登录失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
