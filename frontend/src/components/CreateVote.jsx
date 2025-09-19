import React, { useState } from 'react';
import { voteAPI } from '../services/api';

const CreateVote = ({ onVoteCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', '']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const validateForm = () => {
    if (!formData.question.trim()) {
      setError('투표 질문을 입력해주세요.');
      return false;
    }
    
    if (formData.question.length > 200) {
      setError('질문은 200자 이내로 입력해주세요.');
      return false;
    }

    if (formData.description.length > 500) {
      setError('설명은 500자 이내로 입력해주세요.');
      return false;
    }

    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      setError('투표 옵션을 최소 2개 이상 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        question: formData.question.trim(),
        description: formData.description.trim(),
        options: formData.options.filter(option => option.trim())
      };

      const response = await voteAPI.createVote(submitData);
      setSuccess('투표가 성공적으로 생성되었습니다!');
      
      // 2초 후에 콜백 실행
      setTimeout(() => {
        if (onVoteCreated) {
          onVoteCreated(response.data);
        }
      }, 2000);

    } catch (err) {
      setError('투표 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('Error creating vote:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      description: '',
      options: ['', '']
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ color: '#495057', margin: 0 }}>새 투표 만들기</h2>
        <button 
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          돌아가기
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">
            투표 질문 <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="text"
            id="question"
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            className="form-control"
            placeholder="투표할 질문을 입력하세요 (최대 200자)"
            maxLength="200"
            disabled={loading}
          />
          <small style={{ color: '#6c757d', fontSize: '14px' }}>
            {formData.question.length}/200
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">투표 설명 (선택사항)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-control"
            placeholder="투표에 대한 추가 설명을 입력하세요 (최대 500자)"
            maxLength="500"
            disabled={loading}
          />
          <small style={{ color: '#6c757d', fontSize: '14px' }}>
            {formData.description.length}/500
          </small>
        </div>

        <div className="form-group">
          <label>
            투표 옵션 <span style={{ color: '#dc3545' }}>*</span>
            <small style={{ fontWeight: 'normal', color: '#6c757d' }}>
              (최소 2개, 최대 10개)
            </small>
          </label>
          
          {formData.options.map((option, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '12px',
              alignItems: 'center'
            }}>
              <span style={{ 
                minWidth: '24px',
                color: '#6c757d',
                fontWeight: '500'
              }}>
                {index + 1}.
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="form-control"
                placeholder={`옵션 ${index + 1}`}
                maxLength="100"
                disabled={loading}
                style={{ flex: 1 }}
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="btn btn-danger"
                  disabled={loading}
                  style={{ 
                    padding: '8px 12px',
                    fontSize: '14px'
                  }}
                >
                  삭제
                </button>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={addOption}
              className="btn btn-secondary"
              disabled={loading || formData.options.length >= 10}
            >
              + 옵션 추가
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={loading}
            >
              초기화
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          marginTop: '32px'
        }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
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
                생성 중...
              </>
            ) : (
              '투표 생성'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVote;