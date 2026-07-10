import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../../api/client';

export interface PostResponse {
  id: number;
  title: string;
  author_nickname: string;
  view_count: number;
  created_at: string;
}

export interface CommentResponse {
  id: number;
  post_id: number;
  author_nickname: string;
  content: string;
  created_at: string;
}

export interface PostDetailResponse extends PostResponse {
  content: string;
  comments: CommentResponse[];
}

export function usePosts() {
  const queryClient = useQueryClient();

  // 1. 게시글 목록 조회 쿼리
  const useGetPosts = () => {
    return useQuery<PostResponse[]>({
      queryKey: ['posts'],
      queryFn: async () => {
        const response = await client.get('/posts');
        return response.data;
      }
    });
  };

  // 2. 게시글 상세 조회 쿼리
  const useGetPostDetail = (postId: number) => {
    return useQuery<PostDetailResponse>({
      queryKey: ['posts', postId],
      queryFn: async () => {
        const response = await client.get(`/posts/${postId}`);
        return response.data;
      },
      enabled: !!postId
    });
  };

  // 3. 게시글 작성 뮤테이션
  const useCreatePost = () => {
    return useMutation({
      mutationFn: async (data: { title: string; content: string }) => {
        const response = await client.post('/posts', data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    });
  };

  // 4. 게시글 수정 뮤테이션
  const useUpdatePost = () => {
    return useMutation({
      mutationFn: async ({ postId, data }: { postId: number; data: { title: string; content: string } }) => {
        const response = await client.put(`/posts/${postId}`, data);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
      }
    });
  };

  // 5. 게시글 삭제 뮤테이션
  const useDeletePost = () => {
    return useMutation({
      mutationFn: async (postId: number) => {
        await client.delete(`/posts/${postId}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    });
  };

  // 6. 댓글 작성 뮤테이션
  const useCreateComment = () => {
    return useMutation({
      mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
        const response = await client.post(`/posts/${postId}/comments`, { content });
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
      }
    });
  };

  // 7. 댓글 삭제 뮤테이션
  const useDeleteComment = () => {
    return useMutation({
      mutationFn: async ({ postId, commentId }: { postId: number; commentId: number }) => {
        await client.delete(`/posts/${postId}/comments/${commentId}`);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
      }
    });
  };

  return {
    useGetPosts,
    useGetPostDetail,
    useCreatePost,
    useUpdatePost,
    useDeletePost,
    useCreateComment,
    useDeleteComment
  };
}
