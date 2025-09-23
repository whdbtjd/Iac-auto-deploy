import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../../services/api.js';

const ALBDashboard = () => {
  const [albData, setAlbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadALBData();
  }, []);

  const loadALBData = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getALBInfo();
      setAlbData(response.data);
      setError(null);
    } catch (err) {
      console.error('ALB 정보조회 실패:', err);
      setError('ALB 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return '#28a745';
      case 'unhealthy': return '#dc3545';
      case 'draining': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getHealthIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return '✅';
      case 'unhealthy': return '❌';
      case 'draining': return '⚠️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>ALB 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadALBData}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alb-dashboard">
      <div className="dashboard-header">
        <h2>⚖️ Application Load Balancer 상세 정보</h2>
        <p>로드 밸런서 및 타겟 그룹 상태</p>
      </div>

      {albData && (
        <div className="alb-content">
          {/* ALB 기본 정보 */}
          <div className="alb-main-card">
            <div className="card-header">
              <h3>🔗 로드 밸런서 정보</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: albData.state === 'active' ? '#28a745' : '#dc3545' }}
              >
                {albData.state || 'Unknown'}
              </span>
            </div>

            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">DNS 이름:</span>
                  <span className="value dns-name">{albData.dnsName || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">ARN:</span>
                  <span className="value arn">{albData.arn || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">타입:</span>
                  <span className="value">{albData.type || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">스키마:</span>
                  <span className="value">{albData.scheme || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">생성 시간:</span>
                  <span className="value">
                    {albData.createdTime ? 
                      new Date(albData.createdTime).toLocaleString('ko-KR') : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">가용 영역:</span>
                  <span className="value">
                    {albData.availabilityZones?.join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 타겟 그룹 정보 */}
          {albData.targetGroups && albData.targetGroups.length > 0 && (
            <div className="target-groups-section">
              <h3>🎯 타겟 그룹</h3>
              <div className="target-groups-grid">
                {albData.targetGroups.map((tg, index) => (
                  <div key={tg.arn || index} className="target-group-card">
                    <div className="tg-header">
                      <h4>{tg.name || `Target Group ${index + 1}`}</h4>
                      <div className="health-summary">
                        <span className="healthy-count">
                          ✅ {tg.healthyTargetCount || 0}
                        </span>
                        <span className="unhealthy-count">
                          ❌ {tg.unhealthyTargetCount || 0}
                        </span>
                      </div>
                    </div>

                    <div className="tg-info">
                      <div className="info-row">
                        <span className="label">프로토콜:</span>
                        <span className="value">{tg.protocol || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">포트:</span>
                        <span className="value">{tg.port || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">헬스체크 경로:</span>
                        <span className="value health-check-path">{tg.healthCheckPath || 'N/A'}</span>
                      </div>
                    </div>

                    {/* 타겟 상세 정보 */}
                    {tg.targets && tg.targets.length > 0 && (
                      <div className="targets-section">
                        <h5>연결된 타겟</h5>
                        <div className="targets-list">
                          {tg.targets.map((target, targetIndex) => (
                            <div key={target.targetId || targetIndex} className="target-item">
                              <div className="target-info">
                                <span className="target-id">{target.targetId}</span>
                                <span className="target-type">({target.targetType})</span>
                              </div>
                              <div className="target-health">
                                <span 
                                  className="health-status"
                                  style={{ color: getHealthColor(target.healthStatus) }}
                                >
                                  {getHealthIcon(target.healthStatus)} {target.healthStatus}
                                </span>
                              </div>
                              {target.description && (
                                <div className="target-description">
                                  {target.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .alb-dashboard {
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

        .alb-main-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 30px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.3rem;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
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

        .dns-name, .arn, .health-check-path {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          word-break: break-all;
        }

        .target-groups-section {
          margin-top: 30px;
        }

        .target-groups-section h3 {
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .target-groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .target-group-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tg-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .tg-header h4 {
          margin: 0;
          font-size: 1.2rem;
        }

        .health-summary {
          display: flex;
          gap: 15px;
          font-size: 0.9rem;
        }

        .healthy-count {
          color: #28a745;
        }

        .unhealthy-count {
          color: #dc3545;
        }

        .tg-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .targets-section {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 15px;
        }

        .targets-section h5 {
          margin: 0 0 15px 0;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .targets-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .target-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .target-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
        }

        .target-id {
          font-family: monospace;
          font-weight: 500;
        }

        .target-type {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .target-health {
          margin-bottom: 5px;
        }

        .health-status {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .target-description {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
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
          .target-groups-grid {
            grid-template-columns: 1fr;
          }

          .info-grid, .tg-info {
            grid-template-columns: 1fr;
          }

          .tg-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ALBDashboard;
