<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Получаем данные из разных источников
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        $data = is_array($input) ? $input : [];
    } else if (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
        $data = $_POST;
    } else if (strpos($contentType, 'multipart/form-data') !== false) {
        $data = $_POST;
    } else {
        // Пробуем получить данные из php://input
        $input = file_get_contents('php://input');
        parse_str($input, $data);
    }
} else {
    $data = $_GET;
}

$action = $data['action'] ?? '';

// Остальная логика auth.php остается без изменений
// ...
?>
