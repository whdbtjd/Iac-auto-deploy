import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../services/api.js';

const ConnectionStatus = ({ onConnectionChange }) => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionMessage, setConnectionMessage] = useState('AWS 리소스 연결 상태를 확인 중...');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      setConnectionProgress(0);
      setConnectionMessage('AWS 리소스 연결 상태를 확인 중...');

      // 연결 진행 상황 시뮬레이션
      const progressSteps = [
        { progress: 20, message: 'EC2 인스턴스 연결 확인 중...' },
        { progress: 40, message: 'ALB 헬스체크 확인 중...' },
        { progress: 60, message: 'RDS 연결 상태 확인 중...' },
        { progress: 80, message: 'S3 및 CloudFront 확인 중...' },
        { progress: 100, message: 'VPC 네트워크 상태 확인 중...' },
      ];

      for (const step of progressSteps) {
        setConnectionProgress(step.progress);
        setConnectionMessage(step.message);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // 실제 연결 상태 확인
      const response = await resourceAPI.getConnectionStatus(3000);
      
      if (response.data.status === 'connected') {
        setConnectionStatus('connected');
        setConnectionMessage('AWS 리소스에 성공적으로 연결되었습니다!');
        onConnectionChange?.(true);
      } else {
        setConnectionStatus('disconnected');
        setConnectionMessage('AWS 리소스 연결에 실패했습니다.');
        onConnectionChange?.(false);
      }

    } catch (error) {
      console.error('연결 상태 확인 실패:', error);
      setConnectionStatus('error');
      setConnectionMessage('연결 상태 확인 중 오류가 발생했습니다.');
      onConnectionChange?.(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#28a745';
      case 'disconnected': return '#dc3545';
      case 'error': return '#dc3545';
      case 'checking': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'error': return '⚠️';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  return (
    <div className="connection-status-container">
      <div className="card">
        <div className="connection-header">
          <h2>
            {getStatusIcon()} AWS 인프라 연결 상태
          </h2>
        </div>

        <div className="connection-content">
          {connectionStatus === 'checking' && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${connectionProgress}%`,
                    backgroundColor: getStatusColor()
                  }}
                />
              </div>
              <div className="progress-text">{connectionProgress}%</div>
            </div>
          )}

          <div 
            className="status-message"
            style={{ color: getStatusColor() }}
          >
            {connectionMessage}
          </div>

          {connectionStatus !== 'checking' && (
            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={checkConnection}
              >
                다시 연결 확인
              </button>
              
              {connectionStatus === 'connected' && (
                <button 
                  className="btn btn-success"
                  onClick={() => onConnectionChange?.(true)}
                >
                  리소스 정보 보기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .connection-status-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .connection-header h2 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 1.5rem;
        }

        .connection-content {
          text-align: center;
        }

        .progress-container {
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 10px;
        }

        .progress-text {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .status-message {
          font-size: 1.1rem;
          margin: 20px 0;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        .btn-success {
          background-color: #28a745;
          color: white;
        }

        .btn-success:hover {
          background-color: #1e7e34;
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatus;
