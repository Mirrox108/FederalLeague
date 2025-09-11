<?php
// api.php - Полный API для управления новостями
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Разрешаем preflight запросы
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Конфигурация
$newsFile = 'news.json';
$password = 'admin123'; // Пароль для защиты API
$maxNews = 100; // Максимальное количество новостей

// Включаем вывод ошибок для отладки (убрать в продакшене)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
                    'excerpt' => 'Мы рады приветствовать вас на нашем сервере. Присоединяйтесь к нашему сообществу!',
                    'content' => '<p>Добро пожаловать на Federal League - политический Minecraft сервер, где вы можете создавать государства, участвовать в войнах и формировать историю.</p><p>Присоединяйтесь к нашему сообществу и начните свое путешествие уже сегодня!</p>',
                    'image' => 'images/news1.jpg',
                    'status' => 'published',
                    'author' => 'Администратор',
                    'created_at' => date('c'),
                    'updated_at' => date('c'),
                    'views' => 0,
                    'likes' => 0
                ],
                [
                    'id' => 2,
                    'title' => 'Запуск нового сезона',
                    'date' => date('c', time() - 5 * 86400),
                    'excerpt' => 'Мы запускаем новый сезон с множеством обновлений и улучшений.',
                    'content' => '<p>Мы рады объявить о начале нового сезона на нашем сервере! Этот сезон принесет много нового:</p><ul><li>Обновленная политическая система</li><li>Новые механики войны</li><li>Улучшенная экономика</li><li>Исправление багов</li></ul><p>Присоединяйтесь к нам!</p>',
                    'image' => 'images/news2.jpg',
                    'status' => 'published',
                    'author' => 'Администратор',
                    'created_at' => date('c', time() - 5 * 86400),
                    'updated_at' => date('c', time() - 5 * 86400),
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
    $data = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Ошибка чтения файла новостей: ' . json_last_error_msg());
    }
    
    return $data;
}

// Функция для сохранения новостей
function saveNews($data) {
    global $newsFile, $maxNews;
    
    // Валидация данных
    if (!isset($data['news']) || !is_array($data['news'])) {
        throw new Exception('Неверный формат данных новостей');
    }
    
    // Ограничиваем количество новостей
    if (count($data['news']) > $maxNews) {
        $data['news'] = array_slice($data['news'], 0, $maxNews);
    }
    
    $data['lastUpdate'] = date('c');
    $data['version'] = '1.0';
    
    $result = file_put_contents($newsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        throw new Exception('Ошибка сохранения файла новостей');
    }
    
    return true;
}

// Функция для проверки авторизации
function checkAuth() {
    global $password;
    
    // Проверяем заголовок Authorization
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            return $token === $password;
        }
    }
    
    // Проверяем параметр token в GET
    if (isset($_GET['token'])) {
        return $_GET['token'] === $password;
    }
    
    // Проверяем параметр token в POST
    if (isset($_POST['token'])) {
        return $_POST['token'] === $password;
    }
    
    return false;
}

// Функция для валидации данных новости
function validateNewsData($data) {
    $errors = [];
    
    if (empty($data['title']) || strlen(trim($data['title'])) < 3) {
        $errors[] = 'Заголовок должен содержать минимум 3 символа';
    }
    
    if (empty($data['content']) || strlen(trim($data['content'])) < 10) {
        $errors[] = 'Содержание должно содержать минимум 10 символов';
    }
    
    if (isset($data['status']) && !in_array($data['status'], ['published', 'draft', 'archived'])) {
        $errors[] = 'Неверный статус новости';
    }
    
    return $errors;
}

// Функция для получения тела запроса
function getRequestBody() {
    $input = file_get_contents('php://input');
    
    // Пытаемся декодировать JSON
    $data = json_decode($input, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        return $data;
    }
    
    // Если не JSON, возвращаем POST данные
    return $_POST;
}

