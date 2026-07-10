<?php
session_start();
include_once 'api_helper.php';

$post_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if (!$post_id) {
    header('Location: index.php');
    exit;
}

// 1. 글 삭제 요청 처리
if (isset($_GET['action']) && $_GET['action'] === 'delete') {
    $del_res = call_api('DELETE', "/posts/{$post_id}");
    if ($del_res['status'] === 204 || $del_res['status'] === 200) {
        header('Location: index.php');
        exit;
    } else {
        $error = '게시글 삭제 실패';
    }
}

// 2. 댓글 작성 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['comment_content'])) {
    $content = trim($_POST['comment_content']);
    if (!empty($content)) {
        call_api('POST', "/posts/{$post_id}/comments", ['content' => $content]);
        header("Location: post_detail.php?id={$post_id}");
        exit;
    }
}

// 3. 댓글 삭제 요청 처리
if (isset($_GET['delete_comment_id'])) {
    $comment_id = intval($_GET['delete_comment_id']);
    call_api('DELETE', "/posts/{$post_id}/comments/{$comment_id}");
    header("Location: post_detail.php?id={$post_id}");
    exit;
}

// API로 글 상세 정보 조회
$res = call_api('GET', "/posts/{$post_id}");
if ($res['status'] !== 200) {
    header('Location: index.php');
    exit;
}
$post = $res['data'];

include 'layout/header.php';
include 'layout/sidebar.php';

$is_author_or_admin = $is_authenticated && ($current_user['nickname'] === $post['author_nickname'] || $current_user['role'] === 'admin');
?>

<!-- 뒤로가기 버튼 -->
<button onclick="location.href='index.php'" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-muted); margin-bottom: 20px; padding: 0;">
  <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
  목록으로 돌아가기
</button>

<div style="border-bottom: 1px solid var(--border-light); padding-bottom: 15px; margin-bottom: 20px;">
  <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: var(--text-dark);"><?php echo htmlspecialchars($post['title']); ?></h2>
  
  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: var(--text-muted);">
    <div style="display: flex; align-items: center; gap: 15px;">
      <span style="display: flex; align-items: center; gap: 4px;">
        <i data-lucide="user" style="width: 14px; height: 14px;"></i>
        <?php echo htmlspecialchars($post['author_nickname']); ?>
      </span>
      <span style="display: flex; align-items: center; gap: 4px;">
        <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
        <?php echo htmlspecialchars(substr(str_replace('T', ' ', $post['created_at']), 0, 16)); ?>
      </span>
    </div>
    
    <?php if ($is_author_or_admin): ?>
      <div style="display: flex; gap: 10px;">
        <button onclick="location.href='post_form.php?id=<?php echo $post_id; ?>'" style="background: none; border: 1px solid var(--border-light); padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i>
          수정
        </button>
        <button onclick="if(confirm('정말로 이 글을 삭제하시겠습니까?')) location.href='post_detail.php?id=<?php echo $post_id; ?>&action=delete'" style="background: none; border: 1px solid #FCA5A5; color: #DC2626; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
          삭제
        </button>
      </div>
    <?php endif; ?>
  </div>
</div>

<!-- 본문 내용 -->
<div style="font-size: 15px; line-height: 1.8; color: #334155; min-height: 180px; white-space: pre-wrap; margin-bottom: 30px; border-bottom: 1px solid var(--border-light); padding-bottom: 25px;">
  <?php echo htmlspecialchars($post['content']); ?>
</div>

<!-- 댓글 섹션 -->
<div>
  <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 6px;">
    <i data-lucide="message-square" style="width: 16px; height: 16px; color: var(--primary);"></i>
    댓글 (<?php echo count($post['comments']); ?>)
  </h3>
  
  <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px;">
    <?php foreach ($post['comments'] as $comment): ?>
      <div style="background-color: #f8fafc; border: 1px solid var(--border-light); padding: 12px 15px; border-radius: 8px; position: relative;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: var(--text-muted); font-weight: 500;">
          <span><?php echo htmlspecialchars($comment['author_nickname']); ?></span>
          <span><?php echo htmlspecialchars(substr(str_replace('T', ' ', $comment['created_at']), 0, 16)); ?></span>
        </div>
        <p style="margin: 0; font-size: 14px; color: var(--text-dark); padding-right: 30px;"><?php echo htmlspecialchars($comment['content']); ?></p>
        
        <?php if ($is_authenticated && ($current_user['nickname'] === $comment['author_nickname'] || $current_user['role'] === 'admin')): ?>
          <button onclick="if(confirm('댓글을 삭제하시겠습니까?')) location.href='post_detail.php?id=<?php echo $post_id; ?>&delete_comment_id=<?php echo $comment['id']; ?>'" style="position: absolute; right: 15px; top: 15px; background: none; border: none; color: #EF4444; cursor: pointer; display: flex; padding: 4px; border-radius: 4px;" title="댓글 삭제">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
  
  <?php if ($is_authenticated): ?>
    <form method="POST" style="display: flex; gap: 10px;">
      <input type="text" name="comment_content" required placeholder="댓글을 입력하세요..." style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border-light); font-size: 14px; outline: none;" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border-light)'">
      <button type="submit" style="background-color: var(--primary); color: #fff; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        <i data-lucide="send" style="width: 14px; height: 14px;"></i>
        등록
      </button>
    </form>
  <?php else: ?>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; font-size: 14px; color: var(--text-muted);">
      댓글을 작성하려면 <a href="login.php" style="color: var(--primary); font-weight: 600; text-decoration: none;">로그인</a>이 필요합니다.
    </div>
  <?php endif; ?>
</div>

<?php
include 'layout/footer.php';
?>
