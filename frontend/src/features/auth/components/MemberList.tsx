import { Users, Trash2, Shield, User } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAuth';
import type { UserProfile } from '../hooks/useAuth';

interface MemberListProps {
  currentUser: UserProfile;
}

export default function MemberList({ currentUser }: MemberListProps) {
  const { useGetUsers, useDeleteUser } = useAdminUsers();
  const { data: users, isLoading, error } = useGetUsers();
  const deleteUserMutation = useDeleteUser();

  const handleKick = async (userId: number, nickname: string) => {
    if (userId === currentUser.id) {
      alert('자기 자신을 목록에서 삭제하거나 강퇴할 수 없습니다.');
      return;
    }
    if (!window.confirm(`정말로 멤버 [${nickname}]님을 강제 탈퇴시키겠습니까?`)) return;

    try {
      await deleteUserMutation.mutateAsync(userId);
      alert('강퇴 처리가 완료되었습니다.');
    } catch (err: any) {
      alert(err.message || '강퇴 처리 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>멤버 목록을 로드하는 중...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>멤버 관리 데이터 수신 중 권한 에러 또는 문제가 발생했습니다.</div>;

  return (
    <div className="card-shadow" style={{
      backgroundColor: 'var(--bg-card)',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid var(--border-light)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <Users size={20} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>멤버 관리 (운영자 전용)</h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '12px 10px', width: '10%' }}>No</th>
              <th style={{ padding: '12px 10px', width: '35%' }}>가입 ID</th>
              <th style={{ padding: '12px 10px', width: '35%' }}>닉네임</th>
              <th style={{ padding: '12px 10px', width: '10%', textAlign: 'center' }}>등급</th>
              <th style={{ padding: '12px 10px', width: '10%', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {users && users.map((user, idx) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background-color 0.15s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                <td style={{ padding: '14px 10px', fontWeight: 500 }}>{user.username}</td>
                <td style={{ padding: '14px 10px' }}>{user.nickname}</td>
                <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: user.role === 'admin' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(3, 199, 90, 0.1)',
                    color: user.role === 'admin' ? 'var(--event-admin)' : 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                    {user.role === 'admin' ? '운영자' : '일반'}
                  </div>
                </td>
                <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleKick(user.id, user.nickname)}
                      title="강제탈퇴"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
