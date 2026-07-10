import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './features/auth/hooks/useAuth';
import Login from './features/auth/components/Login';
import Signup from './features/auth/components/Signup';
import PostList from './features/posts/components/PostList';
import PostDetail from './features/posts/components/PostDetail';
import PostForm from './features/posts/components/PostForm';
import CalendarView from './features/events/components/CalendarView';
import ProfileEdit from './features/auth/components/ProfileEdit';
import MemberList from './features/auth/components/MemberList';
import { MessageSquare, Calendar, LogOut, User, Coffee, Shield, Key, Users } from 'lucide-react';

const queryClient = new QueryClient();

function MainAppContent() {
  const { user, isLoading, isAuthenticated, login, signup, updateProfile, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  // 메인 네비게이션 상태 ('board' | 'calendar' | 'profile' | 'members')
  const [activeTab, setActiveTab] = useState<'board' | 'calendar' | 'profile' | 'members'>('board');

  // 게시판 세부 경로 상태
  // 'list' | 'detail' | 'form'
  const [boardView, setBoardView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-muted)',
        fontSize: '18px'
      }}>
        로딩 중...
      </div>
    );
  }

  // 로그인 전 상태인 경우
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login
        onLogin={login}
        onSwitchToSignup={() => setAuthView('signup')}
      />
    ) : (
      <Signup
        onSignup={signup}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 글로벌 헤더 */}
      <header className="card-shadow glass-effect" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        padding: '0 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-light)'
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setActiveTab('board'); setBoardView('list'); }}>
          <Coffee size={24} color="var(--primary)" />
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>카페 모임</span>
        </div>

        {/* 회원 정보 프로필 위젯 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(3, 199, 90, 0.08)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            color: 'var(--primary)',
            fontWeight: 600
          }}>
            {user?.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
            <span>{user?.nickname}</span>
            <span style={{
              fontSize: '10px',
              backgroundColor: user?.role === 'admin' ? 'var(--event-admin)' : 'var(--primary)',
              color: '#fff',
              padding: '1px 5px',
              borderRadius: '10px',
              marginLeft: '4px'
            }}>
              {user?.role === 'admin' ? '관리자' : '일반'}
            </span>
          </div>

          <button
            onClick={logout}
            title="로그아웃"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = 'var(--text-dark)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* 2. 메인 컨테이너 레이아웃 (좌측 메뉴 사이드바 & 우측 컨텐츠 영역) */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '30px auto',
        padding: '0 20px',
        flexGrow: 1,
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '30px'
      }}>
        {/* 사이드바 메뉴 */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => { setActiveTab('board'); setBoardView('list'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'board' ? 700 : 500,
              backgroundColor: activeTab === 'board' ? 'var(--accent-mint)' : 'transparent',
              color: activeTab === 'board' ? 'var(--primary-hover)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <MessageSquare size={18} />
            자유게시판
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'calendar' ? 700 : 500,
              backgroundColor: activeTab === 'calendar' ? 'var(--accent-mint)' : 'transparent',
              color: activeTab === 'calendar' ? 'var(--primary-hover)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <Calendar size={18} />
            공유 캘린더
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'profile' ? 700 : 500,
              backgroundColor: activeTab === 'profile' ? 'var(--accent-mint)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--primary-hover)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <Key size={18} />
            내 정보 수정
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('members')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '14px 18px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: activeTab === 'members' ? 700 : 500,
                backgroundColor: activeTab === 'members' ? 'var(--accent-mint)' : 'transparent',
                color: activeTab === 'members' ? 'var(--primary-hover)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Users size={18} />
              멤버 관리
            </button>
          )}
        </aside>

        {/* 컨텐츠 렌더링 영역 */}
        <main>
          {activeTab === 'board' && (
            <>
              {boardView === 'list' && (
                <PostList
                  onSelectPost={(id) => { setSelectedPostId(id); setBoardView('detail'); }}
                  onWritePost={() => { setSelectedPostId(null); setBoardView('form'); }}
                />
              )}
              {boardView === 'detail' && selectedPostId !== null && (
                <PostDetail
                  postId={selectedPostId}
                  currentUser={user}
                  onBack={() => setBoardView('list')}
                  onEditPost={(id) => { setSelectedPostId(id); setBoardView('form'); }}
                />
              )}
              {boardView === 'form' && (
                <PostForm
                  postId={selectedPostId}
                  onBack={() => setBoardView(selectedPostId ? 'detail' : 'list')}
                  onSuccess={() => setBoardView('list')}
                />
              )}
            </>
          )}

          {activeTab === 'calendar' && (
            <CalendarView currentUser={user} />
          )}

          {activeTab === 'profile' && user && (
            <ProfileEdit currentUser={user} onUpdateProfile={updateProfile} />
          )}

          {activeTab === 'members' && user && (
            <MemberList currentUser={user} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainAppContent />
    </QueryClientProvider>
  );
}
