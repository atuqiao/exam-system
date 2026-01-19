const api = require('../../api/index.js')

Page({
  data: {
    downloadList: [],
    page: 1,
    limit: 20,
    total: 0,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadDownloads()
  },

  onShow() {
    // 每次显示时刷新数据
    this.setData({ page: 1, downloadList: [], hasMore: true })
    this.loadDownloads()
  },

  // 加载下载记录
  loadDownloads() {
    if (this.data.loading) return

    this.setData({ loading: true })

    api.examApi.getDownloads({
      page: this.data.page,
      limit: this.data.limit
    }).then(res => {
      const newList = this.data.page === 1 ? res.list : [...this.data.downloadList, ...res.list]
      this.setData({
        downloadList: newList,
        total: res.total,
        hasMore: res.list.length >= this.data.limit,
        loading: false
      })
    }).catch(err => {
      console.error('获取下载记录失败:', err)
      this.setData({ loading: false })

      if (err.code === 401) {
        wx.showModal({
          title: '提示',
          content: '请先登录后再查看下载记录',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/login/login' })
            } else {
              wx.navigateBack()
            }
          }
        })
      } else {
        wx.showToast({
          title: err.message || '获取下载记录失败',
          icon: 'none'
        })
      }
    })
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return

    this.setData({ page: this.data.page + 1 })
    this.loadDownloads()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, downloadList: [], hasMore: true })
    this.loadDownloads()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadMore()
  }
})
