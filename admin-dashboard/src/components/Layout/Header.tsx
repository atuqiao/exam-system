import { Layout, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  return (
    <Layout.Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
        资料管理系统
      </div>
      <Button
        type="text"
        icon={<LogoutOutlined />}
        onClick={onLogout}
      >
        退出
      </Button>
    </Layout.Header>
  );
};

export default Header;
