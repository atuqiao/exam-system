import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import City from './pages/City';
import Grade from './pages/Grade';
import Subject from './pages/Subject';
import Exam from './pages/Exam';
import TagManagement from './pages/Tag';
import User from './pages/User';

function App() {
  const [isLogin, setIsLogin] = useState(false);

  // 检查本地存储的token
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLogin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLogin(false);
  };

  if (!isLogin) {
    return <Login onLogin={() => setIsLogin(true)} />;
  }

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header onLogout={handleLogout} />
        <Layout>
          <Sidebar />
          <Layout.Content style={{ padding: '20px', background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/city" element={<City />} />
              <Route path="/grade" element={<Grade />} />
              <Route path="/subject" element={<Subject />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="/tag" element={<TagManagement />} />
              <Route path="/user" element={<User />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout.Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
