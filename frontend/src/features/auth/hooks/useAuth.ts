import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../../api/client';

export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  role: 'admin' | 'member';
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const response = await client.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('내 정보 로드 실패:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await client.post('/auth/login', { username, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      await fetchProfile();
      return true;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.detail || '로그인에 실패했습니다.');
    }
  };

  const signup = async (username: string, password: string, nickname: string) => {
    try {
      await client.post('/auth/signup', { username, password, nickname });
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '회원가입에 실패했습니다.');
    }
  };

  const updateProfile = async (data: { nickname?: string; password?: string }) => {
    try {
      const response = await client.put('/auth/me', data);
      setUser(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '프로필 수정에 실패했습니다.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    updateProfile,
    logout,
    refreshProfile: fetchProfile
  };
}

// 관리자용 회원 리스트 쿼리 및 제어 훅
export function useAdminUsers() {
  const queryClient = useQueryClient();

  const useGetUsers = () => {
    return useQuery<UserProfile[]>({
      queryKey: ['admin', 'users'],
      queryFn: async () => {
        const response = await client.get('/auth/users');
        return response.data;
      }
    });
  };

  const useDeleteUser = () => {
    return useMutation({
      mutationFn: async (userId: number) => {
        await client.delete(`/auth/users/${userId}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      }
    });
  };

  return {
    useGetUsers,
    useDeleteUser
  };
}
