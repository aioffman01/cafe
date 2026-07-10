<?php
session_start();
include_once 'api_helper.php';

if (!isset($_SESSION['token'])) {
    header('Location: login.php');
    exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nickname = trim($_POST['nickname']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);
    
    if (empty($nickname)) {
        $error = '닉네임을 입력해 주세요.';
    } elseif (!empty($password) && $password !== $confirm_password) {
        $error = '변경할 비밀번호가 서로 일치하지 않습니다.';
    } else {
        $update_data = ['nickname' => $nickname];
        if (!empty($password)) {
            $update_data['password'] = $password;
        }
        
        $res = call_api('PUT', '/auth/me', $update_data);
        if ($res['status'] === 200) {
            $success = '회원 정보가 성공적으로 수정되었습니다.';
            $_SESSION['user'] = $res['data'];
            // 헤더 정보 실시간 갱신을 위해 전역 유저 변수 재선언
            $current_user = $_SESSION['user'];
        } else {
            $error = isset($res['data']['detail']) ? $res['data']['detail'] : '정보 수정 실패';
        }
    }
}

include 'layout/header.php';
include 'layout/sidebar.php';
?>

<div style="border-bottom: 1px solid var(--border-light); padding-bottom: 15px; margin-bottom: 25px;">
  <h2 style="margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
    <i data-lucide="key" style="color: var(--primary); width: 22px; height: 22px;"></i>
    내 정보 수정
  </h2>
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

<form method="POST" style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
  <div class="form-group" style="margin-bottom: 0;">
    <label>아이디</label>
    <input type="text" disabled value="<?php echo htmlspecialchars($current_user['username']); ?>" style="background-color: #f1f5f9; color: var(--text-muted); cursor: not-allowed;">
  </div>
  
  <div class="form-group" style="margin-bottom: 0;">
    <label for="nickname">닉네임 변경</label>
    <input type="text" id="nickname" name="nickname" required placeholder="변경할 닉네임을 입력하세요" value="<?php echo htmlspecialchars($current_user['nickname']); ?>">
  </div>
  
  <div class="form-group" style="margin-bottom: 0;">
    <label for="password">새 비밀번호 입력 (선택)</label>
    <input type="password" id="password" name="password" placeholder="비밀번호 변경 시에만 입력하세요">
  </div>
  
  <div class="form-group" style="margin-bottom: 0;">
    <label for="confirm_password">새 비밀번호 확인</label>
    <input type="password" id="confirm_password" name="confirm_password" placeholder="새 비밀번호를 한 번 더 입력하세요">
  </div>
  
  <button type="submit" class="btn-primary" style="margin-top: 10px;">회원 정보 수정</button>
</form>

<?php
include 'layout/footer.php';
?>
