/**
 * 试卷下载工具函数
 * 统一处理试卷下载、权限验证、科目开通等逻辑
 */

const api = require('../api/index.js')

/**
 * 下载试卷统一处理函数
 * @param {Object} exam - 试卷信息
 * @param {String} type - 下载类型 'original' | 'answer'
 * @returns {Promise}
 */
const downloadExam = async (exam, type = 'original') => {
  try {
    // 1. 检查科目开通状态
    const checkRes = await api.subjectApi.check({
      cityId: exam.city_id,
      gradeId: exam.grade_id,
      subjectId: exam.subject_id
    })

    // 2. 如果未开通，询问是否开通
    if (!checkRes.opened) {
      const confirm = await showConfirmDialog(
        '提示',
        '下载需要开通该科目（50积分），是否开通？\n\n积分不足请加微信：wind1262918032'
      )

      if (confirm) {
        await openSubject(exam)
      } else {
        return
      }
    }

    // 3. 开始下载
    await performDownload(exam.id, type)

  } catch (error) {
    handleDownloadError(error)
  }
}

/**
 * 执行下载操作
 * @param {Number} examId - 试卷ID
 * @param {String} type - 下载类型
 */
const performDownload = async (examId, type) => {
  wx.showLoading({ title: '准备下载...' })

  try {
    // 获取下载链接
    const res = await api.examApi.download(examId, { type })
    
    // 下载文件
    const downloadRes = await new Promise((resolve, reject) => {
      wx.downloadFile({
        url: res.downloadUrl,
        success: resolve,
        fail: reject
      })
    })

    wx.hideLoading()

    // 打开文件
    if (downloadRes.statusCode === 200) {
      await openDocument(downloadRes.tempFilePath)
    } else {
      throw new Error('下载失败')
    }

  } catch (error) {
    wx.hideLoading()
    throw error
  }
}

/**
 * 打开文档
 * @param {String} filePath - 文件路径
 */
const openDocument = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.openDocument({
      filePath: filePath,
      showMenu: true,
      success: resolve,
      fail: (err) => {
        console.error('文件打开失败:', err)
        wx.showToast({
          title: '文件打开失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * 开通科目
 * @param {Object} exam - 试卷信息
 */
const openSubject = async (exam) => {
  wx.showLoading({ title: '开通中...' })

  try {
    await api.subjectApi.open({
      cityId: exam.city_id,
      gradeId: exam.grade_id,
      subjectId: exam.subject_id
    })

    wx.hideLoading()
    wx.showToast({
      title: '开通成功',
      icon: 'success'
    })

  } catch (error) {
    wx.hideLoading()

    if (error.code === 400) {
      // 积分不足时显示模态对话框
      wx.showModal({
        title: '积分不足',
        content: '您的积分不足，请联系管理员充值\n\n积分加微信：wind1262918032',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#07c160'
      })
    } else {
      wx.showToast({
        title: '开通失败',
        icon: 'none'
      })
    }

    throw error
  }
}

/**
 * 显示确认对话框
 * @param {String} title - 标题
 * @param {String} content - 内容
 * @returns {Promise<Boolean>}
 */
const showConfirmDialog = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false)
    })
  })
}

/**
 * 处理下载错误
 * @param {Error} error - 错误对象
 */
const handleDownloadError = (error) => {
  console.error('下载错误:', error)
  
  if (error.code === 403) {
    wx.showToast({ 
      title: '请先开通该科目', 
      icon: 'none' 
    })
  } else if (error.code === 404) {
    wx.showToast({ 
      title: '该试卷暂无解析版', 
      icon: 'none' 
    })
  } else if (error.message === '下载失败') {
    wx.showToast({ 
      title: '下载失败，请重试', 
      icon: 'none' 
    })
  } else {
    wx.showToast({ 
      title: '操作失败', 
      icon: 'none' 
    })
  }
}

module.exports = {
  downloadExam
}
