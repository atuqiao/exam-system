import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Modal, Form, Input, InputNumber, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { adminApi } from '../../api';

interface TagItem {
  id: number;
  city_id: number;
  name: string;
  alias?: string;
  sort_order: number;
  status: number;
  created_at: string;
}

const TagManagement = () => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [form] = Form.useForm();

  // 加载标签列表
  const loadTags = async () => {
    setLoading(true);
    try {
      const response: any = await adminApi.tags.getList();
      if (response.code === 200) {
        // 智能判断：处理不同的响应格式
        let dataList = [];
        if (Array.isArray(response.data)) {
          // 数组格式 [list, pagination]
          dataList = response.data[0] || [];
        } else if (response.data && Array.isArray(response.data.list)) {
          // 对象格式 {data: {list: [...], pagination: {...}}}
          dataList = response.data.list;
        }
        setTags(dataList);
      } else {
        message.error(response.message || '加载标签列表失败');
      }
    } catch (error) {
      console.error('加载标签失败:', error);
      message.error('加载标签列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 加载城市列表
  const loadCities = async () => {
    try {
      const response: any = await adminApi.cities.getList();
      if (response.code === 200) {
        let dataList = [];
        if (Array.isArray(response.data)) {
          dataList = response.data[0] || [];
        } else if (response.data && Array.isArray(response.data.list)) {
          dataList = response.data.list;
        }
        setCities(dataList);
      }
    } catch (error) {
      console.error('加载城市失败:', error);
    }
  };

  useEffect(() => {
    loadTags();
    loadCities();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '别名',
      dataIndex: 'alias',
      key: 'alias',
      width: 120,
      render: (alias: string) => alias || '-',
    },
    {
      title: '所属城市',
      dataIndex: 'city_id',
      key: 'city_id',
      width: 120,
      render: (cityId: number) => {
        const city = cities.find(c => c.id === cityId);
        return city ? city.name : '-';
      },
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: TagItem) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: TagItem) => {
    setEditingTag(tag);
    form.setFieldsValue(tag);
    setModalVisible(true);
  };

  const handleDelete = (tag: TagItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除标签"${tag.name}"吗？`,
      onOk: async () => {
        try {
          const response: any = await adminApi.tags.delete(tag.id);
          if (response.code === 200) {
            message.success('删除成功');
            loadTags();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除标签失败:', error);
          message.error('删除标签失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingTag) {
        // 编辑
        try {
          const response: any = await adminApi.tags.update(editingTag.id, values);
          if (response.code === 200) {
            message.success('更新成功');
            loadTags();
          } else {
            message.error(response.message || '更新失败');
          }
        } catch (error) {
          console.error('更新标签失败:', error);
          message.error('更新标签失败');
        }
      } else {
        // 新增
        try {
          const response: any = await adminApi.tags.create(values);
          if (response.code === 200) {
            message.success('添加成功');
            loadTags();
          } else {
            message.error(response.message || '添加失败');
          }
        } catch (error) {
          console.error('添加标签失败:', error);
          message.error('添加标签失败');
        }
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div className={styles.tag}>
      <Card>
        <div className={styles.header}>
          <h2>标签管理</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加标签
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingTag ? '编辑标签' : '添加标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标签名称"
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称（如：易错题、重点、真题）" />
          </Form.Item>

          <Form.Item
            label="别名"
            name="alias"
          >
            <Input placeholder="请输入标签别名（可选）" />
          </Form.Item>

          <Form.Item
            label="所属城市"
            name="city_id"
            rules={[{ required: true, message: '请选择城市' }]}
          >
            <Select placeholder="请选择城市">
              {cities.map(city => (
                <Select.Option key={city.id} value={city.id}>{city.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="排序"
            name="sort_order"
            initialValue={0}
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber min={0} max={9999} style={{ width: '100%' }} placeholder="排序值，数字越小越靠前" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue={1}
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManagement;
