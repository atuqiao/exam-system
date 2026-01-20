import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Modal, Form, Input, InputNumber, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { adminApi } from '../../api';

interface City {
  id: number;
  name: string;
  code: string;
  province?: string;
  sort_order: number;
  status: number;
  created_at: string;
}

const City = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [form] = Form.useForm();

  // 加载城市列表
  const loadCities = async () => {
    setLoading(true);
    try {
      const response: any = await adminApi.cities.getList();
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
        setCities(dataList);
      } else {
        message.error(response.message || '加载城市列表失败');
      }
    } catch (error) {
      console.error('加载城市失败:', error);
      message.error('加载城市列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      title: '城市名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '城市代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
      width: 120,
      render: (province: string) => province || '-',
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
      render: (_: any, record: City) => (
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
    setEditingCity(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    form.setFieldsValue(city);
    setModalVisible(true);
  };

  const handleDelete = (city: City) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除城市"${city.name}"吗？`,
      onOk: async () => {
        try {
          const response: any = await adminApi.cities.delete(city.id);
          if (response.code === 200) {
            message.success('删除成功');
            loadCities();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除城市失败:', error);
          message.error('删除城市失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingCity) {
        // 编辑
        try {
          const response: any = await adminApi.cities.update(editingCity.id, values);
          if (response.code === 200) {
            message.success('更新成功');
            loadCities();
          } else {
            message.error(response.message || '更新失败');
          }
        } catch (error) {
          console.error('更新城市失败:', error);
          message.error('更新城市失败');
        }
      } else {
        // 新增
        try {
          const response: any = await adminApi.cities.create(values);
          if (response.code === 200) {
            message.success('添加成功');
            loadCities();
          } else {
            message.error(response.message || '添加失败');
          }
        } catch (error) {
          console.error('添加城市失败:', error);
          message.error('添加城市失败');
        }
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div className={styles.city}>
      <Card>
        <div className={styles.header}>
          <h2>城市管理</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加城市
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={cities}
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
        title={editingCity ? '编辑城市' : '添加城市'}
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
            label="城市名称"
            name="name"
            rules={[{ required: true, message: '请输入城市名称' }]}
          >
            <Input placeholder="请输入城市名称" />
          </Form.Item>

          <Form.Item
            label="城市代码"
            name="code"
            rules={[{ required: true, message: '请输入城市代码' }]}
          >
            <Input placeholder="请输入城市代码（如：BEIJING）" />
          </Form.Item>

          <Form.Item
            label="省份"
            name="province"
          >
            <Input placeholder="请输入省份名称（如：北京）" />
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

export default City;
