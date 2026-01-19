/**
 * 生成管理页面
 * 使用方法: node generate_pages.js
 */

const fs = require('fs');
const path = require('path');

const pages = [
  {
    name: 'grades',
    title: '年级管理',
    apiBase: '/api/admin/grades',
    fields: [
      { key: 'name', label: '年级名称', type: 'text', required: true },
      { key: 'level', label: '年级层级', type: 'select', options: [{value: 1, label: '小学'}, {value: 2, label: '初中'}, {value: 3, label: '高中'}], required: true },
      { key: 'sort_order', label: '排序顺序', type: 'number', default: 0 },
      { key: 'status', label: '状态', type: 'select', options: [{value: 1, label: '启用'}, {value: 0, label: '禁用'}], default: 1 }
    ],
    tableColumns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '年级名称' },
      { key: 'level', label: '层级', format: (val) => ({1: '小学', 2: '初中', 3: '高中'}[val]) },
      { key: 'sort_order', label: '排序' },
      { key: 'status', label: '状态', type: 'status' }
    ]
  },
  {
    name: 'subjects',
    title: '科目管理',
    apiBase: '/api/admin/subjects',
    fields: [
      { key: 'name', label: '科目名称', type: 'text', required: true },
      { key: 'icon', label: '图标URL', type: 'text' },
      { key: 'sort_order', label: '排序顺序', type: 'number', default: 0 },
      { key: 'status', label: '状态', type: 'select', options: [{value: 1, label: '启用'}, {value: 0, label: '禁用'}], default: 1 }
    ],
    tableColumns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '科目名称' },
      { key: 'icon', label: '图标' },
      { key: 'sort_order', label: '排序' },
      { key: 'status', label: '状态', type: 'status' }
    ]
  },
  {
    name: 'tags',
    title: '标签管理',
    apiBase: '/api/admin/tags',
    fields: [
      { key: 'city_id', label: '所属城市', type: 'select', options: 'async', required: true },
      { key: 'name', label: '标签名称', type: 'text', required: true },
      { key: 'sort_order', label: '排序顺序', type: 'number', default: 0 },
      { key: 'status', label: '状态', type: 'select', options: [{value: 1, label: '启用'}, {value: 0, label: '禁用'}], default: 1 }
    ],
    tableColumns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '标签名称' },
      { key: 'city_name', label: '所属城市' },
      { key: 'sort_order', label: '排序' },
      { key: 'status', label: '状态', type: 'status' }
    ]
  },
  {
    name: 'exams',
    title: '试卷管理',
    apiBase: '/api/admin/exams',
    fields: [
      { key: 'city_id', label: '城市', type: 'select', options: 'async', required: true },
      { key: 'grade_id', label: '年级', type: 'select', options: 'async', required: true },
      { key: 'subject_id', label: '科目', type: 'select', options: 'async', required: true },
      { key: 'tag_id', label: '标签', type: 'select', options: 'async' },
      { key: 'title', label: '试卷标题', type: 'text', required: true },
      { key: 'year', label: '年份', type: 'number', required: true },
      { key: 'semester', label: '学期', type: 'select', options: [{value: '上学期', label: '上学期'}, {value: '下学期', label: '下学期'}], required: true },
      { key: 'file_type', label: '文件类型', type: 'select', options: [{value: 'PDF', label: 'PDF'}, {value: 'WORD', label: 'WORD'}, {value: 'ZIP', label: 'ZIP'}], default: 'PDF' },
      { key: 'file_url', label: '文件URL', type: 'text', required: true },
      { key: 'points_cost', label: '所需积分', type: 'number', default: 50 },
      { key: 'featured', label: '是否精选', type: 'select', options: [{value: 1, label: '是'}, {value: 0, label: '否'}], default: 0 },
      { key: 'status', label: '状态', type: 'select', options: [{value: 1, label: '上架'}, {value: 0, label: '下架'}], default: 1 }
    ],
    tableColumns: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: '试卷标题' },
      { key: 'city_name', label: '城市' },
      { key: 'grade_name', label: '年级' },
      { key: 'subject_name', label: '科目' },
      { key: 'year', label: '年份' },
      { key: 'semester', label: '学期' },
      { key: 'download_count', label: '下载次数' },
      { key: 'featured', label: '精选', type: 'boolean' },
      { key: 'status', label: '状态', type: 'status' }
    ]
  },
  {
    name: 'users',
    title: '用户管理',
    apiBase: '/api/admin/users',
    fields: [
      { key: 'points', label: '积分', type: 'number', readonly: true },
      { key: 'status', label: '状态', type: 'select', options: [{value: 1, label: '正常'}, {value: 0, label: '禁用'}] }
    ],
    tableColumns: [
      { key: 'id', label: 'ID' },
      { key: 'nickname', label: '昵称' },
      { key: 'openid', label: 'OpenID' },
      { key: 'points', label: '积分' },
      { key: 'subject_count', label: '开通科目数' },
      { key: 'download_count', label: '下载次数' },
      { key: 'status', label: '状态', type: 'status' }
    ]
  }
];

