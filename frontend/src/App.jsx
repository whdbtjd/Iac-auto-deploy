import React, { useState, useEffect } from 'react';
import ConnectionStatus from './components/ConnectionStatus.jsx';
import ResourceDashboard from './components/ResourceDashboard.jsx';
import { resourceAPI } from './services/api.js';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('connection'); // 'connection', 'dashboard'
  const [healthStatus, setHealthStatus] = useState('unknown');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await resourceAPI.healthCheck();
      setHealthStatus('healthy');
      console.log('서버 상태:', response.data);
    } catch (error) {
      setHealthStatus('error');
      console.error('서버 연결 실패:', error);
    }
  };

  const handleConnectionChange = (connected) => {
    setIsConnected(connected);
    if (connected) {
      setCurrentView('dashboard');
    }
  };

  const handleBackToConnection = () => {
    setCurrentView('connection');
    setIsConnected(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ResourceDashboard />;
      case 'connection':
      default:
        return <ConnectionStatus onConnectionChange={handleConnectionChange} />;
    }
  };

  return (
    <div className="App">
      <div className="container">
        {/* 헤더 */}
        <header className="header">
          <h1>🏗️ AWS 인프라 모니터링</h1>
          <p>Infrastructure as Code 자동 배포 시스템</p>
          
          {/* 서버 상태 표시 */}
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: healthStatus === 'healthy' 
              ? 'rgba(40, 167, 69, 0.2)' 
              : 'rgba(220, 53, 69, 0.2)',
            fontSize: '14px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: healthStatus === 'healthy' ? '#28a745' : '#dc3545'
            }}></span>
            백엔드 서버 {healthStatus === 'healthy' ? '연결됨' : '연결 실패'}
          </div>
        </header>

        {/* 네비게이션 */}
        {currentView === 'dashboard' && (
          <nav className="nav">
            <button 
              className="btn btn-secondary"
              onClick={handleBackToConnection}
            >
              ← 연결 상태로 돌아가기
            </button>
            <button 
              className="btn btn-secondary"
              onClick={checkHealth}
            >
              🔄 서버 상태 확인
            </button>
          </nav>
        )}

        {/* 메인 컨텐츠 */}
        <main>
          {renderCurrentView()}
        </main>

        {/* 푸터 */}
        <footer style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px'
        }}>
          <p>Infrastructure as Code - 자동 배포 시스템 데모</p>
          <p>Made with ❤️ using Terraform + Ansible + AWS + React + Spring Boot</p>
        </footer>
      </div>
    </div>
  );
}

export default App;