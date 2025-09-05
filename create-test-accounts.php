<?php
// create-test-accounts.php
$usersFile = 'data/users.json';

// Читаем существующих пользователей
if (file_exists($usersFile)) {
    $data = json_decode(file_get_contents($usersFile), true);
} else {
    $data = ['users' => [], 'nextId' => 1];
}

// Тестовые аккаунты
$testAccounts = [
    [
        'id' => $data['nextId']++,
        'username' => 'testuser',
        'email' => 'user@federalleague.ru',
        'password' => password_hash('test123', PASSWORD_DEFAULT),
        'role' => 'user',
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ],
    [
        'id' => $data['nextId']++,
        'username' => 'testmod',
        'email' => 'mod@federalleague.ru',
        'password' => password_hash('mod123', PASSWORD_DEFAULT),
        'role' => 'moderator',
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ],
    [
        'id' => $data['nextId']++,
        'username' => 'testadmin',
        'email' => 'admin@federalleague.ru',
        'password' => password_hash('admin123', PASSWORD_DEFAULT),
        'role' => 'admin',
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ],
    [
        'id' => $data['nextId']++,
        'username' => 'superadmin',
        'email' => 'super@federalleague.ru',
        'password' => password_hash('super123', PASSWORD_DEFAULT),
        'role' => 'superadmin',
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ]
];

// Добавляем аккаунты
foreach ($testAccounts as $account) {
    $data['users'][] = $account;
}

// Сохраняем
file_put_contents($usersFile, json_encode($data, JSON_PRETTY_PRINT));

echo "Тестовые аккаунты созданы!\n";
echo "====================\n";
foreach ($testAccounts as $account) {
    echo "Логин: {$account['username']}\n";
    echo "Пароль: " . str_replace('123', '***', $account['username']) . "123\n";
    echo "Роль: {$account['role']}\n";
    echo "---\n";
}
?>