import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../../services/api.js';

const VPCDashboard = () => {
  const [vpcData, setVpcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVPCData();
  }, []);

  const loadVPCData = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getVPCInfo();
      setVpcData(response.data);
      setError(null);
    } catch (err) {
      console.error('VPC 정보 조회 실패:', err);
      setError('VPC 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getSubnetTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'public': return '🌐';
      case 'private': return '🔒';
      default: return '🔹';
    }
  };

  const getSubnetTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'public': return '#007bff';
      case 'private': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getDefaultSubnetName = (subnet) => {
    // 서브넷 타입과 CIDR 블록으로 매핑
    const cidrBlock = subnet.cidrBlock;
    const subnetType = subnet.subnetType?.toLowerCase();
    
    if (subnetType === 'public') {
      if (cidrBlock?.includes('10.0.0.')) return 'pub-sub-1';
      if (cidrBlock?.includes('10.0.1.')) return 'pub-sub-2';
    } else if (subnetType === 'private') {
      if (cidrBlock?.includes('10.0.10.')) return 'pri-sub-was-1';
      if (cidrBlock?.includes('10.0.11.')) return 'pri-sub-was-2';
      if (cidrBlock?.includes('10.0.20.')) return 'pri-sub-db-1';
      if (cidrBlock?.includes('10.0.21.')) return 'pri-sub-db-2';
    }
    
    return subnet.name || `Subnet ${subnet.subnetId?.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>VPC 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadVPCData}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vpc-dashboard">
      <div className="dashboard-header">
        <h2>🌐 VPC 네트워크 상세 정보</h2>
        <p>Virtual Private Cloud 구성 및 네트워크 토폴로지</p>
      </div>

      {vpcData && (
        <div className="vpc-content">
          {/* VPC 기본 정보 */}
          <div className="vpc-main-card">
            <div className="card-header">
              <div className="vpc-info">
                <h3>🏷️ {vpcData.name || 'VPC'}</h3>
                <span className="vpc-id">{vpcData.vpcId}</span>
              </div>
              <span className={`status-badge ${vpcData.state?.toLowerCase()}`}>
                {vpcData.state || 'Unknown'}
              </span>
            </div>

            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">CIDR 블록:</span>
                  <span className="value cidr">{vpcData.cidrBlock || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">기본 VPC:</span>
                  <span className={`value ${vpcData.isDefault ? 'default' : 'custom'}`}>
                    {vpcData.isDefault ? '✅ 예' : '❌ 아니오'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">라우팅 테이블:</span>
                  <span className="value">{vpcData.routeTableCount || 0}개</span>
                </div>
                <div className="info-item">
                  <span className="label">보안 그룹:</span>
                  <span className="value">{vpcData.securityGroupCount || 0}개</span>
                </div>
              </div>
            </div>
          </div>

          {/* 인터넷 게이트웨이 정보 */}
          {vpcData.internetGateway && (
            <div className="igw-section">
              <h3>🌍 인터넷 게이트웨이</h3>
              <div className="igw-card">
                <div className="igw-info">
                  <div className="info-item">
                    <span className="label">게이트웨이 ID:</span>
                    <span className="value gateway-id">{vpcData.internetGateway.internetGatewayId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">상태:</span>
                    <span className={`value ${vpcData.internetGateway.state?.toLowerCase()}`}>
                      {vpcData.internetGateway.state === 'attached' ? '✅ 연결됨' : '❌ 연결 안됨'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">연결된 VPC:</span>
                    <span className="value">{vpcData.internetGateway.attachedVpcId}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 서브넷 정보 */}
          {vpcData.subnets && vpcData.subnets.length > 0 && (
            <div className="subnets-section">
              <h3>🏢 서브넷 ({vpcData.subnets.length}개)</h3>
              <div className="subnets-grid">
                {vpcData.subnets.map((subnet, index) => (
                  <div key={subnet.subnetId || index} className="subnet-card">
                    <div className="subnet-header">
                      <div className="subnet-info">
                        <h4>
                          {getSubnetTypeIcon(subnet.subnetType)} 
                          {subnet.name || getDefaultSubnetName(subnet)}
                        </h4>
                      </div>
                      <span 
                        className="subnet-type-badge"
                        style={{ backgroundColor: getSubnetTypeColor(subnet.subnetType) }}
                      >
                        {subnet.subnetType || 'Unknown'}
                      </span>
                    </div>

                    <div className="subnet-content">
                      <div className="subnet-info-grid">
                        <div className="info-item">
                          <span className="label">CIDR:</span>
                          <span className="value cidr">{subnet.cidrBlock}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">가용 영역:</span>
                          <span className="value">{subnet.availabilityZone}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">상태:</span>
                          <span className="value">{subnet.state}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Public IP 자동 할당:</span>
                          <span className={`value ${subnet.mapPublicIpOnLaunch ? 'enabled' : 'disabled'}`}>
                            {subnet.mapPublicIpOnLaunch ? '✅ 활성화' : '❌ 비활성화'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">사용 가능한 IP:</span>
                          <span className="value">{subnet.availableIpAddressCount || 0}개</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .vpc-dashboard {
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

        .vpc-main-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 25px;
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

        .vpc-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
        }

        .vpc-id {
          font-family: monospace;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
        }

        .status-badge.available {
          background-color: #28a745;
        }

        .status-badge.pending {
          background-color: #ffc107;
          color: #000;
        }

        .info-grid, .subnet-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

        .value.default {
          color: #ffc107;
        }

        .value.custom {
          color: #28a745;
        }

        .value.enabled {
          color: #28a745;
        }

        .value.disabled {
          color: #dc3545;
        }

        .value.attached {
          color: #28a745;
        }

        .cidr, .gateway-id {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .igw-section, .subnets-section {
          margin-bottom: 30px;
        }

        .igw-section h3, .subnets-section h3 {
          margin-bottom: 20px;
          font-size: 1.4rem;
        }

        .igw-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .igw-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .subnets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }

        .subnet-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.2s ease;
        }

        .subnet-card:hover {
          transform: translateY(-2px);
        }

        .subnet-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .subnet-info h4 {
          margin: 0 0 5px 0;
          font-size: 1.2rem;
        }

        .subnet-id {
          font-family: monospace;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .subnet-type-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
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
          .card-header, .subnet-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .info-grid, .subnet-info-grid, .igw-info {
            grid-template-columns: 1fr;
          }

          .subnets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VPCDashboard;
