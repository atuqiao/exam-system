import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Modal, Form, Input, InputNumber, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { adminApi } from '../../api';

interface Grade {
  id: number;
  name: string;
  level: number;
  sort_order: number;
  status: number;
  created_at: string;
}

const Grade = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [form] = Form.useForm();

  const loadGrades = async () => {
    setLoading(true);
    try {
      const response: any = await adminApi.grades.getList();
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
        setGrades(dataList);
      } else {
        message.error(response.message || '加载年级列表失败');
      }
    } catch (error) {
      console.error('加载年级失败:', error);
      message.error('加载年级列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrades();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '年级名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '年级等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: number) => {
        const levelMap: { [key: number]: string } = {
          1: '小学',
          2: '初中',
          3: '高中',
        };
        return levelMap[level] || level;
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
      render: (_: any, record: Grade) => (
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
    setEditingGrade(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    form.setFieldsValue(grade);
    setModalVisible(true);
  };

  const handleDelete = (grade: Grade) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除年级"${grade.name}"吗？`,
      onOk: async () => {
        try {
          const response: any = await adminApi.grades.delete(grade.id);
          if (response.code === 200) {
            message.success('删除成功');
            loadGrades();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除年级失败:', error);
          message.error('删除年级失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingGrade) {
        try {
          const response: any = await adminApi.grades.update(editingGrade.id, values);
          if (response.code === 200) {
            message.success('更新成功');
            loadGrades();
          } else {
            message.error(response.message || '更新失败');
          }
        } catch (error) {
          console.error('更新年级失败:', error);
          message.error('更新年级失败');
        }
      } else {
        try {
          const response: any = await adminApi.grades.create(values);
          if (response.code === 200) {
            message.success('添加成功');
            loadGrades();
          } else {
            message.error(response.message || '添加失败');
          }
        } catch (error) {
          console.error('添加年级失败:', error);
          message.error('添加年级失败');
        }
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div className={styles.grade}>
      <Card>
        <div className={styles.header}>
          <h2>年级管理</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加年级
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={grades}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingGrade ? '编辑年级' : '添加年级'}
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
            label="年级名称"
            name="name"
            rules={[{ required: true, message: '请输入年级名称' }]}
          >
            <Input placeholder="请输入年级名称（如：一年级）" />
          </Form.Item>

          <Form.Item
            label="年级等级"
            name="level"
            rules={[{ required: true, message: '请选择年级等级' }]}
          >
            <Select placeholder="请选择年级等级">
              <Select.Option value={1}>小学 (1)</Select.Option>
              <Select.Option value={2}>初中 (2)</Select.Option>
              <Select.Option value={3}>高中 (3)</Select.Option>
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

export default Grade;
