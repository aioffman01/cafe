<?php
session_start();
include_once 'api_helper.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    if (empty($username) || empty($password)) {
        $error = '아이디와 비밀번호를 모두 입력해 주세요.';
    } else {
        $res = call_api('POST', '/auth/login', [
            'username' => $username,
            'password' => $password
        ]);
        
        if ($res['status'] === 200) {
            $_SESSION['token'] = $res['data']['access_token'];
            
            // 토큰을 이용하여 내 유저 프로필 상세 정보 조회
            $me_res = call_api('GET', '/auth/me');
            if ($me_res['status'] === 200) {
                $_SESSION['user'] = $me_res['data'];
                header('Location: index.php');
                exit;
            } else {
                $error = '회원 정보 로드 실패';
            }
        } else {
            $error = isset($res['data']['detail']) ? $res['data']['detail'] : '아이디 또는 비밀번호가 일치하지 않습니다.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>로그인 - 카페 모임 (PHP)</title>
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
    
    <form method="POST">
      <div class="form-group">
        <label for="username">아이디</label>
        <input type="text" id="username" name="username" required placeholder="아이디를 입력하세요">
      </div>
      
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" name="password" required placeholder="비밀번호를 입력하세요">
      </div>
      
      <button type="submit" class="btn-primary" style="margin-top: 10px;">로그인</button>
    </form>
    
    <div style="text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-muted);">
      아직 회원이 아니신가요? <a href="signup.php" style="color: var(--primary); text-decoration: none; font-weight: 600;">회원가입</a>
    </div>
  </div>
  <script>lucide.createIcons();</script>
</body>
</html>
