const api = require('../../api/index.js')
const store = require('../../utils/store.js')

Page({
  data: {
    cities: [],
    subjects: [],
    examList: [],
    examTypes: [
      { id: 1, name: '中考' },
      { id: 2, name: '高考' }
    ],
    loading: false,
    hasMore: true,
    page: 1,
    selectedCity: {},
    selectedSubject: {},
    selectedExamType: {},
    examTypeIndex: 0,
    // 下拉菜单状态
    showCityDropdown: false,
    showSubjectDropdown: false,
    showDropdown: false
  },

  onLoad() {
    // 更新 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }

    this.loadBaseData()
  },

  onShow() {
    // 页面显示时更新 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  // 加载基础数据
  loadBaseData() {
    Promise.all([
      api.baseApi.getCities(),
      api.baseApi.getSubjects()
    ]).then(([cities, subjects]) => {
      console.log('基础数据加载成功:', { cities, subjects })

      // 查找北京（假设北京的name是'北京'）
      const beijing = cities.find(c => c.name === '北京') || cities[0]

      this.setData({
        cities,
        subjects
      })

      // 从store恢复选择状态
      const savedCity = store.getData('mockSelectedCity')
      const savedSubject = store.getData('mockSelectedSubject')
      const savedExamType = store.getData('mockSelectedExamType')

      // 恢复城市选择，如果没有则使用北京
      let selectedCity = savedCity
      if (!selectedCity || !selectedCity.id) {
        selectedCity = beijing
      }

      if (selectedCity && selectedCity.id) {
        this.setData({ selectedCity })
      }

      // 恢复其他选择状态
      if (savedSubject && savedSubject.id) {
        this.setData({ selectedSubject: savedSubject })
      }

      if (savedExamType && savedExamType.id) {
        this.setData({ selectedExamType: savedExamType })
      }

      // 如果都已选择，自动加载试卷
      if (selectedCity && selectedCity.id && savedSubject && savedSubject.id) {
        this.loadExams()
      }
    }).catch(err => {
      console.error('基础数据加载失败:', err)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    })
  },

  // 切换下拉菜单显示/隐藏
  toggleDropdown(e) {
    const type = e.currentTarget.dataset.type
    const stateKey = `show${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`
    const isOpened = this.data[stateKey]

    // 关闭所有下拉菜单
    this.closeAllDropdowns()

    // 如果之前未打开，则打开当前下拉菜单
    if (!isOpened) {
      this.setData({
        [stateKey]: true,
        showDropdown: true
      })
    }
  },

  // 选择城市
  selectCity(e) {
    const city = e.currentTarget.dataset.item

    console.log('选择城市:', city)

    if (!city || !city.id) {
      console.warn('城市数据不存在')
      return
    }

    this.setData({
      selectedCity: city,
      page: 1,
      examList: [],
      showCityDropdown: false,
      showDropdown: false
    })

    store.setData('mockSelectedCity', city)

    // 如果已选择科目，重新加载试卷
    if (this.data.selectedSubject.id) {
      this.loadExams()
    }
  },

  // 选择科目
  selectSubject(e) {
    const subject = e.currentTarget.dataset.item

    console.log('选择科目:', subject)

    if (!subject || !subject.id) {
      console.warn('科目数据不存在')
      return
    }

    this.setData({
      selectedSubject: subject,
      page: 1,
      examList: [],
      showSubjectDropdown: false,
      showDropdown: false
    })

    store.setData('mockSelectedSubject', subject)

    // 如果已选择城市，重新加载试卷
    if (this.data.selectedCity.id) {
      this.loadExams()
    }
  },

  // 选择考试类型（中考/高考）
  selectExamType(e) {
    const examType = e.currentTarget.dataset.type

    console.log('选择考试类型:', examType)

    // 如果点击已选中的，则取消选择
    if (this.data.selectedExamType.id === examType.id) {
      this.setData({
        selectedExamType: {},
        page: 1
      })
      store.setData('mockSelectedExamType', {})
    } else {
      this.setData({
        selectedExamType: examType,
        page: 1
      })
      store.setData('mockSelectedExamType', examType)
    }

    // 如果已选择城市和科目，重新加载试卷
    if (this.data.selectedCity.id && this.data.selectedSubject.id) {
      this.loadExams()
    }
  },

  // 关闭所有下拉菜单
  closeAllDropdowns() {
    this.setData({
      showCityDropdown: false,
      showSubjectDropdown: false,
      showDropdown: false
    })
  },

  // 加载试卷列表
  loadExams() {
    const { selectedCity, selectedSubject, selectedExamType, page } = this.data

    if (!selectedCity.id || !selectedSubject.id) {
      console.log('城市、科目未全部选择，暂不加载试卷')
      return
    }

    if (this.data.loading) return

    this.setData({ loading: true })

    const params = {
      cityId: selectedCity.id,
      subjectId: selectedSubject.id,
      page: page,
      limit: 20
    }

    // 如果选择了考试类型（中考/高考），添加examType参数
    if (selectedExamType.id && selectedExamType.id !== 0) {
      params.examType = selectedExamType.id
    }

    console.log('加载模考试卷列表, params:', params)

    api.examApi.getList(params).then(res => {
      console.log('模考试卷列表加载成功:', res.list.length, '条')

      const newList = page === 1 ? res.list : this.data.examList.concat(res.list)

      this.setData({
        examList: newList,
        hasMore: res.list.length === res.limit,
        loading: false
      })
    }).catch(err => {
      console.error('模考试卷列表加载失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    })
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return

    console.log('加载更多, 当前页:', this.data.page)

    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadExams()
    })
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/exams/detail?id=${id}`
    })
  },

  // 下载试卷
  onDownload(e) {
    const exam = e.currentTarget.dataset.exam
    console.log('下载试卷:', exam)

    // 检查是否已开通科目
    api.subjectApi.check({
      cityId: exam.city_id,
      gradeId: exam.grade_id,
      subjectId: exam.subject_id
    }).then(res => {
      if (res.opened) {
        // 已开通，直接下载
        this.downloadExam(exam.id, 'original')
      } else {
        // 未开通，提示开通
        wx.showModal({
          title: '提示',
          content: '下载需要开通该科目（50积分），是否开通？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.openSubject(exam)
            }
          }
        })
      }
    }).catch(err => {
      console.error('检查开通状态失败:', err)
      if (err.code === 401) {
        // 未登录，提示登录
        wx.showModal({
          title: '提示',
          content: '请先登录后再进行下载',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.navigateTo({
                url: '/pages/login/login'
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: err.message || '检查失败',
          icon: 'none'
        })
      }
    })
  },

  // 下载解析
  onDownloadAnswer(e) {
    const exam = e.currentTarget.dataset.exam
    console.log('下载解析:', exam)

    // 检查是否已开通科目
    api.subjectApi.check({
      cityId: exam.city_id,
      gradeId: exam.grade_id,
      subjectId: exam.subject_id
    }).then(res => {
      if (res.opened) {
        // 已开通，直接下载
        this.downloadExam(exam.id, 'answer')
      } else {
        // 未开通，提示开通
        wx.showModal({
          title: '提示',
          content: '下载需要开通该科目（50积分），是否开通？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.openSubject(exam, 'answer')
            }
          }
        })
      }
    }).catch(err => {
      console.error('检查开通状态失败:', err)
      if (err.code === 401) {
        // 未登录，提示登录
        wx.showModal({
          title: '提示',
          content: '请先登录后再进行下载',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.navigateTo({
                url: '/pages/login/login'
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: err.message || '检查失败',
          icon: 'none'
        })
      }
    })
  },

  // 开通科目
  openSubject(exam, type = 'original') {
    wx.showLoading({ title: '开通中...' })

    console.log('开通科目参数:', {
      cityId: exam.city_id,
      gradeId: exam.grade_id,
      subjectId: exam.subject_id
    })

    api.subjectApi.open({
      cityId: exam.city_id,
      gradeId: exam.grade_id,
      subjectId: exam.subject_id
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '开通成功', icon: 'success' })
      this.downloadExam(exam.id, type)
    }).catch(err => {
      wx.hideLoading()
      console.error('开通失败:', err)
      if (err.code === 400) {
        wx.showToast({ title: err.message || '积分不足', icon: 'none' })
      } else {
        wx.showToast({ title: err.message || '开通失败', icon: 'none' })
      }
    })
  },

  // 下载试卷文件
  downloadExam(examId, type) {
    wx.showLoading({ title: '准备下载...' })

    api.examApi.download(examId, { type }).then(res => {
      wx.hideLoading()

      console.log('下载URL:', res.downloadUrl)

      wx.downloadFile({
        url: res.downloadUrl,
        success: (downloadRes) => {
          if (downloadRes.statusCode === 200) {
            wx.openDocument({
              filePath: downloadRes.tempFilePath,
              showMenu: true,
              success: () => {
                console.log('文件打开成功')
              },
              fail: (err) => {
                console.error('文件打开失败:', err)
                wx.showToast({
                  title: '文件打开失败',
                  icon: 'none'
                })
              }
            })
          } else {
            wx.showToast({
              title: '下载失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('下载失败:', err)
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          })
        }
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('获取下载链接失败:', err)
      if (err.code === 403) {
        wx.showToast({ title: '请先开通该科目', icon: 'none' })
      } else if (err.code === 404) {
        wx.showToast({ title: '该试卷暂无解析版', icon: 'none' })
      } else {
        wx.showToast({ title: '获取下载链接失败', icon: 'none' })
      }
    })
  }
})
