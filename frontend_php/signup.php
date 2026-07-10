<?php
session_start();
include_once 'api_helper.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $nickname = trim($_POST['nickname']);
    
    if (empty($username) || empty($password) || empty($nickname)) {
        $error = '모든 필드를 입력해 주세요.';
    } else {
        $res = call_api('POST', '/auth/signup', [
            'username' => $username,
            'password' => $password,
            'nickname' => $nickname
        ]);
        
        if ($res['status'] === 201) {
            $success = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.';
            header("refresh:2;url=login.php");
        } else {
            $error = isset($res['data']['detail']) ? $res['data']['detail'] : '회원가입 실패';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>회원가입 - 카페 모임 (PHP)</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body style="background-color: var(--bg-base); display: flex; justify-content: center; align-items: center; min-height: 100vh;">
  <div class="form-container">
    <div style="text-align: center; margin-bottom: 25px; cursor: pointer;" onclick="location.href='index.php'">
      <span style="font-size: 24px; font-weight: 800; color: var(--primary);">카페 모임</span>
    </div>
    
    <?php if ($error): ?>
      <div class="alert alert-danger">
        <i data-lucide="shield-alert" style="width: 16px; height: 16px;"></i>
        <span><?php echo htmlspecialchars($error); ?></span>
      </div>
    <?php endif; ?>
    
    <?php if ($success): ?>
      <div class="alert alert-success">
        <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
        <span><?php echo htmlspecialchars($success); ?></span>
      </div>
    <?php endif; ?>
    
    <form method="POST">
      <div class="form-group">
        <label for="username">아이디</label>
        <input type="text" id="username" name="username" required placeholder="아이디를 입력하세요">
      </div>
      
      <div class="form-group">
        <label for="nickname">닉네임</label>
        <input type="text" id="nickname" name="nickname" required placeholder="닉네임을 입력하세요">
      </div>
      
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" name="password" required placeholder="비밀번호를 입력하세요">
      </div>
      
      <button type="submit" class="btn-primary" style="margin-top: 10px;">회원가입</button>
    </form>
    
    <div style="text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-muted);">
      이미 회원이신가요? <a href="login.php" style="color: var(--primary); text-decoration: none; font-weight: 600;">로그인</a>
    </div>
  </div>
  <script>lucide.createIcons();</script>
</body>
</html>
