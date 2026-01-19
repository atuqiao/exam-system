// 简单的状态管理工具
class Store {
  constructor() {
    this.state = {
      userInfo: null,
      token: '',
      selectedCity: null,
      selectedGrade: null,
      selectedSubject: null,
      selectedTag: null,
      cities: [],
      grades: [],
      subjects: []
    }
  }

  // 初始化：从本地存储恢复数据
  init() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      const selectedCity = wx.getStorageSync('selectedCity')
      const selectedGrade = wx.getStorageSync('selectedGrade')
      const selectedSubject = wx.getStorageSync('selectedSubject')
      const selectedTag = wx.getStorageSync('selectedTag')

      if (userInfo) this.state.userInfo = userInfo
      if (token) this.state.token = token
      if (selectedCity) this.state.selectedCity = selectedCity
      if (selectedGrade) this.state.selectedGrade = selectedGrade
      if (selectedSubject) this.state.selectedSubject = selectedSubject
      if (selectedTag) this.state.selectedTag = selectedTag
    } catch (e) {
      console.error('初始化状态失败', e)
    }
  }

  // 设置数据并同步到本地存储
  setData(key, value) {
    this.state[key] = value
    try {
      wx.setStorageSync(key, value)
    } catch (e) {
      console.error('存储数据失败', e)
    }
  }

  // 获取数据
  getData(key) {
    return this.state[key]
  }

  // 设置用户信息
  setUserInfo(userInfo) {
    this.setData('userInfo', userInfo)
  }

  // 设置token
  setToken(token) {
    this.setData('token', token)
  }

  // 清除用户信息
  clearUserInfo() {
    this.state.userInfo = null
    this.state.token = ''
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('token')
  }

  // 设置选择的城市
  setSelectedCity(city) {
    this.setData('selectedCity', city)
  }

  // 设置选择的年级
  setSelectedGrade(grade) {
    this.setData('selectedGrade', grade)
  }

  // 设置选择的科目
  setSelectedSubject(subject) {
    this.setData('selectedSubject', subject)
  }

  // 设置选择的标签
  setSelectedTag(tag) {
    this.setData('selectedTag', tag)
  }

  // 设置模考页面的选择
  setMockSelectedCity(city) {
    this.setData('mockSelectedCity', city)
  }

  setMockSelectedSubject(subject) {
    this.setData('mockSelectedSubject', subject)
  }

  setMockSelectedTag(tag) {
    this.setData('mockSelectedTag', tag)
  }

  setMockSelectedExamType(examType) {
    this.setData('mockSelectedExamType', examType)
  }

  setMockSelectedExamTypeTag(examTypeTag) {
    this.setData('mockSelectedExamTypeTag', examTypeTag)
  }

  // 设置基础数据
  setCities(cities) {
    this.state.cities = cities
  }

  setGrades(grades) {
    this.state.grades = grades
  }

  setSubjects(subjects) {
    this.state.subjects = subjects
  }

  // 是否已登录
  isLoggedIn() {
    return !!this.state.token
  }

  // 获取用户积分
  getUserPoints() {
    return this.state.userInfo?.points || 0
  }

  // 登录
  login(userInfo, token) {
    this.setUserInfo(userInfo)
    this.setToken(token)
  }

  // 退出登录
  logout() {
    this.clearUserInfo()
  }
}

const store = new Store()

module.exports = store
