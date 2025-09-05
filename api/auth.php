<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Разрешаем preflight запросы
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($action === 'test') {
    echo json_encode([
        'success' => true,
        'message' => 'API работает',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Функция для получения реального IP-адреса пользователя
function getRealUserIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

// Функция для чтения пользователей из файла
function readUsers() {
    $filePath = __DIR__ . '/users.json';
    if (!file_exists($filePath)) {
        file_put_contents($filePath, json_encode([]));
        return [];
    }
    
    $data = file_get_contents($filePath);
    if ($data === false) {
        return [];
    }
    
    $users = json_decode($data, true);
    return is_array($users) ? $users : [];
}

// Функция для сохранения пользователей в файл
function saveUsers($users) {
    $filePath = __DIR__ . '/users.json';
    $result = file_put_contents($filePath, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $result !== false;
}

// Получаем входные данные
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
    $ip = $data['ip'] ?? getRealUserIP();
    
    if (empty($login) || empty($password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Заполните все поля'
        ]);
        exit;
    }
    
    $users = readUsers();
    
    // Поиск пользователя по username или email
    $userFound = false;
    foreach ($users as &$user) {
        if (($user['username'] === $login || $user['email'] === $login) && $user['password'] === $password) {
            $userFound = true;
            
            // Обновляем последний вход и IP
            $user['lastLogin'] = date('Y-m-d H:i:s');
            $user['ip'] = $ip;
            $user['userAgent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
            
            if (saveUsers($users)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Вход выполнен успешно',
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'ip' => $user['ip'],
                        'registrationDate' => $user['registrationDate']
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Ошибка сохранения данных'
                ]);
            }
            break;
        }
    }
    
    if (!$userFound) {
        echo json_encode([
            'success' => false,
            'message' => 'Неверное имя пользователя или пароль'
        ]);
    }
    
} elseif ($action === 'register') {
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $newsletter = isset($data['newsletter']) && $data['newsletter'] === '1';
    $ip = $data['ip'] ?? getRealUserIP();
    
    if (empty($username) || empty($password) || empty($email)) {
        echo json_encode([
            'success' => false,
            'message' => 'Заполните все обязательные поля'
        ]);
        exit;
    }
    
    $users = readUsers();
    
    // Проверка на существующего пользователя
    foreach ($users as $user) {
        if ($user['username'] === $username) {
            echo json_encode([
                'success' => false,
                'message' => 'Пользователь с таким именем уже существует'
            ]);
            exit;
        }
        if ($user['email'] === $email) {
            echo json_encode([
                'success' => false,
                'message' => 'Пользователь с таким email уже существует'
            ]);
            exit;
        }
    }
    
    // Создание нового пользователя
    $newUser = [
        'id' => uniqid() . time(),
        'username' => $username,
        'email' => $email,
        'password' => $password,
        'ip' => $ip,
        'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'newsletter' => $newsletter,
        'registrationDate' => date('Y-m-d H:i:s'),
        'lastLogin' => date('Y-m-d H:i:s')
    ];
    
    $users[] = $newUser;
    
    if (saveUsers($users)) {
        echo json_encode([
            'success' => true,
            'message' => 'Регистрация выполнена успешно',
            'user' => [
                'id' => $newUser['id'],
                'username' => $newUser['username'],
                'email' => $newUser['email'],
                'ip' => $newUser['ip'],
                'registrationDate' => $newUser['registrationDate']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка сохранения данных'
        ]);
    }
    
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Неизвестное действие'
    ]);
}
?>