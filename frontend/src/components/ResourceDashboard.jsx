import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../services/api.js';
import EC2Dashboard from './resources/EC2Dashboard.jsx';
import ALBDashboard from './resources/ALBDashboard.jsx';
import RDSDashboard from './resources/RDSDashboard.jsx';
import VPCDashboard from './resources/VPCDashboard.jsx';
import S3Dashboard from './resources/S3Dashboard.jsx';
import CloudFrontDashboard from './resources/CloudFrontDashboard.jsx';

const ResourceDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [infraStatus, setInfraStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInfrastructureStatus();
  }, []);

  const loadInfrastructureStatus = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getInfrastructureStatus();
      setInfraStatus(response.data);
      console.log('인프라 상태 데이터:', response.data);
      setError(null);
    } catch (err) {
      console.error('인프라 상태 조회 실패:', err);
      setError('인프라 상태를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: '📊 개요', icon: '📊' },
    { id: 'ec2', name: '🖥️ EC2', icon: '🖥️' },
    { id: 'alb', name: '⚖️ ALB', icon: '⚖️' },
    { id: 'rds', name: '🗄️ RDS', icon: '🗄️' },
    { id: 'vpc', name: '🌐 VPC', icon: '🌐' },
    { id: 's3', name: '📦 S3', icon: '📦' },
    { id: 'cloudfront', name: '☁️ CloudFront', icon: '☁️' },
  ];

  const renderOverview = () => (
    <div className="overview-grid">
      <div className="overview-card ec2-card">
        <div className="card-header">
          <h3>🖥️ EC2 인스턴스</h3>
        </div>
        <div className="card-content">
          <div className="metric">
            <span className="metric-value">{infraStatus?.ec2Instances?.length || 0}</span>
            <span className="metric-label">실행 중인 인스턴스</span>
          </div>
          <div className="status">
            <span className={`status-badge ${infraStatus?.ec2Instances?.length > 0 ? 'healthy' : 'unknown'}`}>
              {infraStatus?.ec2Instances?.length > 0 ? 'Healthy' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="overview-card alb-card">
        <div className="card-header">
          <h3>⚖️ Application Load Balancer</h3>
        </div>
        <div className="card-content">
          <div className="metric">
            <span className="metric-value">
              {infraStatus?.loadBalancer?.targetGroups?.reduce((sum, tg) => sum + (tg.healthyTargetCount || 0), 0) || 0}
            </span>
            <span className="metric-label">연결된 타겟</span>
          </div>
          <div className="status">
            <span className={`status-badge ${infraStatus?.loadBalancer?.state === 'active' ? 'healthy' : 'unknown'}`}>
              {infraStatus?.loadBalancer?.state === 'active' ? 'Healthy' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="overview-card rds-card">
        <div className="card-header">
          <h3>🗄️ RDS 데이터베이스</h3>
        </div>
        <div className="card-content">
          <div className="metric">
            <span className="metric-value">1</span>
            <span className="metric-label">데이터베이스</span>
          </div>
          <div className="status">
            <span className={`status-badge ${infraStatus?.database?.status === 'available' ? 'healthy' : 'unknown'}`}>
              {infraStatus?.database?.status === 'available' ? 'Healthy' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="overview-card vpc-card">
        <div className="card-header">
          <h3>🌐 VPC 네트워크</h3>
        </div>
        <div className="card-content">
          <div className="metric">
            <span className="metric-value">{infraStatus?.network?.subnets?.length || 0}</span>
            <span className="metric-label">서브넷</span>
          </div>
          <div className="status">
            <span className={`status-badge ${infraStatus?.network?.state === 'available' ? 'healthy' : 'unknown'}`}>
              {infraStatus?.network?.state === 'available' ? 'Healthy' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="overview-card s3-card">
        <div className="card-header">
          <h3>📦 S3 스토리지</h3>
        </div>
        <div className="card-content">
          <div className="metric">
            <span className="metric-value">1</span>
            <span className="metric-label">버킷</span>
          </div>
          <div className="status">
            <span className={`status-badge ${infraStatus?.storage ? 'healthy' : 'unknown'}`}>
              {infraStatus?.storage ? 'Healthy' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="overview-card cloudfront-card">
        <div className="card-header">
          <h3>☁️ CloudFront CDN</h3>
        </div>
        <div className="card-content">
          <div className="metric">
            <span className="metric-value">1</span>
            <span className="metric-label">배포</span>
          </div>
          <div className="status">
            <span className={`status-badge ${infraStatus?.cdn?.status === 'Deployed' ? 'healthy' : 'unknown'}`}>
              {infraStatus?.cdn?.status === 'Deployed' ? 'Healthy' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverview();
      case 'ec2': return <EC2Dashboard />;
      case 'alb': return <ALBDashboard />;
      case 'rds': return <RDSDashboard />;
      case 'vpc': return <VPCDashboard />;
      case 's3': return <S3Dashboard />;
      case 'cloudfront': return <CloudFrontDashboard />;
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>AWS 리소스 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadInfrastructureStatus}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-dashboard">
      <div className="dashboard-header">
        <h1>🏗️ AWS 인프라 대시보드</h1>
        <p>실시간 AWS 리소스 상태 및 상세 정보</p>
        <button 
          className="btn btn-secondary refresh-btn" 
          onClick={loadInfrastructureStatus}
        >
          🔄 새로고침
        </button>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>

      <style jsx>{`
        .resource-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .dashboard-header p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
        }

        .refresh-btn {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }

        .dashboard-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 30px;
          justify-content: center;
        }

        .tab-button {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .tab-button.active {
          background: #007bff;
          color: white;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .overview-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-header h3 {
          margin: 0 0 15px 0;
          font-size: 1.2rem;
        }

        .card-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: bold;
          color: #007bff;
        }

        .metric-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.healthy {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
        }

        .status-badge.unhealthy {
          background: rgba(220, 53, 69, 0.2);
          color: #dc3545;
        }

        .status-badge.unknown {
          background: rgba(108, 117, 125, 0.2);
          color: #6c757d;
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

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #545b62;
        }

        @media (max-width: 768px) {
          .dashboard-header .refresh-btn {
            position: static;
            transform: none;
            margin-top: 10px;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-tabs {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ResourceDashboard;
