// 测试数据

module.exports = {
  // 试卷数据
  mockExams: [
    {
      id: 1,
      title: '2024年北京中考数学试卷',
      year: 2024,
      semester: '上学期',
      file_type: 'pdf',
      file_url: '/downloads/2024-beijing-math.pdf',
      download_count: 100,
      featured: 1,
      answer_url: '/downloads/2024-beijing-math-answer.pdf',
      city_id: 1,
      grade_id: 9,
      subject_id: 1,
      tag_id: 1,
      exam_type_id: 1,
      status: 1
    },
    {
      id: 2,
      title: '2024年上海高考物理试卷',
      year: 2024,
      semester: '下学期',
      file_type: 'pdf',
      file_url: '/downloads/2024-shanghai-physics.pdf',
      download_count: 200,
      featured: 0,
      answer_url: '/downloads/2024-shanghai-physics-answer.pdf',
      city_id: 2,
      grade_id: 12,
      subject_id: 2,
      tag_id: 2,
      exam_type_id: 2,
      status: 1
    }
  ],

  // 城市数据
  mockCities: [
    { id: 1, name: '北京' },
    { id: 2, name: '上海' },
    { id: 3, name: '广州' }
  ],

  // 年级数据
  mockGrades: [
    { id: 7, name: '七年级' },
    { id: 8, name: '八年级' },
    { id: 9, name: '九年级' },
    { id: 10, name: '高一' },
    { id: 11, name: '高二' },
    { id: 12, name: '高三' }
  ],

  // 科目数据
  mockSubjects: [
    { id: 1, name: '语文' },
    { id: 2, name: '数学' },
    { id: 3, name: '英语' },
    { id: 4, name: '物理' },
    { id: 5, name: '化学' },
    { id: 6, name: '生物' }
  ],

  // 标签数据
  mockTags: [
    { id: 1, name: '海淀区', alias: 'haidian', city_id: 1 },
    { id: 2, name: '浦东新区', alias: 'pudong', city_id: 2 },
    { id: 3, name: '天河区', alias: 'tianhe', city_id: 3 }
  ],

  // 用户数据
  mockUsers: [
    {
      id: 1,
      openid: 'test-openid-1',
      nickname: '测试用户1',
      avatar_url: 'https://example.com/avatar1.jpg',
      created_at: new Date()
    }
  ],

  // API 响应示例
  mockResponse: {
    success: {
      code: 200,
      message: '操作成功',
      data: {}
    },
    error: {
      code: 500,
      message: '服务器错误'
    },
    notFound: {
      code: 404,
      message: '资源不存在'
    },
    badRequest: {
      code: 400,
      message: '参数错误'
    }
  }
};
