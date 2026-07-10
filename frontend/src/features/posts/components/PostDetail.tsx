import React, { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Calendar, User, Eye, Send } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import type { UserProfile } from '../../auth/hooks/useAuth';

interface PostDetailProps {
  postId: number;
  currentUser: UserProfile | null;
  onBack: () => void;
  onEditPost: (postId: number) => void;
}

export default function PostDetail({ postId, currentUser, onBack, onEditPost }: PostDetailProps) {
  const { useGetPostDetail, useDeletePost, useCreateComment, useDeleteComment } = usePosts();
  const { data: post, isLoading, error } = useGetPostDetail(postId);
  
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await deletePostMutation.mutateAsync(postId);
      onBack();
    } catch (err: any) {
      alert(err.message || '게시글 삭제 실패');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setSubmittingComment(true);
    try {
      await createCommentMutation.mutateAsync({ postId, content: commentContent });
      setCommentContent('');
    } catch (err: any) {
      alert(err.message || '댓글 추가 실패');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteCommentMutation.mutateAsync({ postId, commentId });
    } catch (err: any) {
      alert(err.message || '댓글 삭제 실패');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>로딩 중...</div>;
  if (error || !post) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>게시글을 찾을 수 없거나 로드 에러가 발생했습니다.</div>;

  const isAuthorOrAdmin = currentUser && (currentUser.nickname === post.author_nickname || currentUser.role === 'admin');

  return (
    <div className="card-shadow" style={{
      backgroundColor: 'var(--bg-card)',
      padding: '30px',
      borderRadius: '12px',
      border: '1px solid var(--border-light)'
    }}>
      {/* 뒤로가기 및 액션 버튼들 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '15px'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '15px',
            padding: 0
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-dark)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={18} />
          목록으로
        </button>

        {isAuthorOrAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentUser?.nickname === post.author_nickname && (
              <button
                onClick={() => onEditPost(postId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#F1F5F9',
                  color: 'var(--text-dark)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
              >
                <Edit2 size={14} />
                수정
              </button>
            )}
            <button
              onClick={handleDeletePost}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#FEE2E2',
                color: '#EF4444',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FCA5A5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            >
              <Trash2 size={14} />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 게시글 본문 정보 */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 15px 0', color: 'var(--text-dark)' }}>
          {post.title}
        </h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '25px',
          backgroundColor: '#F8FAFC',
          padding: '12px 16px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} />
            <span>작성자: <strong>{post.author_nickname}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} />
            <span>작성일: {formatDate(post.created_at)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} />
            <span>조회수: {post.view_count}</span>
          </div>
        </div>

        <div style={{
          fontSize: '16px',
          lineHeight: '1.8',
          color: 'var(--text-dark)',
          minHeight: '200px',
          whiteSpace: 'pre-wrap',
          marginBottom: '40px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '40px'
        }}>
          {post.content}
        </div>
      </div>

      {/* 댓글 영역 */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          댓글 ({post.comments?.length || 0})
        </h3>

        {/* 댓글 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          {!post.comments || post.comments.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요.
            </div>
          ) : (
            post.comments.map((comment) => {
              const isCommentAuthorOrAdmin = currentUser && (currentUser.nickname === comment.author_nickname || currentUser.role === 'admin');
              return (
                <div key={comment.id} style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{comment.author_nickname}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(comment.created_at)}</span>
                      {isCommentAuthorOrAdmin && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-dark)', whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 댓글 작성 폼 */}
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} style={{
            display: 'flex',
            gap: '10px'
          }}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 작성해 주세요..."
              disabled={submittingComment}
              style={{
                flexGrow: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                fontSize: '14px',
                resize: 'none',
                height: '60px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                width: '60px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            로그인한 사용자만 댓글을 남길 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
