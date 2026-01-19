const api = require('../../api/index.js')

Page({
  data: {
    subjectList: [],
    loading: false
  },

  onLoad() {
    this.loadSubjects()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadSubjects()
  },

  // 加载已开通科目
  loadSubjects() {
    if (this.data.loading) return

    this.setData({ loading: true })

    api.subjectApi.getOpened().then(list => {
      // 格式化时间
      const formattedList = list.map(item => {
        const date = new Date(item.open_time)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        return {
          ...item,
          open_time_text: `${year}-${month}-${day} ${hour}:${minute}`
        }
      })

      this.setData({
        subjectList: formattedList,
        loading: false
      })
    }).catch(err => {
      console.error('获取已开通科目失败:', err)
      this.setData({ loading: false })

      if (err.code === 401) {
        wx.showModal({
          title: '提示',
          content: '请先登录后再查看已开通科目',
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
          title: err.message || '获取已开通科目失败',
          icon: 'none'
        })
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadSubjects()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
