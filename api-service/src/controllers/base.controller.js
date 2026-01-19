const baseService = require('../services/base.service');

/**
 * 基础数据Controller
 * 处理城市、年级、科目等基础数据的请求
 */

/**
 * 获取城市列表
 */
exports.getCities = async (req, res) => {
  try {
    const cities = await baseService.getCities();
    
    res.json({
      code: 200,
      message: '获取成功',
      data: cities
    });
  } catch (error) {
    console.error('[base.controller.getCities] Error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

/**
 * 获取年级列表
 */
exports.getGrades = async (req, res) => {
  try {
    const grades = await baseService.getGrades();
    
    res.json({
      code: 200,
      message: '获取成功',
      data: grades
    });
  } catch (error) {
    console.error('[base.controller.getGrades] Error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

/**
 * 获取科目列表
 */
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await baseService.getSubjects();
    
    res.json({
      code: 200,
      message: '获取成功',
      data: subjects
    });
  } catch (error) {
    console.error('[base.controller.getSubjects] Error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};

/**
 * 根据城市获取标签
 */
exports.getTagsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const tags = await baseService.getTagsByCity(cityId);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: tags
    });
  } catch (error) {
    console.error('[base.controller.getTagsByCity] Error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};
