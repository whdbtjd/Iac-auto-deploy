import React, { useState, useEffect } from 'react';
import { voteAPI } from '../services/api';

const VoteList = ({ onVoteSelect }) => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    try {
      setLoading(true);
      const response = await voteAPI.getAllVotes();
      setVotes(response.data);
      setError('');
    } catch (err) {
      setError('투표 목록을 불러오는데 실패했습니다.');
      console.error('Error loading votes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        투표 목록을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={loadVotes}>
          다시 시도
        </button>
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#6c757d', marginBottom: '16px' }}>
            아직 생성된 투표가 없습니다
          </h3>
          <p style={{ color: '#6c757d' }}>
            새로운 투표를 만들어 보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>
          활성 투표 목록 ({votes.length}개)
        </h2>
        <button 
          className="btn btn-secondary"
          onClick={loadVotes}
          style={{ fontSize: '14px' }}
        >
          새로고침
        </button>
      </div>

      {votes.map((vote) => (
        <div key={vote.id} className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              color: '#495057', 
              marginBottom: '8px',
              fontSize: '1.25rem'
            }}>
              {vote.question}
            </h3>
            
            {vote.description && (
              <p style={{ 
                color: '#6c757d', 
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                {vote.description}
              </p>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              color: '#6c757d',
              marginBottom: '16px'
            }}>
              <span>생성일: {formatDate(vote.createdAt)}</span>
              <span>총 투표수: <strong>{vote.totalVotes}</strong></span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            {vote.options.map((option, index) => (
              <div key={option.id} className="vote-option">
                <div className="option-content">
                  <span className="option-text">
                    {index + 1}. {option.optionText}
                  </span>
                  <div className="option-stats">
                    <span className="vote-count">{option.voteCount}표</span>
                    <span className="percentage">{option.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              className="btn btn-primary"
              onClick={() => onVoteSelect(vote)}
            >
              투표하기
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.open(`/vote/${vote.id}`, '_blank')}
            >
              상세보기
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VoteList;