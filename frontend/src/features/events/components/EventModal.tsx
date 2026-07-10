import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';

interface EventModalProps {
  selectedDate: string; // "YYYY-MM-DD"
  year: number;
  month: number;
  onClose: () => void;
}

export default function EventModal({ selectedDate, year, month, onClose }: EventModalProps) {
  const { useCreateEvent } = useEvents();
  const createEventMutation = useCreateEvent(year, month);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('18');
  const [endMinute, setEndMinute] = useState('00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('일정 제목을 입력해 주세요.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('종료 날짜는 시작 날짜보다 빠를 수 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const fullStartTime = isAllDay ? `${startDate}T00:00:00` : `${startDate}T${startHour}:${startMinute}:00`;
      const fullEndTime = isAllDay ? `${endDate}T23:59:59` : `${endDate}T${endHour}:${endMinute}:00`;
      
      await createEventMutation.mutateAsync({
        title,
        description,
        start_time: fullStartTime,
        end_time: fullEndTime,
        is_all_day: isAllDay
      });
      onClose();
    } catch (err: any) {
      alert(err.message || '일정 등록 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card-shadow-lg" style={{
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: '480px',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* 모달 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>일정 등록</h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* 모달 폼 */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="event-title" style={{ fontSize: '13px', fontWeight: 600 }}>일정 제목 *</label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              disabled={loading}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          {/* 종일 여부 체크박스 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="event-allday"
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              disabled={loading}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="event-allday" style={{ fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>하루 종일 진행되는 일정 (종일)</label>
          </div>

          {/* 시작 날짜 및 종료 날짜 */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label htmlFor="start-date" style={{ fontSize: '13px', fontWeight: 600 }}>시작일</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label htmlFor="end-date" style={{ fontSize: '13px', fontWeight: 600 }}>종료일</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* 시간 영역 (종일 일정이 아닌 경우에만 렌더링) */}
          {!isAllDay && (
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>시작 시간</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    disabled={loading}
                    aria-label="시작 시간 (시)"
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px',
                      flex: 1,
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                      <option key={`sh-${h}`} value={h}>{h}시</option>
                    ))}
                  </select>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    disabled={loading}
                    aria-label="시작 시간 (분)"
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px',
                      flex: 1,
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                      <option key={`sm-${m}`} value={m}>{m}분</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>종료 시간</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    disabled={loading}
                    aria-label="종료 시간 (시)"
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px',
                      flex: 1,
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                      <option key={`eh-${h}`} value={h}>{h}시</option>
                    ))}
                  </select>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    disabled={loading}
                    aria-label="종료 시간 (분)"
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px',
                      flex: 1,
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                      <option key={`em-${m}`} value={m}>{m}분</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="event-desc" style={{ fontSize: '13px', fontWeight: 600 }}>메모 / 설명</label>
            <textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="일정 세부 정보 또는 메모를 작성하세요"
              disabled={loading}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                fontSize: '14px',
                height: '80px',
                resize: 'none',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          {/* 등록 버튼 */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '10px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Check size={16} />
              {loading ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
