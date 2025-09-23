import axios from 'axios';

// API 기본 URL 설정 (Vite 환경변수)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (로깅용)
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// AWS 리소스 API 함수들
export const resourceAPI = {
  // 서버 연결 상태 확인
  healthCheck: () => api.get('/resources/health'),
  
  // 연결 상태 확인 (지연 시간 포함)
  getConnectionStatus: (delay = 0) => api.get(`/resources/connection-status?delay=${delay}`),
  
  // 인프라 전체 상태
  getInfrastructureStatus: () => api.get('/resources/status'),
  
  // EC2 인스턴스 정보
  getEC2Info: () => api.get('/resources/ec2'),
  
  // ALB 정보
  getALBInfo: () => api.get('/resources/alb'),
  
  // RDS 정보
  getRDSInfo: () => api.get('/resources/rds'),
  
  // S3 정보
  getS3Info: () => api.get('/resources/s3'),
  
  // CloudFront 정보
  getCloudFrontInfo: () => api.get('/resources/cloudfront'),
  
  // VPC 정보
  getVPCInfo: () => api.get('/resources/vpc'),
  
  // 배포 진행상황
  getDeploymentProgress: () => api.get('/resources/deployment-progress'),
};

// 이전 버전 호환을 위해 voteAPI도 유지 (healthCheck만)
export const voteAPI = {
  healthCheck: () => resourceAPI.healthCheck(),
};

export default api;