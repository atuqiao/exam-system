/**
 * 科目管理控制器
 */
const AdminBaseController = require('../adminBase.controller');

class SubjectController extends AdminBaseController {
  constructor() {
    super('subjects');
  }
}

module.exports = new SubjectController();
