<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Подключаем файлы данных
$usersFile = 'data/users.json';
$newsFile = 'data/news.json';

// Функции для работы с данными
function getUsers() {
    global $usersFile;
    if (!file_exists($usersFile)) {
        file_put_contents($usersFile, json_encode(['users' => [], 'nextId' => 1]));
    }
    return json_decode(file_get_contents($usersFile), true);
}

function saveUsers($data) {
    global $usersFile;
    file_put_contents($usersFile, json_encode($data, JSON_PRETTY_PRINT));
}

function getNews() {
    global $newsFile;
    if (!file_exists($newsFile)) {
        file_put_contents($newsFile, json_encode(['news' => [], 'nextId' => 1]));
    }
    return json_decode(file_get_contents($newsFile), true);
}

// Обработка запросов
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', $path);

if ($parts[1] === 'api') {
    switch ($parts[2]) {
        case 'register':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                $usersData = getUsers();
                $newUser = [
                    'id' => $usersData['nextId']++,
                    'username' => $input['username'],
                    'email' => $input['email'],
                    'password' => password_hash($input['password'], PASSWORD_DEFAULT),
                    'role' => 'user',
                    'created_at' => date('Y-m-d H:i:s'),
                    'status' => 'active'
                ];
                
                $usersData['users'][] = $newUser;
                saveUsers($usersData);
                
                // Не возвращаем пароль
                unset($newUser['password']);
                
                echo json_encode([
                    'success' => true,
                    'user' => $newUser,
                    'token' => base64_encode(json_encode($newUser))
                ]);
            }
            break;
            
        case 'login':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $usersData = getUsers();
                
                foreach ($usersData['users'] as $user) {
                    if (($user['username'] === $input['username'] || $user['email'] === $input['username']) &&
                        password_verify($input['password'], $user['password'])) {
                        
                        // Не возвращаем пароль
                        unset($user['password']);
                        
                        echo json_encode([
                            'success' => true,
                            'user' => $user,
                            'token' => base64_encode(json_encode($user))
                        ]);
                        exit;
                    }
                }
                
                echo json_encode(['success' => false, 'error' => 'Неверные учетные данные']);
            }
            break;
            
        case 'news':
            $newsData = getNews();
            if ($method === 'GET') {
                // Возвращаем только опубликованные новости
                $publishedNews = array_filter($newsData['news'], function($news) {
                    return $news['status'] === 'published';
                });
                echo json_encode(array_values($publishedNews));
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>