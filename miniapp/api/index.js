const request = require('../utils/request.js')

// 认证相关API
const authApi = {
  // 微信登录
  login: (data) => request({
    url: '/auth/login',
    method: 'POST',
    data
  }),

  // 获取用户信息
  getUserInfo: () => request({
    url: '/auth/userinfo',
    method: 'GET'
  }),

  // 更新用户信息
  updateUserInfo: (data) => request({
    url: '/auth/userinfo',
    method: 'PUT',
    data
  })
}

// 基础数据API
const baseApi = {
  // 获取城市列表
  getCities: () => request({
    url: '/cities',
    method: 'GET'
  }),

  // 获取年级列表
  getGrades: () => request({
    url: '/grades',
    method: 'GET'
  }),

  // 获取科目列表
  getSubjects: () => request({
    url: '/subjects',
    method: 'GET'
  })
}

// 试卷相关API
const examApi = {
  // 获取试卷列表
  getList: (params) => request({
    url: '/exams',
    method: 'GET',
    data: params
  }),

  // 获取试卷详情
  getDetail: (id) => request({
    url: `/exams/${id}`,
    method: 'GET'
  }),

  // 下载试卷
  download: (id, options = {}) => {
    // 将参数转换为查询字符串
    const query = Object.keys(options)
      .filter(key => key !== 'requireAuth') // 过滤掉 requireAuth 选项
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options[key])}`)
      .join('&')
    const url = query ? `/exams/${id}/download?${query}` : `/exams/${id}/download`

    return request({
      url: url,
      method: 'POST',
      requireAuth: options.requireAuth !== false // 默认需要登录
    })
  },

  // 搜索试卷
  search: (keyword, params) => request({
    url: '/exams/search',
    method: 'GET',
    data: { keyword, ...params }
  }),

  // 获取下载记录
  getDownloads: (params) => request({
    url: '/exams/downloads',
    method: 'GET',
    data: params
  })
}

// 精选资料API
const featuredApi = {
  // 获取精选资料列表
  getList: (params) => request({
    url: '/featured',
    method: 'GET',
    data: params
  }),

  // 获取精选资料详情
  getDetail: (id) => request({
    url: `/featured/${id}`,
    method: 'GET'
  })
}

// 科目相关API
const subjectApi = {
  // 开通科目
  open: (data) => request({
    url: '/subjects/open',
    method: 'POST',
    data
  }),

  // 获取已开通科目
  getOpened: () => request({
    url: '/subjects/opened',
    method: 'GET'
  }),

  // 检查科目是否已开通
  check: (params) => request({
    url: '/subjects/check',
    method: 'GET',
    data: params
  })
}

// 标签相关API
const tagApi = {
  // 根据城市获取标签
  getByCity: (cityId, params = {}) => request({
    url: `/tags/city/${cityId}`,
    method: 'GET',
    data: params
  }),

  // 获取所有标签
  getAll: () => request({
    url: '/tags',
    method: 'GET'
  })
}

// AI问答API
const aiApi = {
  // 文本问答
  askText: (data) => request({
    url: '/ai/ask/text',
    method: 'POST',
    data
  }),

  // 图片识别
  askImage: (data) => request({
    url: '/ai/ask/image',
    method: 'POST',
    data
  })
}

module.exports = {
  authApi,
  baseApi,
  examApi,
  featuredApi,
  subjectApi,
  tagApi,
  aiApi
}
