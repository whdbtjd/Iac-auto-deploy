import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../../services/api.js';

const EC2Dashboard = () => {
  const [ec2Data, setEC2Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEC2Data();
  }, []);

  const loadEC2Data = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getEC2Info();
      setEC2Data(response.data);
      setError(null);
    } catch (err) {
      console.error('EC2 정보조회 실패:', err);
      setError('EC2 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running': return '#28a745';
      case 'healthy': return '#28a745';
      case 'stopped': return '#dc3545';
      case 'pending': return '#ffc107';
      case 'stopping': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getHealthIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return '✅';
      case 'unhealthy': return '❌';
      case 'unknown': return '❓';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>EC2 인스턴스 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadEC2Data}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ec2-dashboard">
      <div className="dashboard-header">
        <h2>🖥️ EC2 인스턴스 상세 정보</h2>
        <p>총 {ec2Data.length}개의 인스턴스가 실행 중입니다</p>
      </div>

      <div className="ec2-grid">
        {ec2Data.map((instance, index) => (
          <div key={instance.instanceId || index} className="ec2-card">
            <div className="card-header">
              <div className="instance-info">
                <h3>{instance.instanceName || instance.getInstanceName?.() || `Instance ${index + 1}`}</h3>
                <span className="instance-id">{instance.instanceId}</span>
              </div>
              <div className="status-indicators">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(instance.state) }}
                >
                  {instance.state || 'Unknown'}
                </span>
                <span className="health-indicator">
                  {getHealthIcon(instance.healthStatus)} {instance.healthStatus || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">인스턴스 타입:</span>
                  <span className="value">{instance.instanceType || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Private IP:</span>
                  <span className="value ip-address">{instance.privateIp || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Public IP:</span>
                  <span className="value ip-address">
                    {instance.publicIp || 'None'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">AMI ID:</span>
                  <span className="value">{instance.amiId || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">아키텍처:</span>
                  <span className="value">{instance.architecture || 'N/A'}</span>
                </div>
              </div>

              {instance.tags && Object.keys(instance.tags).length > 0 && (
                <div className="tags-section">
                  <h4>태그</h4>
                  <div className="tags">
                    {Object.entries(instance.tags).map(([key, value]) => (
                      <span key={key} className="tag">
                        <span className="tag-key">{key}:</span>
                        <span className="tag-value">{value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .ec2-dashboard {
          padding: 20px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .dashboard-header h2 {
          margin-bottom: 10px;
          font-size: 1.8rem;
        }

        .dashboard-header p {
          color: rgba(255, 255, 255, 0.8);
        }

        .ec2-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .ec2-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.2s ease;
        }

        .ec2-card:hover {
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .instance-info h3 {
          margin: 0 0 5px 0;
          font-size: 1.3rem;
        }

        .instance-id {
          font-family: monospace;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .status-indicators {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
        }

        .health-indicator {
          font-size: 0.9rem;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .value {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .ip-address {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .tags-section {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 15px;
        }

        .tags-section h4 {
          margin: 0 0 10px 0;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .tag-key {
          color: rgba(255, 255, 255, 0.7);
        }

        .tag-value {
          color: white;
          font-weight: 500;
        }

        .loading-container, .error-container {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          margin: 0 auto;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
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

        @media (max-width: 768px) {
          .ec2-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 15px;
          }

          .status-indicators {
            align-items: flex-start;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EC2Dashboard;
