import React, { useState } from 'react';
import { Coffee, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SignupProps {
  onSignup: (username: string, password: string, nickname: string) => Promise<boolean>;
  onSwitchToLogin: () => void;
}

export default function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !nickname) {
      setError('모든 필드를 입력해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSignup(username, password, nickname);
      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div className="card-shadow-lg glass-effect" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '35px',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-mint)',
            color: 'var(--primary)',
            marginBottom: '15px'
          }}>
            <Coffee size={32} />
          </div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 600 }}>카페 모임 회원가입</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            새로운 회원으로 가입하여 활동해 보세요
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="username" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-dark)' }}>아이디</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              disabled={loading || success}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="nickname" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-dark)' }}>닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              disabled={loading || success}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-dark)' }}>비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={loading || success}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-muted)' }}>이미 계정이 있으신가요? </span>
          <button
            onClick={onSwitchToLogin}
            disabled={success}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
