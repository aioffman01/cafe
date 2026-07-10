<?php
session_start();
include_once 'api_helper.php';

if (!isset($_SESSION['token'])) {
    header('Location: login.php');
    exit;
}

$post_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$post = null;
$error = '';

if ($post_id) {
    // 수정 모드인 경우 기존 글 조회
    $res = call_api('GET', "/posts/{$post_id}");
    if ($res['status'] === 200) {
        $post = $res['data'];
        // 권한 확인 (작성자 본인 또는 어드민만 수정 가능)
        if ($_SESSION['user']['nickname'] !== $post['author_nickname'] && $_SESSION['user']['role'] !== 'admin') {
            header('Location: index.php');
            exit;
        }
    } else {
        header('Location: index.php');
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title']);
    $content = trim($_POST['content']);
    
    if (empty($title) || empty($content)) {
        $error = '제목과 내용을 모두 입력해 주세요.';
    } else {
        if ($post_id) {
            // 수정 API 호출
            $save_res = call_api('PUT', "/posts/{$post_id}", [
                'title' => $title,
                'content' => $content
            ]);
            $redirect_id = $post_id;
        } else {
            // 작성 API 호출
            $save_res = call_api('POST', '/posts', [
                'title' => $title,
                'content' => $content
            ]);
            $redirect_id = isset($save_res['data']['id']) ? $save_res['data']['id'] : 0;
        }
        
        if ($save_res['status'] === 200 || $save_res['status'] === 201) {
            header("Location: post_detail.php?id={$redirect_id}");
            exit;
        } else {
            $error = isset($save_res['data']['detail']) ? $save_res['data']['detail'] : '게시글 저장 실패';
        }
    }
}

include 'layout/header.php';
include 'layout/sidebar.php';
?>

<div style="border-bottom: 1px solid var(--border-light); padding-bottom: 15px; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between;">
  <h2 style="margin: 0; font-size: 20px; font-weight: 700;"><?php echo $post_id ? '게시글 수정' : '새 글 쓰기'; ?></h2>
  <button type="button" onclick="location.href='<?php echo $post_id ? "post_detail.php?id={$post_id}" : "index.php"; ?>'" style="background: none; border: 1px solid var(--border-light); padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer;">
    취소
  </button>
</div>

<?php if ($error): ?>
  <div class="alert alert-danger">
    <i data-lucide="shield-alert" style="width: 16px; height: 16px;"></i>
    <span><?php echo htmlspecialchars($error); ?></span>
  </div>
<?php endif; ?>

<form method="POST" style="display: flex; flex-direction: column; gap: 20px;">
  <div class="form-group" style="margin-bottom: 0;">
    <label for="post-title">제목 *</label>
    <input type="text" id="post-title" name="title" required placeholder="제목을 입력하세요" value="<?php echo $post ? htmlspecialchars($post['title']) : ''; ?>" style="width: 100%;">
  </div>
  
  <div class="form-group" style="margin-bottom: 0;">
    <label for="post-content">내용 *</label>
    <textarea id="post-content" name="content" required placeholder="내용을 입력하세요..." style="width: 100%; height: 350px; line-height: 1.6; font-family: inherit;"><?php echo $post ? htmlspecialchars($post['content']) : ''; ?></textarea>
  </div>
  
  <div style="display: flex; justify-content: flex-end;">
    <button type="submit" class="btn-primary" style="width: auto; padding: 10px 30px; display: flex; align-items: center; gap: 6px;">
      <i data-lucide="check" style="width: 16px; height: 16px;"></i>
      저장하기
    </button>
  </div>
</form>

<?php
include 'layout/footer.php';
?>
