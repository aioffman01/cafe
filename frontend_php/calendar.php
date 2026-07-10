<?php
session_start();
include_once 'api_helper.php';

// 1. 현재 연월 파라미터 파싱 (기본값: 오늘 연월)
$year = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y'));
$month = isset($_GET['month']) ? intval($_GET['month']) : intval(date('n'));

// 이전달 / 다음달 계산
$prev_year = $year;
$prev_month = $month - 1;
if ($prev_month < 1) {
    $prev_month = 12;
    $prev_year--;
}

$next_year = $year;
$next_month = $month + 1;
if ($next_month > 12) {
    $next_month = 1;
    $next_year++;
}

// 2. 일정 생성 요청 처리
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['title'])) {
    if (!isset($_SESSION['token'])) {
        header('Location: login.php');
        exit;
    }
    
    $title = trim($_POST['title']);
    $description = trim($_POST['description']);
    $is_all_day = isset($_POST['is_all_day']);
    $start_date = $_POST['start_date'];
    $end_date = $_POST['end_date'];
    
    if (empty($title)) {
        $error = '일정 제목을 입력해 주세요.';
    } elseif (strtotime($start_date) > strtotime($end_date)) {
        $error = '종료일은 시작일보다 빠를 수 없습니다.';
    } else {
        if ($is_all_day) {
            $start_time = $start_date . 'T00:00:00';
            $end_time = $end_date . 'T23:59:59';
        } else {
            $start_time = $start_date . 'T' . $_POST['start_hour'] . ':' . $_POST['start_minute'] . ':00';
            $end_time = $end_date . 'T' . $_POST['end_hour'] . ':' . $_POST['end_minute'] . ':00';
        }
        
        $res = call_api('POST', '/events', [
            'title' => $title,
            'description' => $description,
            'start_time' => $start_time,
            'end_time' => $end_time,
            'is_all_day' => $is_all_day
        ]);
        
        if ($res['status'] === 201) {
            header("Location: calendar.php?year={$year}&month={$month}");
            exit;
        } else {
            $error = isset($res['data']['detail']) ? $res['data']['detail'] : '일정 등록 실패';
        }
    }
}

// 3. 일정 삭제 요청 처리
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['event_id'])) {
    if (!isset($_SESSION['token'])) {
        header('Location: login.php');
        exit;
    }
    $del_id = intval($_GET['event_id']);
    call_api('DELETE', "/events/{$del_id}");
    header("Location: calendar.php?year={$year}&month={$month}");
    exit;
}

// 4. API로 해당 월의 일정들 조회
$events_res = call_api('GET', '/events', null); // 기존 uvicorn API는 전체 범위를 내려주거나 쿼리를 수집함
$all_events = ($events_res['status'] === 200) ? $events_res['data'] : [];

// 5. 달력 그리드 계산
$first_day_timestamp = mktime(0, 0, 0, $month, 1, $year);
$days_in_month = date('t', $first_day_timestamp);
$first_day_of_week = date('w', $first_day_timestamp); // 0(일) ~ 6(토)

include 'layout/header.php';
include 'layout/sidebar.php';
?>

<!-- 캘린더 네비게이션 헤더 -->
<div class="calendar-header">
  <div style="display: flex; align-items: center; gap: 8px;">
    <i data-lucide="calendar" style="color: var(--primary); width: 22px; height: 22px;"></i>
    <h2 style="margin: 0; font-size: 20px; font-weight: 700;">공유 캘린더</h2>
  </div>
  
  <div style="display: flex; align-items: center; gap: 15px;">
    <button onclick="location.href='calendar.php?year=<?php echo $prev_year; ?>&month=<?php echo $prev_month; ?>'" style="background: none; border: 1px solid var(--border-light); padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center;">
      <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
    </button>
    <span style="font-size: 18px; font-weight: 700; min-width: 100px; text-align: center; color: var(--text-dark);">
      <?php echo $year; ?>년 <?php echo $month; ?>월
    </span>
    <button onclick="location.href='calendar.php?year=<?php echo $next_year; ?>&month=<?php echo $next_month; ?>'" style="background: none; border: 1px solid var(--border-light); padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center;">
      <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
    </button>
  </div>
</div>

