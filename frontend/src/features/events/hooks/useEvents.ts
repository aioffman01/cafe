import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../../api/client';

export interface EventResponse {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_admin_event: boolean;
  is_all_day: boolean;
  author_nickname: string;
}

export function useEvents() {
  const queryClient = useQueryClient();

  // 1. 월별 일정 조회 쿼리
  const useGetEvents = (year: number, month: number) => {
    return useQuery<EventResponse[]>({
      queryKey: ['events', year, month],
      queryFn: async () => {
        const response = await client.get('/events', {
          params: { year, month }
        });
        return response.data;
      }
    });
  };

  // 2. 일정 등록 뮤테이션
  const useCreateEvent = (year: number, month: number) => {
    return useMutation({
      mutationFn: async (data: {
        title: string;
        description?: string;
        start_time: string;
        end_time: string;
        is_all_day: boolean;
      }) => {
        const response = await client.post('/events', data);
        return response.data;
      },
      onSuccess: () => {
        // 현재 조회 중인 월의 일정을 다시 갱신
        queryClient.invalidateQueries({ queryKey: ['events', year, month] });
      }
    });
  };

  // 3. 일정 삭제 뮤테이션
  const useDeleteEvent = (year: number, month: number) => {
    return useMutation({
      mutationFn: async (eventId: number) => {
        await client.delete(`/events/${eventId}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events', year, month] });
      }
    });
  };

  return {
    useGetEvents,
    useCreateEvent,
    useDeleteEvent
  };
}
