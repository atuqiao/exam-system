import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Modal, Form, Input, Select, Tag, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { adminApi } from '../../api';

interface Exam {
  id: number;
  title: string;
  city_name?: string;
  grade_name?: string;
  subject_name?: string;
  year: number;
  semester: number;
  file_url: string;
  download_count: number;
  created_at: string;
}

const Exam = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [form] = Form.useForm();
  const [cities, setCities] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // 加载试卷列表
  const loadExams = async () => {
    setLoading(true);
    try {
      const response: any = await adminApi.exams.getList();
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
        setExams(dataList);
      } else {
        message.error(response.message || '加载试卷列表失败');
      }
    } catch (error) {
      console.error('加载试卷失败:', error);
      message.error('加载试卷列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 加载基础数据
  const loadBaseData = async () => {
    try {
      const [citiesRes, gradesRes, subjectsRes]: any[] = await Promise.all([
        adminApi.cities.getList(),
        adminApi.grades.getList(),
        adminApi.subjects.getList(),
      ]);

      // 智能判断：处理不同的响应格式
      const extractData = (res: any) => {
        if (res.code === 200) {
          // 如果 data 是数组 [list, pagination]，提取 list
          if (Array.isArray(res.data)) {
            return res.data[0] || [];
          }
          // 如果 data 是对象，使用 data.list
          if (res.data && Array.isArray(res.data.list)) {
            return res.data.list;
          }
        }
        return [];
      };

      const citiesData = extractData(citiesRes);
      const gradesData = extractData(gradesRes);
      const subjectsData = extractData(subjectsRes);

      setCities(citiesData);
      setGrades(gradesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('加载基础数据失败:', error);
    }
  };

  useEffect(() => {
    loadExams();
    loadBaseData();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '试卷标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: '城市',
      dataIndex: 'city_name',
      key: 'city_name',
      width: 100,
    },
    {
      title: '年级',
      dataIndex: 'grade_name',
      key: 'grade_name',
      width: 100,
    },
    {
      title: '科目',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 100,
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      key: 'semester',
      width: 120,
      render: (semester: number) => (
        <Tag color={semester === 1 ? 'blue' : 'green'}>{semester === 1 ? '上学期' : '下学期'}</Tag>
      ),
    },
    {
      title: '下载次数',
      dataIndex: 'download_count',
      key: 'download_count',
      width: 120,
      render: (count: number) => <Tag color="orange">{count} 次</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Exam) => (
        <Space>
          <Button
            type="link"
            icon={<SearchOutlined />}
            onClick={() => window.open(record.file_url, '_blank')}
          >
            预览
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
    setEditingExam(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    form.setFieldsValue(exam);
    setModalVisible(true);
  };

  const handleDelete = (exam: Exam) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除试卷"${exam.title}"吗？`,
      onOk: async () => {
        try {
          const response: any = await adminApi.exams.delete(exam.id);
          if (response.code === 200) {
            message.success('删除成功');
            loadExams();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除试卷失败:', error);
          message.error('删除试卷失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingExam) {
        try {
          const response: any = await adminApi.exams.update(editingExam.id, values);
          if (response.code === 200) {
            message.success('更新成功');
            loadExams();
          } else {
            message.error(response.message || '更新失败');
          }
        } catch (error) {
          console.error('更新试卷失败:', error);
          message.error('更新试卷失败');
        }
      } else {
        try {
          const response: any = await adminApi.exams.create(values);
          if (response.code === 200) {
            message.success('添加成功');
            loadExams();
          } else {
            message.error(response.message || '添加失败');
          }
        } catch (error) {
          console.error('添加试卷失败:', error);
          message.error('添加试卷失败');
        }
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div className={styles.exam}>
      <Card>
        <div className={styles.header}>
          <h2>试卷管理</h2>
          <Space>
            <Button
              icon={<SearchOutlined />}
              onClick={() => message.info('搜索功能开发中')}
            >
              搜索试卷
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加试卷
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingExam ? '编辑试卷' : '添加试卷'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="试卷标题"
            name="title"
            rules={[{ required: true, message: '请输入试卷标题' }]}
          >
            <Input placeholder="请输入试卷标题" />
          </Form.Item>

          <Form.Item
            label="城市"
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
            label="年级"
            name="grade_id"
            rules={[{ required: true, message: '请选择年级' }]}
          >
            <Select placeholder="请选择年级">
              {grades.map(grade => (
                <Select.Option key={grade.id} value={grade.id}>{grade.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="科目"
            name="subject_id"
            rules={[{ required: true, message: '请选择科目' }]}
          >
            <Select placeholder="请选择科目">
              {subjects.map(subject => (
                <Select.Option key={subject.id} value={subject.id}>{subject.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="年份"
            name="year"
            rules={[{ required: true, message: '请输入年份' }]}
          >
            <InputNumber min={2000} max={2030} style={{ width: '100%' }} placeholder="请输入年份" />
          </Form.Item>

          <Form.Item
            label="学期"
            name="semester"
            rules={[{ required: true, message: '请选择学期' }]}
          >
            <Select placeholder="请选择学期">
              <Select.Option value={1}>上学期</Select.Option>
              <Select.Option value={2}>下学期</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="文件地址"
            name="file_url"
            rules={[{ required: true, message: '请输入文件地址' }]}
          >
            <Input placeholder="请输入文件地址（如：/uploads/exam1.pdf）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Exam;