function generatePageHTML(page) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
    .toolbar { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; display: flex; gap: 15px; flex-wrap: wrap; align-items: center; }
    .toolbar input, .toolbar select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    .btn { padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; }
    .btn:hover { opacity: 0.8; }
    .btn-primary { background: #667eea; color: white; }
    .btn-danger { background: #e74c3c; color: white; }
    .table-container { background: white; border-radius: 10px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    tr:hover { background: #f8f9fa; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .status-active { background: #d4edda; color: #155724; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 20px; }
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
    .modal.active { display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; padding: 30px; border-radius: 10px; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; color: #666; font-size: 14px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="toolbar">
    <input type="text" id="searchInput" placeholder="搜索...">
    <select id="statusSelect">
      <option value="">全部状态</option>
      <option value="1">启用</option>
      <option value="0">禁用</option>
    </select>
    <button class="btn btn-primary" onclick="search()">搜索</button>
    <button class="btn btn-primary" onclick="showCreateModal()">添加</button>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" id="selectAll"></th>
          ${page.tableColumns.map(col => `<th>${col.label}</th>`).join('')}
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
    </table>
    <div class="pagination" id="pagination"></div>
  </div>

  <div class="modal" id="formModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="modalTitle">添加</h2>
      </div>
      <form id="dataForm">
        <input type="hidden" id="itemId">
        ${page.fields.map(field => `
          <div class="form-group">
            <label>${field.label}</label>
            ${generateFieldHTML(field)}
          </div>
        `).join('')}
        <div class="modal-actions">
          <button type="button" class="btn" onclick="closeModal()">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const API_BASE = '${page.apiBase}';
    const token = parent.localStorage.getItem('adminToken');
    let currentPage = 1;
    let pageSize = 20;

    async function loadData(page = 1) {
      currentPage = page;
      const searchKeyword = document.getElementById('searchInput').value;
      const status = document.getElementById('statusSelect').value;

      try {
        const response = await fetch(API_BASE + '/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'admin-token': token },
          body: JSON.stringify({ page, pageSize, keyword: searchKeyword || undefined, status: status !== '' ? parseInt(status) : undefined })
        });
        const result = await response.json();
        if (result.code === 200) {
          renderTable(result.data.list);
          renderPagination(result.data.pagination);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败');
      }
    }

    function renderTable(list) {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = list.map(item => {
        let html = '<tr>';
        html += '<td><input type="checkbox" class="row-checkbox" data-id="' + item.id + '"></td>';
        ${page.tableColumns.map(col => {
          if (col.type === 'status') {
            return `html += '<td><span class="status-badge ' + (item.${col.key} === 1 ? 'status-active' : 'status-inactive') + '">' + (item.${col.key} === 1 ? '启用' : '禁用') + '</span></td>';`;
          } else if (col.format) {
            return `html += '<td>' + col.format(item.${col.key}) + '</td>';`;
          } else {
            return `html += '<td>' + (item.${col.key} || '-') + '</td>';`;
          }
        }).join('\n        ')}
        html += '<td><button class="btn btn-primary" onclick="editItem(' + item.id + ')">编辑</button><button class="btn btn-danger" onclick="deleteItem(' + item.id + ')">删除</button></td>';
        html += '</tr>';
        return html;
      }).join('');
    }

    function renderPagination(pagination) {
      const div = document.getElementById('pagination');
      const { page, totalPages, total } = pagination;
      let html = \`<span>共 \${total} 条，第 \${page}/\${totalPages} 页</span>\`;
      if (page > 1) html += \`<button class="btn" onclick="loadData(\${page - 1})">上一页</button>\`;
      if (page < totalPages) html += \`<button class="btn" onclick="loadData(\${page + 1})">下一页</button>\`;
      div.innerHTML = html;
    }

    function search() { loadData(1); }

    function showCreateModal() {
      document.getElementById('modalTitle').textContent = '添加';
      document.getElementById('dataForm').reset();
      document.getElementById('itemId').value = '';
      document.getElementById('formModal').classList.add('active');
    }

    async function editItem(id) {
      try {
        const response = await fetch(\`\${API_BASE}/\${id}\`, { headers: { 'admin-token': token } });
        const result = await response.json();
        if (result.code === 200) {
          const item = result.data;
          document.getElementById('modalTitle').textContent = '编辑';
          document.getElementById('itemId').value = item.id;
          ${page.fields.map(field => {
            if (field.key === 'status') return `document.getElementById('${field.key}').value = item.${field.key};`;
            return `document.getElementById('${field.key}').value = item.${field.key} || '';`;
          }).join('\n          ')}
          document.getElementById('formModal').classList.add('active');
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败');
      }
    }

    async function deleteItem(id) {
      if (!confirm('确定要删除吗？')) return;
      try {
        const response = await fetch(\`\${API_BASE}/\${id}\`, { method: 'DELETE', headers: { 'admin-token': token } });
        const result = await response.json();
        if (result.code === 200) {
          alert('删除成功');
          loadData(currentPage);
        } else {
          alert(result.message || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }

    function closeModal() { document.getElementById('formModal').classList.remove('active'); }

    document.getElementById('dataForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('itemId').value;
      const data = {
        ${page.fields.filter(f => !f.readonly).map(f => {
          if (f.type === 'number') return `${f.key}: parseInt(document.getElementById('${f.key}').value)`;
          return `${f.key}: document.getElementById('${f.key}').value`;
        }).join(',\n        ')}
      };
      try {
        const url = id ? \`\${API_BASE}/\${id}\` : API_BASE;
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'admin-token': token },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.code === 200) {
          alert('保存成功');
          closeModal();
          loadData(currentPage);
        } else {
          alert(result.message || '保存失败');
        }
      } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败');
      }
    });

    loadData();
  </script>
</body>
</html>`;
}

function generateFieldHTML(field) {
  if (field.readonly) {
    return `<input type="text" id="${field.key}" readonly>`;
  }

  switch (field.type) {
    case 'select':
      if (field.options === 'async') {
        return `<select id="${field.key}" ${field.required ? 'required' : ''}>
          <option value="">请选择</option>
        </select>`;
      }
      return `<select id="${field.key}" ${field.required ? 'required' : ''}>
        ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
      </select>`;
    case 'number':
      return `<input type="number" id="${field.key}" value="${field.default !== undefined ? field.default : ''}" ${field.required ? 'required' : ''}>`;
    case 'textarea':
      return `<textarea id="${field.key}" rows="4" ${field.required ? 'required' : ''}></textarea>`;
    default:
      return `<input type="text" id="${field.key}" ${field.required ? 'required' : ''}>`;
  }
}

// 生成所有页面
pages.forEach(page => {
  const html = generatePageHTML(page);
  const filePath = path.join(__dirname, `${page.name}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`✅ 生成页面: ${page.name}.html`);
});

console.log('\n🎉 所有页面生成完成！');