<?php if ($error): ?>
  <div class="alert alert-danger">
    <i data-lucide="shield-alert" style="width: 16px; height: 16px;"></i>
    <span><?php echo htmlspecialchars($error); ?></span>
  </div>
<?php endif; ?>

<!-- 캘린더 그리드 영역 -->
<div class="calendar-grid">
  <!-- 요일 헤더 -->
  <div class="calendar-day-header" style="color: #ef4444;">일</div>
  <div class="calendar-day-header">월</div>
  <div class="calendar-day-header">화</div>
  <div class="calendar-day-header">수</div>
  <div class="calendar-day-header">목</div>
  <div class="calendar-day-header">금</div>
  <div class="calendar-day-header" style="color: #3b82f6;">토</div>
  
  <!-- 1일 시작 전 빈 칸 메우기 -->
  <?php for ($i = 0; $i < $first_day_of_week; $i++): ?>
    <div style="background-color: #f8fafc;"></div>
  <?php endfor; ?>
  
  <!-- 날짜 루프 -->
  <?php for ($day = 1; $day <= $days_in_month; $day++): 
      $current_date_str = sprintf('%04d-%02d-%02d', $year, $month, $day);
  ?>
    <div class="calendar-cell" onclick="openEventModal('<?php echo $current_date_str; ?>')">
      <span class="day-number"><?php echo $day; ?></span>
      
      <div class="events-list">
        <?php 
        // 오늘 날짜에 걸치는 일정 필터링
        foreach ($all_events as $event) {
            $start_date = substr($event['start_time'], 0, 10);
            $end_date = substr($event['end_time'], 0, 10);
            
            if ($current_date_str >= $start_date && $current_date_str <= $end_date) {
                $is_creator_or_admin = $is_authenticated && ($current_user['nickname'] === $event['author_nickname'] || $current_user['role'] === 'admin');
                $is_all_day = $event['is_all_day'];
                $is_admin = $event['is_admin_event'];
                
                // 스타일 구분 결정
                if ($is_all_day) {
                    $chip_class = $is_admin ? 'event-solid-admin' : 'event-solid-member';
                } else {
                    $chip_class = $is_admin ? 'event-timed-admin' : 'event-timed-member';
                }
                
                echo '<div class="event-chip ' . $chip_class . '" title="' . htmlspecialchars($event['title']) . '" onclick="event.stopPropagation();">';
                echo '<span class="event-chip-text">';
                if ($is_admin) {
                    echo '<i data-lucide="shield" style="width: 10px; height: 10px; flex-shrink: 0;"></i>';
                }
                if (!$is_all_day) {
                    // 시작 시간 표기 (HH:MM)
                    echo '<span style="opacity: 0.85; margin-right: 3px; font-size: 9px;">' . substr($event['start_time'], 11, 5) . '</span>';
                }
                echo htmlspecialchars($event['title']);
                echo '</span>';
                
                if ($is_creator_or_admin) {
                    echo '<a href="calendar.php?year=' . $year . '&month=' . $month . '&action=delete&event_id=' . $event['id'] . '" onclick="return confirm(\'일정을 삭제하시겠습니까?\')" style="color: red; display: flex; align-items: center; justify-content: center; text-decoration: none; padding: 2px;">';
                    echo '<i data-lucide="trash-2" style="width: 12px; height: 12px; color: inherit;"></i>';
                    echo '</a>';
                }
                echo '</div>';
            }
        }
        ?>
      </div>
    </div>
  <?php endfor; ?>
</div>

