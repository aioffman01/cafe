<?php
include_once 'config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * FastAPI 백엔드 API 서버 호출용 cURL 공통 함수
 */
function call_api($method, $path, $data = null) {
    $url = API_BASE_URL . $path;
    $ch = curl_init($url);
    
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];
    
    // 세션에 JWT 토큰이 있으면 인증 헤더에 추가
    if (isset($_SESSION['token']) && $_SESSION['token']) {
        $headers[] = 'Authorization: Bearer ' . $_SESSION['token'];
    }
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, curlINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $http_code,
        'data' => json_decode($response, true)
    ];
}
?>
