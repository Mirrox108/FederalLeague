const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-here'; // Замените в продакшене

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Для обслуживания статических файлов

// Путь к файлу данных
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load users from file
async function loadUsers() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Если файла нет, создаем пустой массив
        return [];
    }
}

// Save users to file
async function saveUsers(users) {
    try {
        await ensureDataDirectory();
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Токен доступа отсутствует' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
}

// Middleware для проверки админских прав
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
}

// Routes

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, agreeTerms, newsletter } = req.body;

        // Валидация
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Имя пользователя должно содержать минимум 3 символа' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Неверный формат email' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
        }

        if (!agreeTerms) {
            return res.status(400).json({ error: 'Необходимо принять условия использования' });
        }

        const users = await loadUsers();

        // Проверка на существующего пользователя
        const existingUser = users.find(user => 
            user.username.toLowerCase() === username.toLowerCase() || 
            user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
        }

        // Хэширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: hashedPassword,
            role: 'user',
            status: 'active',
            balance: 100,
            agreeTerms: !!agreeTerms,
            newsletter: !!newsletter,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        const saved = await saveUsers(users);

        if (!saved) {
            return res.status(500).json({ error: 'Ошибка при сохранении пользователя' });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                balance: newUser.balance
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Авторизация пользователя
app.post('/api/auth/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ error: 'Логин и пароль обязательны' });
        }

        const users = await loadUsers();

        // Поиск пользователя по username или email
        const user = users.find(u => 
            u.username.toLowerCase() === login.toLowerCase() || 
            u.email.toLowerCase() === login.toLowerCase()
        );

        if (!user) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }

        if (user.status === 'banned') {
            return res.status(401).json({ error: 'Аккаунт заблокирован' });
        }

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }

        // Обновление времени последнего входа
        user.lastLogin = new Date().toISOString();
        await saveUsers(users);

        // Создание JWT токена
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Вход выполнен успешно',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                balance: user.balance,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Получение информации о текущем пользователе
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const users = await loadUsers();
        const user = users.find(u => u.id === req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                balance: user.balance,
                status: user.status,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Обновление профиля пользователя
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { username, email, newsletter } = req.body;
        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверка на уникальность username и email
        const existingUser = users.find((user, index) => 
            index !== userIndex && 
            (user.username.toLowerCase() === username.toLowerCase() || 
             user.email.toLowerCase() === email.toLowerCase())
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
        }

        users[userIndex].username = username || users[userIndex].username;
        users[userIndex].email = email || users[userIndex].email;
        users[userIndex].newsletter = !!newsletter;

        const saved = await saveUsers(users);

        if (!saved) {
            return res.status(500).json({ error: 'Ошибка при сохранении данных' });
        }

        res.json({
            message: 'Профиль успешно обновлен',
            user: {
                id: users[userIndex].id,
                username: users[userIndex].username,
                email: users[userIndex].email,
                role: users[userIndex].role,
                balance: users[userIndex].balance
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Смена пароля
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
        }

        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверка текущего пароля
        const validPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный текущий пароль' });
        }

        // Хэширование нового пароля
        users[userIndex].password = await bcrypt.hash(newPassword, 10);
        const saved = await saveUsers(users);

        if (!saved) {
            return res.status(500).json({ error: 'Ошибка при сохранении пароля' });
        }

        res.json({ message: 'Пароль успешно изменен' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Admin routes - Получение всех пользователей
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await loadUsers();
        
        // Фильтрация конфиденциальных данных
        const usersWithoutPasswords = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            balance: user.balance,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            newsletter: user.newsletter
        }));

        res.json(usersWithoutPasswords);

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Admin routes - Обновление пользователя
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, status, balance } = req.body;

        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.id === parseInt(id));

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверка на уникальность username и email
        const existingUser = users.find((user, index) => 
            index !== userIndex && 
            (user.username.toLowerCase() === username.toLowerCase() || 
             user.email.toLowerCase() === email.toLowerCase())
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
        }

        users[userIndex].username = username || users[userIndex].username;
        users[userIndex].email = email || users[userIndex].email;
        users[userIndex].role = role || users[userIndex].role;
        users[userIndex].status = status || users[userIndex].status;
        users[userIndex].balance = balance !== undefined ? balance : users[userIndex].balance;

        const saved = await saveUsers(users);

        if (!saved) {
            return res.status(500).json({ error: 'Ошибка при сохранении данных' });
        }

        res.json({
            message: 'Пользователь успешно обновлен',
            user: {
                id: users[userIndex].id,
                username: users[userIndex].username,
                email: users[userIndex].email,
                role: users[userIndex].role,
                status: users[userIndex].status,
                balance: users[userIndex].balance
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Admin routes - Удаление пользователя
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const users = await loadUsers();
        
        // Нельзя удалить себя
        if (parseInt(id) === req.user.userId) {
            return res.status(400).json({ error: 'Нельзя удалить собственный аккаунт' });
        }

        const userIndex = users.findIndex(u => u.id === parseInt(id));

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Нельзя удалять других администраторов
        if (users[userIndex].role === 'admin' || users[userIndex].role === 'superadmin') {
            return res.status(400).json({ error: 'Нельзя удалять администраторов' });
        }

        users.splice(userIndex, 1);
        const saved = await saveUsers(users);

        if (!saved) {
            return res.status(500).json({ error: 'Ошибка при удалении пользователя' });
        }

        res.json({ message: 'Пользователь успешно удален' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Users data will be stored in: ${USERS_FILE}`);
});

// Обработка graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    process.exit(0);
});