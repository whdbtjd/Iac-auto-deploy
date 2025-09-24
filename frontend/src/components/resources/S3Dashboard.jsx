import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../../services/api.js';

const S3Dashboard = () => {
  const [s3Data, setS3Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadS3Data();
  }, []);

  const loadS3Data = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getS3Info();
      setS3Data(response.data);
      setError(null);
    } catch (err) {
      console.error('S3 정보 조회 실패:', err);
      setError('S3 정보를 불러올 수 없습니다.ㅇ');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>S3 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadS3Data}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="s3-dashboard">
      <div className="dashboard-header">
        <h2>📦 S3 스토리지 상세 정보</h2>
        <p>Simple Storage Service 버킷 구성 및 설정</p>
      </div>

      {s3Data && (
        <div className="s3-content">
          <div className="s3-main-card">
            <div className="card-header">
              <div className="bucket-info">
                <h3>🗂️ {s3Data.bucketName}</h3>
                <span className="bucket-region">리전: {s3Data.region}</span>
              </div>
              <div className="bucket-status">
                <span className="status-badge active">활성</span>
              </div>
            </div>

            <div className="card-content">
              <div className="info-section">
                <h4>📊 기본 정보</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">생성 일시:</span>
                    <span className="value">
                      {s3Data.creationDate ? 
                        new Date(s3Data.creationDate).toLocaleString('ko-KR') : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">퍼블릭 액세스:</span>
                    <span className={`value ${s3Data.publicAccessStatus === 'private' ? 'private' : 'public'}`}>
                      {s3Data.publicAccessStatus === 'private' ? '🔒 차단됨' : '🌐 허용됨'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">웹사이트 호스팅:</span>
                    <span className={`value ${s3Data.websiteHosting ? 'enabled' : 'disabled'}`}>
                      {s3Data.websiteHosting ? '✅ 활성화' : '❌ 비활성화'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">암호화:</span>
                    <span className={`value ${s3Data.encryptionEnabled ? 'enabled' : 'disabled'}`}>
                      {s3Data.encryptionEnabled ? '🔐 활성화' : '🔓 비활성화'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">버저닝:</span>
                    <span className={`value ${s3Data.versioningEnabled ? 'enabled' : 'disabled'}`}>
                      {s3Data.versioningEnabled ? '📚 활성화' : '📄 비활성화'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .s3-dashboard {
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

        .s3-main-card {
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

        .bucket-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
        }

        .bucket-region {
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

        .status-badge.active {
          background-color: #28a745;
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

        .value.private {
          color: #28a745;
        }

        .value.public {
          color: #ffc107;
        }

        .website-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .website-section h4 {
          margin: 0 0 15px 0;
          font-size: 1.1rem;
        }

        .endpoint-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .endpoint-value {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.3);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .endpoint-value code {
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

        .permissions-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 15px;
        }

        .permission-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .permission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .permission-title {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .permission-status {
          font-size: 0.8rem;
          font-weight: 500;
        }

        .permission-status.configured, .permission-status.enabled {
          color: #28a745;
        }

        .permission-status.not-configured, .permission-status.disabled {
          color: #dc3545;
        }

        .permission-description {
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

          .info-grid, .permissions-grid {
            grid-template-columns: 1fr;
          }

          .endpoint-value {
            flex-direction: column;
            align-items: stretch;
          }

          .permission-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default S3Dashboard;
