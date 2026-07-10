import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Shield } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import type { UserProfile } from '../../auth/hooks/useAuth';
import EventModal from './EventModal';

interface CalendarViewProps {
  currentUser: UserProfile | null;
}

export default function CalendarView({ currentUser }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { useGetEvents, useDeleteEvent } = useEvents();
  const { data: events, isLoading } = useGetEvents(year, month);
  const deleteEventMutation = useDeleteEvent(year, month);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 달력 날짜 목록 연산
  const getDaysInMonth = (y: number, m: number) => {
    // 0번 인덱스는 이전 달의 마지막 일, 따라서 m월의 일수를 구하려면 m, 0을 지정
    return new Date(y, m, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    // 요일 구하기: 0(일) ~ 6(토)
    return new Date(y, m - 1, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setSelectedDate(`${year}-${formattedMonth}-${formattedDay}`);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: number) => {
    e.stopPropagation(); // 카드 클릭 전파 방지
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;
    try {
      await deleteEventMutation.mutateAsync(eventId);
    } catch (err: any) {
      alert(err.message || '일정 삭제 실패');
    }
  };

  // 날짜별로 일정 필터링
  const getEventsForDay = (day: number) => {
    if (!events) return [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventStart = event.start_time.split('T')[0];
      const eventEnd = event.end_time.split('T')[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  // 요일 헤더
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 달력 그리드 생성
  const gridCells = [];
  // 이전달 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) {
    gridCells.push(<div key={`empty-${i}`} style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-light)' }} />);
  }
  // 실제 날짜 칸 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    gridCells.push(
      <div
        key={`day-${day}`}
        onClick={() => handleDayClick(day)}
        style={{
          minHeight: '110px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          padding: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>{day}</span>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginTop: '6px',
          overflowY: 'auto',
          flexGrow: 1
        }}>
          {dayEvents.map(event => {
              const isCreatorOrAdmin = currentUser && (currentUser.nickname === event.author_nickname || currentUser.role === 'admin');
              
              const isAllDay = event.is_all_day;
              const isAdmin = event.is_admin_event;
              
              const backgroundColor = isAllDay
                ? (isAdmin ? 'var(--event-admin)' : 'var(--event-member)')
                : (isAdmin ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)');
                
              const color = isAllDay
                ? '#ffffff'
                : (isAdmin ? 'var(--event-admin)' : 'var(--event-member)');
                
              const borderLeft = isAllDay
                ? 'none'
                : `3px solid ${isAdmin ? 'var(--event-admin)' : 'var(--event-member)'}`;

              return (
                <div
                  key={event.id}
                  title={`${event.title} - ${event.description || ''}`}
                  style={{
                    fontSize: '11px',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    backgroundColor,
                    color,
                    borderLeft
                  }}
                >
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexGrow: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {isAdmin && <Shield size={10} style={{ flexShrink: 0, color: isAllDay ? '#ffffff' : 'inherit' }} />}
                    {!isAllDay && (
                      <span style={{ opacity: 0.85, marginRight: '3px', fontSize: '9px' }}>
                        {event.start_time.split('T')[1].substring(0, 5)}
                      </span>
                    )}
                    {event.title}
                  </span>
                {isCreatorOrAdmin && (
                  <button
                    onClick={(e) => handleDeleteEvent(e, event.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card-shadow" style={{
      backgroundColor: 'var(--bg-card)',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid var(--border-light)'
    }}>
      {/* 달력 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={20} color="var(--primary)" />
          공유 캘린더 일정
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <ChevronLeft size={20} color="var(--text-muted)" />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>{year}년 {month}월</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <ChevronRight size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* 범례 */}
        <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--event-admin)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--event-admin)', fontWeight: 600 }}>공식 공지</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--event-member)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--event-member)', fontWeight: 600 }}>일반 멤버</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>일정을 불러오는 중...</div>
      ) : (
        <div>
          {/* 요일 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '14px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '8px',
            marginBottom: '4px'
          }}>
            {weekDays.map(day => (
              <div key={day} style={{ color: day === '일' ? 'red' : day === '토' ? 'blue' : 'var(--text-dark)' }}>{day}</div>
            ))}
          </div>

          {/* 달력 날짜 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            backgroundColor: 'var(--border-light)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {gridCells}
          </div>
        </div>
      )}

      {isModalOpen && selectedDate && (
        <EventModal
          selectedDate={selectedDate}
          year={year}
          month={month}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