<!-- 5. 일정 등록 모달 레이아웃 (기본 숨김) -->
<div id="event-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; backgroundColor: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
  <div class="card-shadow-lg" style="background-color: #fff; width: 100%; maxWidth: 480px; border-radius: 12px; overflow: hidden;">
    <!-- 모달 헤더 -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border-light)">
      <h4 style="margin: 0; font-size: 16px; font-weight: 600;">일정 등록</h4>
      <button onclick="closeEventModal()" style="background: none; border: none; cursor: pointer; display: flex; padding: 0;">
        <i data-lucide="x" style="width: 20px; height: 20px; color: var(--text-muted);"></i>
      </button>
    </div>

    <!-- 모달 폼 -->
    <form method="POST" style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
      <?php if (!$is_authenticated): ?>
        <div style="text-align: center; padding: 20px 0; color: var(--text-muted); font-size: 14px;">
          일정을 등록하려면 먼저 <a href="login.php" style="color: var(--primary); font-weight: 600; text-decoration: none;">로그인</a>해 주세요.
        </div>
      <?php else: ?>
        <div class="form-group" style="margin-bottom: 0;">
          <label for="event-title">일정 제목 *</label>
          <input type="text" id="event-title" name="title" required placeholder="일정 제목을 입력하세요">
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="event-allday" name="is_all_day" onchange="toggleTimeFields(this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
          <label for="event-allday" style="font-size: 14px; font-weight: 500; cursor: pointer;">하루 종일 진행되는 일정 (종일)</label>
        </div>

        <div style="display: flex; gap: 15px;">
          <div class="form-group" style="flex: 1; margin-bottom: 0;">
            <label for="start-date">시작일</label>
            <input type="date" id="start-date" name="start_date" required>
          </div>
          <div class="form-group" style="flex: 1; margin-bottom: 0;">
            <label for="end-date">종료일</label>
            <input type="date" id="end-date" name="end_date" required>
          </div>
        </div>

        <!-- 시간 선택 드롭다운 (종일 일정이 아닌 경우만 표시) -->
        <div id="time-fields" style="display: flex; gap: 15px;">
          <div class="form-group" style="flex: 1; margin-bottom: 0;">
            <span style="font-size: 13px; font-weight: 600; margin-bottom: 4px; display: inline-block;">시작 시간</span>
            <div style="display: flex; gap: 6px;">
              <select name="start_hour" aria-label="시작 시간 (시)">
                <?php for ($h = 0; $h < 24; $h++): $hs = sprintf('%02d', $h); ?>
                  <option value="<?php echo $hs; ?>" <?php echo $h === 9 ? 'selected' : ''; ?>><?php echo $hs; ?>시</option>
                <?php endfor; ?>
              </select>
              <select name="start_minute" aria-label="시작 시간 (분)">
                <?php for ($m = 0; $m < 60; $m += 5): $ms = sprintf('%02d', $m); ?>
                  <option value="<?php echo $ms; ?>"><?php echo $ms; ?>분</option>
                <?php endfor; ?>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex: 1; margin-bottom: 0;">
            <span style="font-size: 13px; font-weight: 600; margin-bottom: 4px; display: inline-block;">종료 시간</span>
            <div style="display: flex; gap: 6px;">
              <select name="end_hour" aria-label="종료 시간 (시)">
                <?php for ($h = 0; $h < 24; $h++): $hs = sprintf('%02d', $h); ?>
                  <option value="<?php echo $hs; ?>" <?php echo $h === 18 ? 'selected' : ''; ?>><?php echo $hs; ?>시</option>
                <?php endfor; ?>
              </select>
              <select name="end_minute" aria-label="종료 시간 (분)">
                <?php for ($m = 0; $m < 60; $m += 5): $ms = sprintf('%02d', $m); ?>
                  <option value="<?php echo $ms; ?>"><?php echo $ms; ?>분</option>
                <?php endfor; ?>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="event-desc">메모 / 설명</label>
          <textarea id="event-desc" name="description" placeholder="일정 상세 내용이나 메모를 입력하세요" style="height: 70px; resize: none;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
          <button type="button" onclick="closeEventModal()" style="padding: 8px 16px; border: 1px solid var(--border-light); border-radius: 6px; background-color: #fff; cursor: pointer; font-size: 14px;">취소</button>
          <button type="submit" style="display: inline-flex; align-items: center; gap: 5px; backgroundColor: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; fontWeight: 600; fontSize: 14px; cursor: pointer;">
            <i data-lucide="check" style="width: 16px; height: 16px;"></i>
            등록
          </button>
        </div>
      <?php endif; ?>
    </form>
  </div>
</div>

<script>
function openEventModal(dateStr) {
    document.getElementById('start-date').value = dateStr;
    document.getElementById('end-date').value = dateStr;
    document.getElementById('event-modal').style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('event-modal').style.display = 'none';
}

function toggleTimeFields(isAllDay) {
    const timeFields = document.getElementById('time-fields');
    if (timeFields) {
        timeFields.style.display = isAllDay ? 'none' : 'flex';
    }
}
</script>

<?php
include 'layout/footer.php';
?>
