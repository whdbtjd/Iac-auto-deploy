import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../../services/api.js';

const RDSDashboard = () => {
  const [rdsData, setRdsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRDSData();
  }, []);

  const loadRDSData = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getRDSInfo();
      setRdsData(response.data);
      setError(null);
    } catch (err) {
      console.error('RDS 정보 조회 실패:', err);
      setError('RDS 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return '#28a745';
      case 'creating': return '#007bff';
      case 'deleting': return '#dc3545';
      case 'modifying': return '#ffc107';
      case 'stopped': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return '✅';
      case 'creating': return '🔄';
      case 'deleting': return '🗑️';
      case 'modifying': return '⚙️';
      case 'stopped': return '⏹️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>RDS 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadRDSData}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rds-dashboard">
      <div className="dashboard-header">
        <h2>🗄️ RDS 데이터베이스 상세 정보</h2>
        <p>관계형 데이터베이스 서비스 상태 및 구성</p>
      </div>

      {rdsData && (
        <div className="rds-content">
          <div className="rds-main-card">
            <div className="card-header">
              <div className="db-info">
                <h3>🏷️ {rdsData.identifier || 'Unknown DB'}</h3>
                <span className="db-engine">{rdsData.engine} {rdsData.engineVersion}</span>
              </div>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(rdsData.status) }}
              >
                {getStatusIcon(rdsData.status)} {rdsData.status || 'Unknown'}
              </span>
            </div>

            <div className="card-content">
              <div className="info-section">
                <h4>🔗 연결 정보</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">엔드포인트:</span>
                    <span className="value endpoint">{rdsData.endpoint || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">포트:</span>
                    <span className="value">{rdsData.port || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">가용 영역:</span>
                    <span className="value">{rdsData.availabilityZone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Multi-AZ:</span>
                    <span className={`value ${rdsData.multiAZ ? 'enabled' : 'disabled'}`}>
                      {rdsData.multiAZ ? '✅ 활성화' : '❌ 비활성화'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>⚙️ 인스턴스 구성</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">인스턴스 클래스:</span>
                    <span className="value">{rdsData.instanceClass || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">스토리지 타입:</span>
                    <span className="value">{rdsData.storageType || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">할당된 스토리지:</span>
                    <span className="value">
                      {rdsData.allocatedStorage ? `${rdsData.allocatedStorage} GB` : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">생성 시간:</span>
                    <span className="value">
                      {rdsData.createdTime ? 
                        new Date(rdsData.createdTime).toLocaleString('ko-KR') : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>🔒 보안 및 백업</h4>
                <div className="security-info">
                  <div className="security-item">
                    <span className="security-label">암호화:</span>
                    <span className={`security-value ${rdsData.encryptionEnabled ? 'enabled' : 'disabled'}`}>
                      {rdsData.encryptionEnabled ? '🔐 활성화' : '🔓 비활성화'}
                    </span>
                  </div>
                  <div className="security-item">
                    <span className="security-label">자동 백업:</span>
                    <span className={`security-value ${rdsData.backupRetentionPeriod > 0 ? 'enabled' : 'disabled'}`}>
                      {rdsData.backupRetentionPeriod > 0 ? 
                        `📦 ${rdsData.backupRetentionPeriod}일 보관` : 
                        '❌ 비활성화'
                      }
                    </span>
                  </div>
                  <div className="security-item">
                    <span className="security-label">퍼블릭 액세스:</span>
                    <span className={`security-value ${rdsData.publiclyAccessible ? 'enabled' : 'disabled'}`}>
                      {rdsData.publiclyAccessible ? '🌐 허용' : '🔒 차단'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rds-dashboard {
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

        .rds-main-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 25px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 900px;
          margin: 0 auto;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .db-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
        }

        .db-engine {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
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

        .endpoint {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.9rem;
          word-break: break-all;
        }

        .security-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .security-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .security-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .security-value {
          font-size: 1rem;
          font-weight: 500;
        }

        .security-value.enabled {
          color: #28a745;
        }

        .security-value.disabled {
          color: #dc3545;
        }

        .connection-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .connection-section h4 {
          margin: 0 0 15px 0;
          font-size: 1.1rem;
        }

        .connection-string {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.3);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .connection-string code {
          flex: 1;
          font-family: monospace;
          font-size: 0.9rem;
          word-break: break-all;
          color: #ffc107;
        }

        .copy-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.2);
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

          .info-grid, .security-info {
            grid-template-columns: 1fr;
          }

          .connection-string {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default RDSDashboard;
