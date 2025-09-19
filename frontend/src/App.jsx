import React, { useState, useEffect } from 'react';
import VoteList from './components/VoteList.jsx';
import CreateVote from './components/CreateVote.jsx';
import VoteDetail from './components/VoteDetail.jsx';
import { voteAPI } from './services/api.js';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail'
  const [selectedVote, setSelectedVote] = useState(null);
  const [healthStatus, setHealthStatus] = useState('unknown');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await voteAPI.healthCheck();
      setHealthStatus('healthy');
      console.log('서버 상태:', response.data);
    } catch (error) {
      setHealthStatus('error');
      console.error('서버 연결 실패:', error);
    }
  };

  const handleVoteSelect = (vote) => {
    setSelectedVote(vote);
    setCurrentView('detail');
  };

  const handleVoteCreated = (newVote) => {
    setSelectedVote(newVote);
    setCurrentView('detail');
  };

  const handleVoteUpdate = (updatedVote) => {
    setSelectedVote(updatedVote);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedVote(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <CreateVote
            onVoteCreated={handleVoteCreated}
            onCancel={handleBackToList}
          />
        );
      case 'detail':
        return selectedVote ? (
          <VoteDetail
            vote={selectedVote}
            onBack={handleBackToList}
            onVoteUpdate={handleVoteUpdate}
          />
        ) : (
          <div className="card">
            <div className="error">선택된 투표를 찾을 수 없습니다.</div>
            <button className="btn btn-primary" onClick={handleBackToList}>
              목록으로 돌아가기
            </button>
          </div>
        );
      case 'list':
      default:
        return <VoteList onVoteSelect={handleVoteSelect} />;
    }
  };

  return (
    <div className="App">
      <div className="container">
        {/* 헤더 */}
        <header className="header">
          <h1>📊 투표 시스템</h1>
          <p>실시간 투표와 결과를 확인해보세요</p>
          
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
            서버 {healthStatus === 'healthy' ? '연결됨' : '연결 실패'}
          </div>
        </header>

        {/* 네비게이션 */}
        {currentView === 'list' && (
          <nav className="nav">
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentView('create')}
            >
              + 새 투표 만들기
            </button>
            <button 
              className="btn btn-secondary"
              onClick={checkHealth}
            >
              서버 상태 확인
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
          <p>Voting System - 배포 자동화 프로젝트 데모</p>
          <p>Made with ❤️ using React + Spring Boot</p>
        </footer>
      </div>
    </div>
  );
}

export default App;