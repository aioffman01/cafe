import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key } from 'lucide-react';
import type { UserProfile } from '../hooks/useAuth';

interface ProfileEditProps {
  currentUser: UserProfile;
  onUpdateProfile: (data: { nickname?: string; password?: string }) => Promise<any>;
}

export default function ProfileEdit({ currentUser, onUpdateProfile }: ProfileEditProps) {
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('변경할 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const updateData: { nickname?: string; password?: string } = {};
      if (nickname !== currentUser.nickname) {
        updateData.nickname = nickname;
      }
      if (password) {
        updateData.password = password;
      }

      if (Object.keys(updateData).length === 0) {
        setError('변경할 정보를 입력해 주세요.');
        setLoading(false);
        return;
      }

      await onUpdateProfile(updateData);
      setSuccess('회원 정보가 성공적으로 수정되었습니다.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || '정보 수정 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-shadow" style={{
      backgroundColor: 'var(--bg-card)',
      padding: '30px',
      borderRadius: '12px',
      border: '1px solid var(--border-light)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '25px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '15px'
      }}>
        <Key size={20} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>내 정보 수정</h3>
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
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>아이디</label>
          <input
            type="text"
            disabled
            value={currentUser.username}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              backgroundColor: '#F1F5F9',
              color: 'var(--text-muted)',
              fontSize: '15px',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="edit-nickname" style={{ fontSize: '14px', fontWeight: 600 }}>닉네임 변경</label>
          <input
            id="edit-nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            placeholder="변경할 닉네임을 입력하세요"
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '15px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="edit-password" style={{ fontSize: '14px', fontWeight: 600 }}>새 비밀번호 입력 (선택)</label>
          <input
            id="edit-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="비밀번호 변경 시에만 입력하세요"
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '15px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="edit-confirm-password" style={{ fontSize: '14px', fontWeight: 600 }}>새 비밀번호 확인</label>
          <input
            id="edit-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="새 비밀번호를 한 번 더 입력하세요"
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '15px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '10px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          {loading ? '저장 중...' : '회원 정보 수정'}
        </button>
      </form>
    </div>
  );
}
