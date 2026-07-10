<?php
$current_page = basename($_SERVER['PHP_SELF']);
$is_admin = isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';
?>
<div class="main-content">
  <!-- 좌측 사이드바 메뉴 -->
  <aside>
    <a href="index.php" class="menu-btn <?php echo ($current_page === 'index.php' || $current_page === 'post_detail.php' || $current_page === 'post_form.php') ? 'active' : ''; ?>">
      <i data-lucide="message-square" style="width: 18px; height: 18px;"></i>
      자유게시판
    </a>
    
    <a href="calendar.php" class="menu-btn <?php echo ($current_page === 'calendar.php') ? 'active' : ''; ?>">
      <i data-lucide="calendar" style="width: 18px; height: 18px;"></i>
      공유 캘린더
    </a>
    
    <?php if (isset($_SESSION['token'])): ?>
      <a href="profile.php" class="menu-btn <?php echo ($current_page === 'profile.php') ? 'active' : ''; ?>">
        <i data-lucide="key" style="width: 18px; height: 18px;"></i>
        내 정보 수정
      </a>
      
      <?php if ($is_admin): ?>
        <a href="members.php" class="menu-btn <?php echo ($current_page === 'members.php') ? 'active' : ''; ?>">
          <i data-lucide="users" style="width: 18px; height: 18px;"></i>
          멤버 관리
        </a>
      <?php endif; ?>
    <?php endif; ?>
  </aside>
  
  <!-- 컨텐츠 메인 영역 시작 -->
  <main>
