const api = require('../../api/index.js')
const store = require('../../utils/store.js')

Page({
  data: {
    cities: [],
    grades: [],
    subjects: [],
    tags: [],
    allTags: [],
    filteredTags: [],
    examList: [],
    loading: false,
    hasMore: true,
    page: 1,
    selectedCity: {},
    selectedGrade: {},
    selectedSubject: {},
    selectedTag: {},
    tagIndex: 0,
    tagKeyword: '',
    // 下拉菜单状态
    showCityDropdown: false,
    showGradeDropdown: false,
    showSubjectDropdown: false,
    showDropdown: false
  },

  onLoad() {
    // 更新 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }

    this.loadBaseData()

    // 从store恢复选择状态
    const savedCity = store.getData('selectedCity')
    const savedGrade = store.getData('selectedGrade')
    const savedSubject = store.getData('selectedSubject')
    const savedTag = store.getData('selectedTag')

    if (savedCity && savedCity.id) {
      this.setData({ selectedCity: savedCity }, () => {
        if (savedCity.id) {
          this.loadTags(savedCity.id)
        }
      })
    }

    if (savedGrade && savedGrade.id) {
      this.setData({ selectedGrade: savedGrade })
    }

    if (savedSubject && savedSubject.id) {
      this.setData({ selectedSubject: savedSubject })
    }

    if (savedTag && savedTag.id) {
      this.setData({ selectedTag: savedTag })
    }

    // 如果都已选择，自动加载试卷
    if (savedCity && savedGrade && savedSubject && savedSubject.id) {
      this.loadExams()
    }
  },

  onShow() {
    // 页面显示时更新 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  // 加载基础数据
  loadBaseData() {
    Promise.all([
      api.baseApi.getCities(),
      api.baseApi.getGrades(),
      api.baseApi.getSubjects()
    ]).then(([cities, grades, subjects]) => {
      console.log('基础数据加载成功:', { cities, grades, subjects })
      this.setData({
        cities,
        grades,
        subjects
      })
    }).catch(err => {
      console.error('基础数据加载失败:', err)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    })
  },

  // 加载标签
  loadTags(cityId) {
    console.log('加载标签, cityId:', cityId)

    api.tagApi.getByCity(cityId, { type: 'region' }).then(tags => {
      console.log('标签加载成功, 数量:', tags?.length || 0)

      if (!tags || tags.length === 0) {
        console.warn('该城市暂无标签')
        this.setData({ tags: [], allTags: [], filteredTags: [], tagIndex: 0 })
        return
      }

      // 按别名去重，保留每个别名的一个标签
      const uniqueTags = []
      const aliasMap = new Map()

      tags.forEach(tag => {
        const alias = tag.alias || tag.name
        if (!aliasMap.has(alias)) {
          aliasMap.set(alias, tag)
          uniqueTags.push(tag)
        }
      })

      console.log('去重后标签数:', uniqueTags.length)

      // 添加"全部"选项
      const allTags = [{ id: 0, name: '全部区域' }, ...uniqueTags]

      // 找到当前选中标签的索引
      const selectedTag = this.data.selectedTag || {}
      let tagIndex = 0
      if (selectedTag.id) {
        const index = allTags.findIndex(t => t.id === selectedTag.id)
        if (index !== -1) {
          tagIndex = index
        }
      }

      this.setData({
        tags: uniqueTags,
        allTags: allTags,
        filteredTags: uniqueTags,
        tagIndex: tagIndex
      })
    }).catch(err => {
      console.error('标签加载失败:', err)
      this.setData({ tags: [], allTags: [], filteredTags: [] })
    })
  },

  // 标签搜索
  onTagSearch(e) {
    const keyword = e.detail.value
    this.setData({ tagKeyword: keyword })

    // 过滤标签
    const filteredTags = this.filterTags(this.data.tags, keyword)
    this.setData({ filteredTags })
  },

  // 过滤标签（支持名称和别名搜索）
  filterTags(tags, keyword) {
    if (!keyword || !keyword.trim()) {
      return tags
    }

    const lowerKeyword = keyword.toLowerCase().trim()
    return tags.filter(tag => {
      const nameMatch = tag.name && tag.name.toLowerCase().includes(lowerKeyword)
      const aliasMatch = tag.alias && tag.alias.toLowerCase().includes(lowerKeyword)
      return nameMatch || aliasMatch
    })
  },

  // 城市选择
  onCityChange(e) {
    const index = parseInt(e.detail.value)
    const selectedCity = this.data.cities[index]

    console.log('选择城市:', selectedCity, 'index:', index)

    if (!selectedCity) {
      console.warn('城市数据不存在')
      return
    }

    this.setData({
      selectedCity,
      selectedTag: {},
      tagIndex: 0,
      page: 1,
      examList: []
    })

    store.setData('selectedCity', selectedCity)
    store.setData('selectedTag', {})

    // 加载该城市的标签
    if (selectedCity.id) {
      this.loadTags(selectedCity.id)
    }

    // 如果已选择年级和科目，重新加载试卷
    if (this.data.selectedGrade.id && this.data.selectedSubject.id) {
      this.loadExams()
    }
  },

  // 年级选择
  onGradeChange(e) {
    const index = parseInt(e.detail.value)
    const selectedGrade = this.data.grades[index]

    console.log('选择年级:', selectedGrade, 'index:', index)

    if (!selectedGrade) {
      console.warn('年级数据不存在')
      return
    }

    this.setData({
      selectedGrade,
      page: 1,
      examList: []
    })

    store.setData('selectedGrade', selectedGrade)

    // 如果已选择城市和科目，重新加载试卷
    if (this.data.selectedCity.id && this.data.selectedSubject.id) {
      this.loadExams()
    }
  },

  // 科目选择
  onSubjectChange(e) {
    const index = parseInt(e.detail.value)
    const selectedSubject = this.data.subjects[index]

    console.log('选择科目:', selectedSubject, 'index:', index)

    if (!selectedSubject) {
      console.warn('科目数据不存在')
      return
    }

    this.setData({
      selectedSubject,
      page: 1,
      examList: []
    })

    store.setData('selectedSubject', selectedSubject)

    // 如果已选择城市和年级，重新加载试卷
    if (this.data.selectedCity.id && this.data.selectedGrade.id) {
      this.loadExams()
    }
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
      selectedTag: {},
      tagIndex: 0,
      page: 1,
      examList: [],
      showCityDropdown: false,
      showDropdown: false
    })

    store.setData('selectedCity', city)
    store.setData('selectedTag', {})

    // 加载该城市的标签
    if (city.id) {
      this.loadTags(city.id)
    }

    // 如果已选择年级和科目，重新加载试卷
    if (this.data.selectedGrade.id && this.data.selectedSubject.id) {
      this.loadExams()
    }
  },

  // 选择年级
  selectGrade(e) {
    const grade = e.currentTarget.dataset.item

    console.log('选择年级:', grade)

    if (!grade || !grade.id) {
      console.warn('年级数据不存在')
      return
    }

    this.setData({
      selectedGrade: grade,
      page: 1,
      examList: [],
      showGradeDropdown: false,
      showDropdown: false
    })

    store.setData('selectedGrade', grade)

    // 如果已选择城市和科目，重新加载试卷
    if (this.data.selectedCity.id && this.data.selectedSubject.id) {
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

    store.setData('selectedSubject', subject)

    // 如果已选择城市和年级，重新加载试卷
    if (this.data.selectedCity.id && this.data.selectedGrade.id) {
      this.loadExams()
    }
  },

  // 选择标签
  selectTag(e) {
    const tag = e.currentTarget.dataset.tag

    console.log('选择标签:', tag)

    // 如果选择的是"全部",则清空筛选
    if (tag === 'all') {
      this.setData({
        selectedTag: {},
        tagIndex: 0,
        page: 1
      })
      store.setData('selectedTag', {})
    } else {
      // 找到当前选中标签的索引
      const index = this.data.allTags.findIndex(t => t.id === tag.id)

      this.setData({
        selectedTag: tag,
        tagIndex: index,
        page: 1
      })
      store.setData('selectedTag', tag)
    }

    // 如果已选择科目,重新加载试卷
    if (this.data.selectedSubject?.id) {
      console.log('重新加载试卷')
      this.loadExams()
    }
  },

  // 关闭所有下拉菜单
  closeAllDropdowns() {
    this.setData({
      showCityDropdown: false,
      showGradeDropdown: false,
      showSubjectDropdown: false,
      showDropdown: false
    })
  },

  // 加载试卷列表
  loadExams() {
    const { selectedCity, selectedGrade, selectedSubject, selectedTag, page } = this.data

    if (!selectedCity.id || !selectedGrade.id || !selectedSubject.id) {
      console.log('城市、年级、科目未全部选择，暂不加载试卷')
      return
    }

    if (this.data.loading) return

    this.setData({ loading: true })

    const params = {
      cityId: selectedCity.id,
      gradeId: selectedGrade.id,
      subjectId: selectedSubject.id,
      page: page,
      limit: 20
    }

    // 如果选择了区域标签，添加tagId参数
    if (selectedTag.id && selectedTag.id !== 0) {
      params.tagId = selectedTag.id
    }

    console.log('加载试卷列表, params:', params)

    api.examApi.getList(params).then(res => {
      console.log('试卷列表加载成功:', res.list.length, '条')

      const newList = page === 1 ? res.list : this.data.examList.concat(res.list)

      this.setData({
        examList: newList,
        hasMore: res.list.length === res.limit,
        loading: false
      })
    }).catch(err => {
      console.error('试卷列表加载失败:', err)
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

  // 页面触底加载更多
  onReachBottom() {
    console.log('触底加载更多')
    this.loadMore()
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

    console.log('exam对象:', exam)
    console.log('exam.city_id:', exam.city_id)
    console.log('exam.grade_id:', exam.grade_id)
    console.log('exam.subject_id:', exam.subject_id)

    const params = {
      cityId: exam.city_id,
      gradeId: exam.grade_id,
      subjectId: exam.subject_id
    }

    console.log('开通科目参数:', params)

    // 检查参数是否完整
    if (!params.cityId || !params.gradeId || !params.subjectId) {
      wx.hideLoading()
      wx.showToast({ title: '参数不完整，请重新选择试卷', icon: 'none' })
      return
    }

    api.subjectApi.open(params).then(() => {
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
