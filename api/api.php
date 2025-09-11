<?php
// api.php - API для работы с новостями
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Конфигурация
$newsFile = 'news.json';
$password = 'admin123'; // Пароль для защиты API

// Функция для чтения новостей
function readNews() {
    global $newsFile;
    
    if (!file_exists($newsFile)) {
        // Создаем файл с демо-новостями если не существует
        $defaultNews = [
            'news' => [
                [
                    'id' => 1,
                    'title' => 'Добро пожаловать на Federal League!',
                    'date' => date('c'),
                    'excerpt' => 'Мы рады приветствовать вас на нашем сервере.',
                    'content' => '<p>Добро пожаловать на наш сервер! Присоединяйтесь к нашему сообществу.</p>',
                    'image' => 'images/news1.jpg',
                    'status' => 'published',
                    'author' => 'Администратор',
                    'created_at' => date('c'),
                    'updated_at' => date('c'),
                    'views' => 0,
                    'likes' => 0
                ]
            ],
            'lastUpdate' => date('c'),
            'version' => '1.0'
        ];
        
        file_put_contents($newsFile, json_encode($defaultNews, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    $content = file_get_contents($newsFile);
    return json_decode($content, true);
}

// Функция для сохранения новостей
function saveNews($data) {
    global $newsFile;
    
    // Валидация данных
    if (!isset($data['news']) || !is_array($data['news'])) {
        return ['success' => false, 'message' => 'Invalid data format'];
    }
    
    $data['lastUpdate'] = date('c');
    $data['version'] = '1.0';
    
    $result = file_put_contents($newsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        return ['success' => false, 'message' => 'Failed to save news'];
    }
    
    return ['success' => true];
}

// Функция для проверки авторизации
function checkAuth() {
    global $password;
    
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return false;
    }
    
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return false;
    }
    
    $token = substr($authHeader, 7);
    return $token === $password;
}

// Основной обработчик
$response = ['success' => false, 'message' => 'Unknown action'];

try {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'get':
            // Получить все новости
            $data = readNews();
            $response = [
                'success' => true,
                'data' => $data,
                'total' => count($data['news'])
            ];
            break;
            
        case 'get-published':
            // Получить только опубликованные новости
            $data = readNews();
            $publishedNews = array_filter($data['news'], function($news) {
                return $news['status'] === 'published';
            });
            
            $response = [
                'success' => true,
                'data' => array_values($publishedNews),
                'total' => count($publishedNews)
            ];
            break;
            
        case 'create':
            // Создать новую новость (требует авторизации)
            if (!checkAuth()) {
                throw new Exception('Unauthorized');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['title']) || !isset($input['content'])) {
                throw new Exception('Title and content are required');
            }
            
            $data = readNews();
            
            $newNews = [
                'id' => time(),
                'title' => trim($input['title']),
                'date' => $input['date'] ?? date('c'),
                'excerpt' => trim($input['excerpt'] ?? ''),
                'content' => trim($input['content']),
                'image' => $input['image'] ?? null,
                'status' => $input['status'] ?? 'published',
                'author' => $input['author'] ?? 'Администратор',
                'created_at' => date('c'),
                'updated_at' => date('c'),
                'views' => 0,
                'likes' => 0
            ];
            
            array_unshift($data['news'], $newNews);
            
            $saveResult = saveNews($data);
            if (!$saveResult['success']) {
                throw new Exception($saveResult['message']);
            }
            
            $response = [
                'success' => true,
                'message' => 'News created successfully',
                'data' => $newNews
            ];
            break;
            
        case 'update':
            // Обновить новость (требует авторизации)
            if (!checkAuth()) {
                throw new Exception('Unauthorized');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('News ID is required');
            }
            
            $data = readNews();
            $found = false;
            
            foreach ($data['news'] as &$news) {
                if ($news['id'] == $input['id']) {
                    $news['title'] = trim($input['title'] ?? $news['title']);
                    $news['excerpt'] = trim($input['excerpt'] ?? $news['excerpt']);
                    $news['content'] = trim($input['content'] ?? $news['content']);
                    $news['image'] = $input['image'] ?? $news['image'];
                    $news['status'] = $input['status'] ?? $news['status'];
                    $news['updated_at'] = date('c');
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                throw new Exception('News not found');
            }
            
            $saveResult = saveNews($data);
            if (!$saveResult['success']) {
                throw new Exception($saveResult['message']);
            }
            
            $response = ['success' => true, 'message' => 'News updated successfully'];
            break;
            
        case 'delete':
            // Удалить новость (требует авторизации)
            if (!checkAuth()) {
                throw new Exception('Unauthorized');
            }
            
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                throw new Exception('News ID is required');
            }
            
            $data = readNews();
            $initialCount = count($data['news']);
            
            $data['news'] = array_filter($data['news'], function($news) use ($id) {
                return $news['id'] != $id;
            });
            
            if (count($data['news']) === $initialCount) {
                throw new Exception('News not found');
            }
            
            $saveResult = saveNews($data);
            if (!$saveResult['success']) {
                throw new Exception($saveResult['message']);
            }
            
            $response = ['success' => true, 'message' => 'News deleted successfully'];
            break;
            
        case 'stats':
            // Получить статистику
            $data = readNews();
            $stats = [
                'total' => count($data['news']),
                'published' => count(array_filter($data['news'], function($n) { 
                    return $n['status'] === 'published'; 
                })),
                'draft' => count(array_filter($data['news'], function($n) { 
                    return $n['status'] === 'draft'; 
                })),
                'archived' => count(array_filter($data['news'], function($n) { 
                    return $n['status'] === 'archived'; 
                }))
            ];
            
            $response = ['success' => true, 'data' => $stats];
            break;
            
        default:
            $response = [
                'success' => false,
                'message' => 'Unknown action',
                'available_actions' => ['get', 'get-published', 'create', 'update', 'delete', 'stats']
            ];
    }
    
} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false,
        'message' => $e->getMessage(),
        'error' => true
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>