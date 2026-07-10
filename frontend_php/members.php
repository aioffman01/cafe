<?php
session_start();
include_once 'api_helper.php';

// 어드민 검증 가드
if (!isset($_SESSION['token']) || !isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('Location: index.php');
    exit;
}

$error = '';
$success = '';

// 1. 강퇴 요청 처리
if (isset($_GET['action']) && $_GET['action'] === 'kick' && isset($_GET['user_id'])) {
    $kick_id = intval($_GET['user_id']);
    if ($kick_id === $_SESSION['user']['id']) {
        $error = '운영자 본인을 목록에서 삭제하거나 강퇴할 수 없습니다.';
    } else {
        $del_res = call_api('DELETE', "/auth/users/{$kick_id}");
        if ($del_res['status'] === 204 || $del_res['status'] === 200) {
            $success = '강퇴 처리가 완료되었습니다.';
        } else {
            $error = '강퇴 처리 실패';
        }
    }
}

// 2. 전체 가입 회원 목록 조회
$res = call_api('GET', '/auth/users');
$users = ($res['status'] === 200) ? $res['data'] : [];

include 'layout/header.php';
include 'layout/sidebar.php';
?>

<div style="border-bottom: 1px solid var(--border-light); padding-bottom: 15px; margin-bottom: 25px;">
  <h2 style="margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
    <i data-lucide="users" style="color: var(--primary); width: 22px; height: 22px;"></i>
    멤버 관리 (운영자 전용)
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

<table>
  <thead>
    <tr>
      <th style="width: 10%;">No</th>
      <th style="width: 35%;">가입 ID</th>
      <th style="width: 35%;">닉네임</th>
      <th style="width: 10%; text-align: center;">등급</th>
      <th style="width: 10%; text-align: center;">관리</th>
    </tr>
  </thead>
  <tbody>
    <?php if (empty($users)): ?>
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          가입된 회원이 없습니다.
        </td>
      </tr>
    <?php else: ?>
      <?php foreach ($users as $idx => $user): ?>
        <tr>
          <td style="color: var(--text-muted);"><?php echo $idx + 1; ?></td>
          <td style="font-weight: 500;"><?php echo htmlspecialchars($user['username']); ?></td>
          <td><?php echo htmlspecialchars($user['nickname']); ?></td>
          <td style="text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 4px; background-color: <?php echo $user['role'] === 'admin' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(3, 199, 90, 0.1)'; ?>; color: <?php echo $user['role'] === 'admin' ? 'var(--event-admin)' : 'var(--primary)'; ?>; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
              <?php if ($user['role'] === 'admin'): ?>
                <i data-lucide="shield" style="width: 10px; height: 10px;"></i>
                운영자
              <?php else: ?>
                <i data-lucide="user" style="width: 10px; height: 10px;"></i>
                일반
              <?php endif; ?>
            </div>
          </td>
          <td style="text-align: center;">
            <?php if ($user['id'] !== $_SESSION['user']['id']): ?>
              <a href="members.php?action=kick&user_id=<?php echo $user['id']; ?>" onclick="return confirm('정말로 이 회원을 강제 탈퇴시키겠습니까?')" style="color: #EF4444; cursor: pointer; padding: 4px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none;">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </a>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
    <?php endif; ?>
  </tbody>
</table>

<?php
include 'layout/footer.php';
?>
