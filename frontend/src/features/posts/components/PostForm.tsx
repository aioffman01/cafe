import React, { useState, useEffect } from 'react';
import { usePosts } from '../hooks/usePosts';
import { ArrowLeft, Check } from 'lucide-react';

interface PostFormProps {
  postId?: number | null;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PostForm({ postId, onBack, onSuccess }: PostFormProps) {
  const { useCreatePost, useUpdatePost, useGetPostDetail } = usePosts();
  
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 수정 모드일 때 기존 데이터 불러오기
  const { data: existingPost } = useGetPostDetail(postId || 0);

  useEffect(() => {
    if (postId && existingPost) {
      setTitle(existingPost.title);
      setContent(existingPost.content);
    }
  }, [postId, existingPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 기입해 주세요.');
      return;
    }
    setLoading(true);
    try {
      if (postId) {
        await updatePostMutation.mutateAsync({
          postId,
          data: { title, content }
        });
      } else {
        await createPostMutation.mutateAsync({ title, content });
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message || '글 작성에 실패했습니다.');
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
        justifyContent: 'space-between',
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
        >
          <ArrowLeft size={18} />
          취소
        </button>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          {postId ? '게시글 수정' : '새 게시글 쓰기'}
        </h3>
        <div style={{ width: '40px' }} /> {/* 밸런스용 여백 */}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="post-title" style={{ fontSize: '14px', fontWeight: 600 }}>제목</label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '16px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="post-content" style={{ fontSize: '14px', fontWeight: 600 }}>내용</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="카페 멤버들과 나누고 싶은 이야기를 적어보세요..."
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '15px',
              height: '300px',
              resize: 'vertical',
              outline: 'none',
              lineHeight: '1.6'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
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
          <Check size={18} />
          {loading ? '저장 중...' : '게시글 저장'}
        </button>
      </form>
    </div>
  );
}
