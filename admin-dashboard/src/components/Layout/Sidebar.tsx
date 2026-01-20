import { Menu, Layout } from 'antd';
import { HomeOutlined, FileTextOutlined, EnvironmentOutlined, TeamOutlined, BookOutlined, TagOutlined, TagsOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '仪表板',
    },
    {
      key: '/exam',
      icon: <FileTextOutlined />,
      label: '试卷管理',
    },
    {
      key: '/city',
      icon: <EnvironmentOutlined />,
      label: '城市管理',
    },
    {
      key: '/grade',
      icon: <BookOutlined />,
      label: '年级管理',
    },
    {
      key: '/subject',
      icon: <TagOutlined />,
      label: '科目管理',
    },
    {
      key: '/tag',
      icon: <TagsOutlined />,
      label: '标签管理',
    },
    {
      key: '/user',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
  ];

  return (
    <Layout.Sider
      width={200}
      style={{ background: '#001529' }}
    >
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
        管理后台
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          if (key !== location.pathname) {
            navigate(key);
          }
        }}
      />
    </Layout.Sider>
  );
};

export default Sidebar;
