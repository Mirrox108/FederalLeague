<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Простая аутентификация
function authenticate() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Требуется авторизация']);
        exit;
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    // Здесь должна быть проверка токена
    return true;
}

// Получение данных из JSON
$input = json_decode(file_get_contents('php://input'), true);

// Маршрутизация
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', $path);

if ($parts[2] === 'users') {
    authenticate();
    handleUsers($method, $input);
} elseif ($parts[2] === 'news') {
    authenticate();
    handleNews($method, $input);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

function handleUsers($method, $input) {
    $file = '../data/users.json';
    $data = json_decode(file_get_contents($file), true);
    
    switch ($method) {
        case 'GET':
            echo json_encode($data['users']);
            break;
            
        case 'POST':
            $newUser = [
                'id' => $data['nextId']++,
                'username' => $input['username'],
                'email' => $input['email'],
                'password' => password_hash($input['password'], PASSWORD_DEFAULT),
                'role' => $input['role'] ?? 'user',
                'created_at' => date('Y-m-d H:i:s'),
                'status' => 'active'
            ];
            
            $data['users'][] = $newUser;
            file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode($newUser);
            break;
            
        case 'PUT':
            $userId = (int)$_GET['id'];
            foreach ($data['users'] as &$user) {
                if ($user['id'] === $userId) {
                    if (isset($input['role'])) $user['role'] = $input['role'];
                    if (isset($input['status'])) $user['status'] = $input['status'];
                    break;
                }
            }
            file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
            break;
    }
}

function handleNews($method, $input) {
    $file = '../data/news.json';
    $data = json_decode(file_get_contents($file), true);
    
    switch ($method) {
        case 'GET':
            echo json_encode($data['news']);
            break;
            
        case 'POST':
            $newNews = [
                'id' => $data['nextId']++,
                'title' => $input['title'],
                'content' => $input['content'],
                'excerpt' => $input['excerpt'],
                'image' => $input['image'],
                'author' => $input['author'],
                'status' => $input['status'],
                'created_at' => date('Y-m-d H:i:s'),
                'published_at' => $input['status'] === 'published' ? date('Y-m-d H:i:s') : null
            ];
            
            $data['news'][] = $newNews;
            file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode($newNews);
            break;
            
        case 'DELETE':
            $newsId = (int)$_GET['id'];
            $data['news'] = array_filter($data['news'], function($news) use ($newsId) {
                return $news['id'] !== $newsId;
            });
            file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
            break;
    }
}
?>