import { Card, Row, Col, Statistic, Progress, List, Tag, Avatar } from 'antd';
import { UserOutlined, FileTextOutlined, DownloadOutlined, EnvironmentOutlined, BookOutlined, TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import './index.module.scss';
import { adminApi } from '../../api';

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string;
}

interface DashboardStats {
  totalUsers: number;
  totalExams: number;
  totalDownloads: number;
  totalCities: number;
  subjectCoverage: number;
  gradeCoverage: number;
  popularSubjects: Array<{ name: string; count: number; percent: number }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalExams: 0,
    totalDownloads: 0,
    totalCities: 0,
    subjectCoverage: 0,
    gradeCoverage: 0,
    popularSubjects: [],
  });
  const [loading, setLoading] = useState(false);

  const recentActivities: RecentActivity[] = [
    { id: 1, type: 'download', description: '用户下载了"2024年北京七年级数学期末试卷"', time: '5分钟前' },
    { id: 2, type: 'upload', description: '管理员上传了"2024年上海八年级语文期末试卷"', time: '15分钟前' },
    { id: 3, type: 'user', description: '新用户注册：张三', time: '1小时前' },
    { id: 4, type: 'download', description: '用户下载了"2024年广州九年级英语期中试卷"', time: '2小时前' },
    { id: 5, type: 'edit', description: '管理员更新了科目"物理"的状态', time: '3小时前' },
  ];

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const response: any = await adminApi.dashboard.getStats();
      if (response.code === 200) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download':
        return <DownloadOutlined style={{ color: '#1890ff' }} />;
      case 'upload':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'user':
        return <UserOutlined style={{ color: '#722ed1' }} />;
      case 'edit':
        return <BookOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="试卷总数"
              value={stats.totalExams}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix="份"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="下载次数"
              value={stats.totalDownloads}
              prefix={<DownloadOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="城市数量"
              value={stats.totalCities}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={<><TrophyOutlined /> 数据统计</>}
            bordered={false}
            className="data-card"
          >
            <Row gutter={[16, 24]}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>科目覆盖率</span>
                    <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{stats.subjectCoverage}%</span>
                  </div>
                  <Progress percent={stats.subjectCoverage} status="active" strokeColor="#1890ff" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>年级覆盖率</span>
                    <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{stats.gradeCoverage}%</span>
                  </div>
                  <Progress percent={stats.gradeCoverage} status="active" strokeColor="#52c41a" />
                </div>
              </Col>
              <Col span={12}>
                <List
                  size="small"
                  header={<div style={{ fontWeight: 'bold' }}>热门科目</div>}
                  dataSource={stats.popularSubjects}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BookOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                        title={item.name}
                        description={`${item.count} 份试卷`}
                      />
                      <Tag color="blue">{item.percent}%</Tag>
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<><ClockCircleOutlined /> 最近活动</>}
            bordered={false}
            className="activity-card"
          >
            <List
              size="small"
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getActivityIcon(item.type)} />}
                    title={item.description}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="系统信息" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div className="info-item">
                  <span className="info-label">系统版本</span>
                  <span className="info-value">1.0.0</span>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="info-item">
                  <span className="info-label">后端 API</span>
                  <span className="info-value">
                    <Tag color="green">运行中</Tag>
                    <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
                      localhost:3000
                    </a>
                  </span>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="info-item">
                  <span className="info-label">最后更新</span>
                  <span className="info-value">2024-01-19</span>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
