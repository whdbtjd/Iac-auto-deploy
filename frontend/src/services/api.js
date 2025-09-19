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

// API 함수들
export const voteAPI = {
  // 모든 투표 조회
  getAllVotes: () => api.get('/votes'),
  
  // 특정 투표 조회
  getVoteById: (id) => api.get(`/votes/${id}`),
  
  // 새 투표 생성
  createVote: (voteData) => api.post('/votes', voteData),
  
  // 투표하기
  castVote: (voteId, optionId) => api.post(`/votes/${voteId}/options/${optionId}`),
  
  // 투표 비활성화
  deactivateVote: (id) => api.put(`/votes/${id}/deactivate`),
  
  // 헬스체크
  healthCheck: () => api.get('/votes/health'),
};

export default api;