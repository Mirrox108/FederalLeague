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
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Если не получилось распарсить JSON, пробуем получить из POST
if ($data === null) {
    $data = $_POST;
}

$action = $data['action'] ?? '';

if ($action === 'login') {
    $login = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $ip = $data['ip'] ?? $_SERVER['REMOTE_ADDR'];
    
    // Здесь должна быть ваша логика аутентификации
    // Пока просто возвращаем успех для теста
    echo json_encode([
        'success' => true,
        'message' => 'Вход выполнен успешно',
        'user' => [
            'id' => '1',
            'username' => $login,
            'email' => $login . '@example.com',
            'ip' => $ip,
            'registrationDate' => date('Y-m-d H:i:s')
        ]
    ]);
    
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Неизвестное действие'
    ]);
}
?>
