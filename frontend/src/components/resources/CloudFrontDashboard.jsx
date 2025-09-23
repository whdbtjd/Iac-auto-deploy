import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../../services/api.js';

const CloudFrontDashboard = () => {
  const [cloudFrontData, setCloudFrontData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCloudFrontData();
  }, []);

  const loadCloudFrontData = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getCloudFrontInfo();
      setCloudFrontData(response.data);
      setError(null);
    } catch (err) {
      console.error('CloudFront 정보 조회 실패:', err);
      setError('CloudFront 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'deployed': return '#28a745';
      case 'inprogress': return '#007bff';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'deployed': return '✅';
      case 'inprogress': return '🔄';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>CloudFront 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadCloudFrontData}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cloudfront-dashboard">
      <div className="dashboard-header">
        <h2>☁️ CloudFront CDN 상세 정보</h2>
        <p>Content Delivery Network 배포 및 캐시 설정</p>
      </div>

      {cloudFrontData && (
        <div className="cloudfront-content">
          <div className="cloudfront-main-card">
            <div className="card-header">
              <div className="distribution-info">
                <h3>📡 Distribution</h3>
                <span className="distribution-id">{cloudFrontData.distributionId}</span>
              </div>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(cloudFrontData.status) }}
              >
                {getStatusIcon(cloudFrontData.status)} {cloudFrontData.status || 'Unknown'}
              </span>
            </div>

            <div className="card-content">
              <div className="info-section">
                <h4>🔗 기본 정보</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">도메인 이름:</span>
                    <div className="domain-value">
                      <code>{cloudFrontData.domainName}</code>
                      <button 
                        className="open-btn"
                        onClick={() => window.open(`https://${cloudFrontData.domainName}`, '_blank')}
                        title="새 탭에서 열기"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="label">활성화 상태:</span>
                    <span className={`value ${cloudFrontData.enabled ? 'enabled' : 'disabled'}`}>
                      {cloudFrontData.enabled ? '✅ 활성화' : '❌ 비활성화'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">가격 클래스:</span>
                    <span className="value">{cloudFrontData.priceClass || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">기본 루트 객체:</span>
                    <span className="value">{cloudFrontData.defaultRootObject || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">최종 수정:</span>
                    <span className="value">
                      {cloudFrontData.lastModifiedTime ? 
                        new Date(cloudFrontData.lastModifiedTime).toLocaleString('ko-KR') : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">설명:</span>
                    <span className="value">{cloudFrontData.comment || '설명 없음'}</span>
                  </div>
                </div>
              </div>

              {cloudFrontData.origins && cloudFrontData.origins.length > 0 && (
                <div className="origins-section">
                  <h4>🎯 Origins ({cloudFrontData.origins.length}개)</h4>
                  <div className="origins-grid">
                    {cloudFrontData.origins.map((origin, index) => (
                      <div key={origin.originId || index} className="origin-card">
                        <div className="origin-header">
                          <h5>{origin.originId || `Origin ${index + 1}`}</h5>
                          <span className="origin-type-badge">
                            {origin.originType || 'Unknown'}
                          </span>
                        </div>
                        <div className="origin-details">
                          <div className="origin-item">
                            <span className="label">도메인:</span>
                            <span className="value domain-name">{origin.domainName}</span>
                          </div>
                          <div className="origin-item">
                            <span className="label">경로:</span>
                            <span className="value">{origin.originPath || '/'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="performance-section">
                <h4>⚡ 성능 및 캐시 설정</h4>
                <div className="performance-grid">
                  <div className="performance-item">
                    <div className="performance-header">
                      <span className="performance-title">글로벌 엣지 로케이션</span>
                      <span className="performance-value">200+ 위치</span>
                    </div>
                    <div className="performance-description">
                      전 세계 AWS 엣지 로케이션을 통한 콘텐츠 배포
                    </div>
                  </div>

                  <div className="performance-item">
                    <div className="performance-header">
                      <span className="performance-title">HTTP/HTTPS 지원</span>
                      <span className="performance-value">✅ 활성화</span>
                    </div>
                    <div className="performance-description">
                      SSL/TLS 인증서를 통한 보안 연결 지원
                    </div>
                  </div>

                  <div className="performance-item">
                    <div className="performance-header">
                      <span className="performance-title">압축</span>
                      <span className="performance-value">🗜️ 자동</span>
                    </div>
                    <div className="performance-description">
                      Gzip 압축을 통한 전송 최적화
                    </div>
                  </div>

                  <div className="performance-item">
                    <div className="performance-header">
                      <span className="performance-title">캐시 TTL</span>
                      <span className="performance-value">⏰ 기본 24시간</span>
                    </div>
                    <div className="performance-description">
                      정적 콘텐츠의 기본 캐시 유지 시간
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cloudfront-dashboard {
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

        .cloudfront-main-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 25px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 1000px;
          margin: 0 auto;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .distribution-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
        }

        .distribution-id {
          font-family: monospace;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
        }

        .info-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .info-section h4 {
          margin: 0 0 15px 0;
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .value {
          font-size: 1rem;
          font-weight: 500;
        }

        .value.enabled {
          color: #28a745;
        }

        .value.disabled {
          color: #dc3545;
        }

        .domain-value {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .domain-value code {
          flex: 1;
          font-family: monospace;
          font-size: 0.9rem;
          word-break: break-all;
          color: #ffc107;
        }

        .open-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .open-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .origins-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .origins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .origin-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .origin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .origin-header h5 {
          margin: 0;
          font-size: 1.1rem;
        }

        .origin-type-badge {
          background: #007bff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .origin-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .origin-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .domain-name {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          word-break: break-all;
        }

        .performance-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .performance-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .performance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .performance-title {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .performance-value {
          font-size: 0.9rem;
          font-weight: 500;
          color: #ffc107;
        }

        .performance-description {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.4;
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
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .info-grid, .origins-grid, .performance-grid {
            grid-template-columns: 1fr;
          }

          .domain-value {
            flex-direction: column;
            align-items: stretch;
          }

          .origin-header, .performance-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default CloudFrontDashboard;
