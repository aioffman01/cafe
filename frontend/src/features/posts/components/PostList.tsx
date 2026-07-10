import { Eye, Plus, MessageSquare } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';

interface PostListProps {
  onSelectPost: (postId: number) => void;
  onWritePost: () => void;
}

export default function PostList({ onSelectPost, onWritePost }: PostListProps) {
  const { useGetPosts } = usePosts();
  const { data: posts, isLoading, error } = useGetPosts();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>게시글을 불러오는 중입니다...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>게시글 로드 중 문제가 발생했습니다.</div>;

  return (
    <div className="card-shadow" style={{
      backgroundColor: 'var(--bg-card)',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid var(--border-light)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={20} color="var(--primary)" />
          자유게시판
        </h3>
        <button
          onClick={onWritePost}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          <Plus size={16} />
          글쓰기
        </button>
      </div>

      {!posts || posts.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          등록된 게시글이 아직 없습니다. 첫 글을 작성해 보세요!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px 10px', width: '60%' }}>제목</th>
                <th style={{ padding: '12px 10px', width: '15%' }}>작성자</th>
                <th style={{ padding: '12px 10px', width: '15%' }}>작성일</th>
                <th style={{ padding: '12px 10px', width: '10%', textAlign: 'center' }}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => onSelectPost(post.id)}
                  style={{
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 10px', fontWeight: 500, color: 'var(--text-dark)' }}>
                    {post.title}
                  </td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>{post.author_nickname}</td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} />
                      {post.view_count}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
