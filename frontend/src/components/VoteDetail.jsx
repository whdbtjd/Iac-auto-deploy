import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { voteAPI } from '../services/api';

const VoteDetail = ({ vote: initialVote, onBack, onVoteUpdate }) => {
  const [vote, setVote] = useState(initialVote);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  // 컬러 팔레트
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#f9ca24'];

  useEffect(() => {
    // 로컬스토리지에서 투표 기록 확인ddaa
    const votedItems = JSON.parse(localStorage.getItem('votedItems') || '[]');
    setHasVoted(votedItems.includes(vote.id));
  }, [vote.id]);

  const handleVote = async () => {
    if (!selectedOption) {
      setError('투표할 옵션을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await voteAPI.castVote(vote.id, selectedOption);
      setVote(response.data);
      setSuccess('투표가 완료되었습니다!');
      setHasVoted(true);
      
      // 로컬스토리지에 투표 기록 저장
      const votedItems = JSON.parse(localStorage.getItem('votedItems') || '[]');
      votedItems.push(vote.id);
      localStorage.setItem('votedItems', JSON.stringify(votedItems));
      
      if (onVoteUpdate) {
        onVoteUpdate(response.data);
      }

    } catch (err) {
      setError('투표 처리에 실패했습니다. 다시 시도해주세요.');
      console.error('Error casting vote:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshVote = async () => {
    try {
      setLoading(true);
      const response = await voteAPI.getVoteById(vote.id);
      setVote(response.data);
      setError('');
    } catch (err) {
      setError('투표 정보를 새로고침하는데 실패했습니다.');
      console.error('Error refreshing vote:', err);
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

  // 차트 데이터 준비
  const chartData = vote.options.map((option, index) => ({
    name: option.optionText,
    votes: option.voteCount,
    percentage: option.percentage,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button 
          className="btn btn-secondary"
          onClick={onBack}
          disabled={loading}
        >
          ← 목록으로 돌아가기
        </button>
        <button 
          className="btn btn-secondary"
          onClick={refreshVote}
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      <div className="card">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            color: '#495057', 
            marginBottom: '12px',
            fontSize: '1.5rem'
          }}>
            {vote.question}
          </h2>
          
          {vote.description && (
            <p style={{ 
              color: '#6c757d', 
              marginBottom: '16px',
              lineHeight: '1.6',
              fontSize: '1rem'
            }}>
              {vote.description}
            </p>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <span style={{ color: '#6c757d' }}>
              생성일: {formatDate(vote.createdAt)}
            </span>
            <span style={{ 
              fontWeight: '600',
              color: '#495057',
              fontSize: '1.1rem'
            }}>
              총 투표수: {vote.totalVotes}
            </span>
          </div>
        </div>

        {!hasVoted && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              color: '#495057', 
              marginBottom: '16px',
              fontSize: '1.2rem'
            }}>
              투표해주세요
            </h3>
            
            {vote.options.map((option) => (
              <div 
                key={option.id}
                className={`vote-option ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => !loading && setSelectedOption(option.id)}
                style={{ 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <div className="option-content">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="voteOption"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                      style={{ marginRight: '12px' }}
                      disabled={loading}
                    />
                    <span className="option-text">{option.optionText}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                className="btn btn-success"
                onClick={handleVote}
                disabled={!selectedOption || loading}
                style={{ 
                  fontSize: '1.1rem',
                  padding: '16px 32px'
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ 
                      width: '16px', 
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      marginRight: '8px'
                    }}></div>
                    투표 중...
                  </>
                ) : (
                  '투표하기'
                )}
              </button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            color: '#495057', 
            marginBottom: '20px',
            fontSize: '1.2rem'
          }}>
            {hasVoted ? '투표 결과' : '현재 투표 현황'}
          </h3>
          
          {vote.options.map((option, index) => (
            <div key={option.id} style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontWeight: '500',
                  color: '#495057'
                }}>
                  {option.optionText}
                </span>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ 
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>
                    {option.voteCount}표
                  </span>
                  <span style={{ 
                    fontWeight: '600',
                    color: COLORS[index % COLORS.length],
                    minWidth: '60px',
                    textAlign: 'right'
                  }}>
                    {option.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${option.percentage}%`,
                    background: COLORS[index % COLORS.length]
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {vote.totalVotes > 0 && (
          <div className="chart-container">
            <h3 style={{ 
              color: '#495057', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              투표 결과 차트
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {/* 파이 차트 */}
              <div>
                <h4 style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px',
                  color: '#6c757d'
                }}>
                  비율별 분포
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percentage}) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="votes"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}표`, '투표수']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 바 차트 */}
              <div>
                <h4 style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px',
                  color: '#6c757d'
                }}>
                  투표수 비교
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}표`, '투표수']} />
                    <Legend />
                    <Bar dataKey="votes" name="투표수">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {hasVoted && (
          <div style={{ 
            textAlign: 'center',
            marginTop: '24px',
            padding: '16px',
            background: '#d4edda',
            borderRadius: '8px',
            color: '#155724'
          }}>
            ✅ 이미 이 투표에 참여하셨습니다. 감사합니다!
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteDetail;