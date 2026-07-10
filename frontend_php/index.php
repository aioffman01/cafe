<?php
session_start();
include_once 'api_helper.php';

// API로 게시글 리스트 조회
$res = call_api('GET', '/posts');
$posts = ($res['status'] === 200) ? $res['data'] : [];

include 'layout/header.php';
include 'layout/sidebar.php';
?>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
  <div>
    <h2 style="margin: 0; font-size: 20px; font-weight: 700;">자유게시판</h2>
    <p style="margin: 4px 0 0 0; font-size: 14px; color: var(--text-muted);">멤버들과 자유롭게 이야기를 나누어 보세요.</p>
  </div>
  <?php if ($is_authenticated): ?>
    <button onclick="location.href='post_form.php'" style="background-color: var(--primary); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
      <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
      글쓰기
    </button>
  <?php endif; ?>
</div>

<table>
  <thead>
    <tr>
      <th style="width: 10%;">번호</th>
      <th style="width: 50%;">제목</th>
      <th style="width: 20%;">작성자</th>
      <th style="width: 20%;">작성일</th>
    </tr>
  </thead>
  <tbody>
    <?php if (empty($posts)): ?>
      <tr>
        <td colspan="4" style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          등록된 게시물이 없습니다. 첫 번째 글을 작성해 보세요!
        </td>
      </tr>
    <?php else: ?>
      <?php foreach ($posts as $idx => $post): ?>
        <tr style="cursor: pointer;" onclick="location.href='post_detail.php?id=<?php echo $post['id']; ?>'">
          <td style="color: var(--text-muted);"><?php echo count($posts) - $idx; ?></td>
          <td style="font-weight: 600; color: var(--text-dark);">
            <?php echo htmlspecialchars($post['title']); ?>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <?php if (isset($post['author_role']) && $post['author_role'] === 'admin'): ?>
                <i data-lucide="shield" style="width: 12px; height: 12px; color: var(--event-admin);"></i>
                <span style="font-weight: 600; color: var(--event-admin); font-size: 13px;">
                  <?php echo htmlspecialchars($post['author_nickname']); ?>
                </span>
              <?php else: ?>
                <span style="font-size: 13px;">
                  <?php echo htmlspecialchars($post['author_nickname']); ?>
                </span>
              <?php endif; ?>
            </div>
          </td>
          <td style="font-size: 13px; color: var(--text-muted);">
            <?php echo substr($post['created_at'], 0, 10); ?>
          </td>
        </tr>
      <?php endforeach; ?>
    <?php endif; ?>
  </tbody>
</table>

<?php
include 'layout/footer.php';
?>
