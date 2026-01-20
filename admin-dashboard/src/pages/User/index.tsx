import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Modal, Form, Input, InputNumber, Tag, Select } from 'antd';
import { EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { adminApi } from '../../api';

interface User {
  id: number;
  openid: string;
  unionid?: string;
  nickname: string;
  avatar_url?: string;
  gender?: number;
  points: number;
  invite_code?: string;
  inviter_id?: number;
  status: number;
  created_at: string;
}

const User = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pointsUser, setPointsUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [pointsForm] = Form.useForm();

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response: any = await adminApi.users.getList();
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
        setUsers(dataList);
      } else {
        message.error(response.message || '加载用户列表失败');
      }
    } catch (error) {
      console.error('加载用户失败:', error);
      message.error('加载用户列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '头像',
      dataIndex: 'avatar_url',
      key: 'avatar_url',
      width: 80,
      render: (avatarUrl: string) => (
        avatarUrl ? (
          <img src={avatarUrl} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            👤
          </div>
        )
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
      render: (nickname: string) => nickname || '-',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: number) => {
        const genderMap: { [key: number]: string } = {
          0: '未知',
          1: '男',
          2: '女',
        };
        return genderMap[gender] || '未知';
      },
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points: number) => <Tag color="orange">{points} 分</Tag>,
    },
    {
      title: '邀请码',
      dataIndex: 'invite_code',
      key: 'invite_code',
      width: 100,
      render: (inviteCode: string) => inviteCode || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<GiftOutlined />}
            onClick={() => handlePoints(record)}
          >
            积分
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 1 ? '禁用' : '启用'}
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      gender: user.gender,
      invite_code: user.invite_code,
      status: user.status,
    });
    setModalVisible(true);
  };

  const handlePoints = (user: User) => {
    setPointsUser(user);
    pointsForm.setFieldsValue({ points: user.points });
    setPointsModalVisible(true);
  };

  const handleToggleStatus = (user: User) => {
    Modal.confirm({
      title: '确认操作',
      content: `确定要${user.status === 1 ? '禁用' : '启用'}用户"${user.nickname}"吗？`,
      onOk: async () => {
        try {
          const response: any = await adminApi.users.toggleStatus(user.id);
          if (response.code === 200) {
            message.success('操作成功');
            loadUsers();
          } else {
            message.error(response.message || '操作失败');
          }
        } catch (error) {
          console.error('切换用户状态失败:', error);
          message.error('操作失败');
        }
      },
    });
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户"${user.nickname}"吗？`,
      onOk: async () => {
        try {
          const response: any = await adminApi.users.delete(user.id);
          if (response.code === 200) {
            message.success('删除成功');
            loadUsers();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除用户失败:', error);
          message.error('删除用户失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      try {
        const response: any = await adminApi.users.update(editingUser!.id, values);
        if (response.code === 200) {
          message.success('更新成功');
          loadUsers();
        } else {
          message.error(response.message || '更新失败');
        }
      } catch (error) {
        console.error('更新用户失败:', error);
        message.error('更新用户失败');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handlePointsSubmit = async () => {
    try {
      const values = await pointsForm.validateFields();

      try {
        const response: any = await adminApi.users.updatePoints(pointsUser!.id, values.points);
        if (response.code === 200) {
          message.success('积分更新成功');
          loadUsers();
        } else {
          message.error(response.message || '更新失败');
        }
      } catch (error) {
        console.error('更新积分失败:', error);
        message.error('更新积分失败');
      }

      setPointsModalVisible(false);
      pointsForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div className={styles.user}>
      <Card>
        <div className={styles.header}>
          <h2>用户管理</h2>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
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
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            label="头像URL"
            name="avatar_url"
          >
            <Input placeholder="请输入头像URL" />
          </Form.Item>

          <Form.Item
            label="性别"
            name="gender"
          >
            <Select placeholder="请选择性别">
              <Select.Option value={0}>未知</Select.Option>
              <Select.Option value={1}>男</Select.Option>
              <Select.Option value={2}>女</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="邀请码"
            name="invite_code"
          >
            <Input placeholder="请输入邀请码" disabled />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 积分管理模态框 */}
      <Modal
        title="积分管理"
        open={pointsModalVisible}
        onOk={handlePointsSubmit}
        onCancel={() => {
          setPointsModalVisible(false);
          pointsForm.resetFields();
        }}
        destroyOnClose
      >
        <Form form={pointsForm} layout="vertical">
          <p>当前用户：<strong>{pointsUser?.nickname}</strong></p>
          <p>当前积分：<strong>{pointsUser?.points}</strong> 分</p>

          <Form.Item
            label="设置积分"
            name="points"
            rules={[{ required: true, message: '请输入积分' }]}
          >
            <InputNumber
              min={0}
              max={99999}
              style={{ width: '100%' }}
              placeholder="请输入积分"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default User;
