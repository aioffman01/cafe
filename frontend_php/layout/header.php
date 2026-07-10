<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$is_authenticated = isset($_SESSION['token']) && isset($_SESSION['user']);
$current_user = $is_authenticated ? $_SESSION['user'] : null;
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>카페 모임 (PHP)</title>
  <link rel="stylesheet" href="css/style.css">
  <!-- Lucide 아이콘 로더 -->
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  <!-- 1. 상단 글로벌 헤더 -->
  <header>
    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="location.href='index.php'">
      <i data-lucide="coffee" style="color: var(--primary); width: 24px; height: 24px;"></i>
      <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: var(--primary);">카페 모임</span>
    </div>
    
    <div style="display: flex; align-items: center; gap: 15px;">
      <?php if ($is_authenticated): ?>
        <div style="display: flex; align-items: center; gap: 6px; background-color: #f1f5f9; padding: 6px 12px; border-radius: 20px; font-size: 14px;">
          <?php if ($current_user['role'] === 'admin'): ?>
            <i data-lucide="shield" style="width: 14px; height: 14px; color: var(--event-admin);"></i>
            <span style="font-weight: 600; color: var(--event-admin);">운영자</span>
          <?php else: ?>
            <i data-lucide="user" style="width: 14px; height: 14px; color: var(--primary);"></i>
          <?php endif; ?>
          <span style="font-weight: 500;"><?php echo htmlspecialchars($current_user['nickname']); ?>님</span>
        </div>
        <a href="logout.php" style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-muted); text-decoration: none; cursor: pointer;">
          <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
          로그아웃
        </a>
      <?php else: ?>
        <button onclick="location.href='login.php'" style="background-color: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer;">로그인</button>
      <?php endif; ?>
    </div>
  </header>