// Основной обработчик
try {
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'get':
            // GET /api.php?action=get - Получить все новости
            $data = readNews();
            sendResponse([
                'success' => true,
                'data' => $data,
                'total' => count($data['news'])
            ]);
            break;
            
        case 'get-published':
            // GET /api.php?action=get-published - Получить опубликованные новости
            $data = readNews();
            $publishedNews = array_filter($data['news'], function($news) {
                return $news['status'] === 'published';
            });
            
            sendResponse([
                'success' => true,
                'data' => array_values($publishedNews),
                'total' => count($publishedNews)
            ]);
            break;
            
        case 'create':
            // POST /api.php?action=create - Создать новость
            if ($method !== 'POST') {
                throw new Exception('Метод не поддерживается', 405);
            }
            
            if (!checkAuth()) {
                throw new Exception('Неавторизованный доступ', 401);
            }
            
            $input = getRequestBody();
            $errors = validateNewsData($input);
            
            if (!empty($errors)) {
                throw new Exception(implode(', ', $errors), 400);
            }
            
            $data = readNews();
            
            $newNews = [
                'id' => generateUniqueId($data['news']),
                'title' => trim($input['title']),
                'date' => isset($input['date']) ? $input['date'] : date('c'),
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
            saveNews($data);
            
            sendResponse([
                'success' => true,
                'message' => 'Новость успешно создана',
                'data' => $newNews
            ]);
            break;
            
        case 'update':
            // POST /api.php?action=update - Обновить новость
            if ($method !== 'POST') {
                throw new Exception('Метод не поддерживается', 405);
            }
            
            if (!checkAuth()) {
                throw new Exception('Неавторизованный доступ', 401);
            }
            
            $input = getRequestBody();
            
            if (!isset($input['id'])) {
                throw new Exception('ID новости не указан', 400);
            }
            
            $errors = validateNewsData($input);
            if (!empty($errors)) {
                throw new Exception(implode(', ', $errors), 400);
            }
            
            $data = readNews();
            $found = false;
            
            foreach ($data['news'] as &$news) {
                if ($news['id'] == $input['id']) {
                    $news['title'] = trim($input['title']);
                    $news['excerpt'] = trim($input['excerpt'] ?? $news['excerpt']);
                    $news['content'] = trim($input['content']);
                    $news['image'] = $input['image'] ?? $news['image'];
                    $news['status'] = $input['status'] ?? $news['status'];
                    $news['updated_at'] = date('c');
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                throw new Exception('Новость не найдена', 404);
            }
            
            saveNews($data);
            
            sendResponse([
                'success' => true,
                'message' => 'Новость успешно обновлена'
            ]);
            break;
            
        case 'delete':
            // DELETE /api.php?action=delete&id=123 - Удалить новость
            if ($method !== 'DELETE' && $method !== 'POST') {
                throw new Exception('Метод не поддерживается', 405);
            }
            
            if (!checkAuth()) {
                throw new Exception('Неавторизованный доступ', 401);
            }
            
            $id = $_GET['id'] ?? (isset($_GET['action']) ? $_GET['action'] : '');
            if (empty($id)) {
                throw new Exception('ID новости не указан', 400);
            }
            
            $data = readNews();
            $initialCount = count($data['news']);
            
            $data['news'] = array_filter($data['news'], function($news) use ($id) {
                return $news['id'] != $id;
            });
            
            if (count($data['news']) === $initialCount) {
                throw new Exception('Новость не найдена', 404);
            }
            
            saveNews($data);
            
            sendResponse([
                'success' => true,
                'message' => 'Новость успешно удалена'
            ]);
            break;
            
        case 'stats':
            // GET /api.php?action=stats - Получить статистику
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
            
            sendResponse([
                'success' => true,
                'data' => $stats
            ]);
            break;
            
        default:
            sendResponse([
                'success' => false,
                'message' => 'Неизвестное действие',
                'available_actions' => ['get', 'get-published', 'create', 'update', 'delete', 'stats']
            ], 400);
    }
    
} catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 500;
    sendResponse([
        'success' => false,
        'message' => $e->getMessage(),
        'error' => true
    ], $code);
}

// Вспомогательные функции
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function generateUniqueId($existingNews) {
    $maxId = 0;
    foreach ($existingNews as $news) {
        if ($news['id'] > $maxId) {
            $maxId = $news['id'];
        }
    }
    return $maxId + 1;
}
