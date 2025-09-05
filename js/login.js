// Конфигурация API
const API_CONFIG = {
    BASE_URL: window.location.origin,
    ENDPOINTS: {
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        PROFILE: '/api/profile'
    }
};

// Основные функции
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    initLoginPage();
    
    // Обработчики событий
    setupEventListeners();
    
    // Проверка сохраненных данных
    checkRememberedUser();
});

function initLoginPage() {
    console.log('Инициализация страницы входа...');
    
    // Проверяем, если пользователь уже авторизован
    if (isUserLoggedIn()) {
        showMessage('Вы уже авторизованы. Перенаправление...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Проверяем параметры URL (для обработки redirect'ов)
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type');
    
    if (message) {
        showMessage(decodeURIComponent(message), type || 'info');
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    
    // Обработка формы входа
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleLogin();
    });
    
    // Переключение видимости пароля
    togglePassword.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, this);
    });
    
    // Забыли пароль
    document.getElementById('forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        handleForgotPassword();
    });
    
    // Автозаполнение при нажатии Enter
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT' && !activeElement.type === 'button') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}

// Проверка авторизации пользователя
function isUserLoggedIn() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    return !!(token && userData);
}

// Проверка запомненного пользователя
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        try {
            const user = JSON.parse(rememberedUser);
            document.getElementById('login-username').value = user.username || '';
            document.getElementById('remember-me').checked = true;
        } catch (e) {
            console.error('Ошибка чтения запомненного пользователя:', e);
            localStorage.removeItem('rememberedUser');
        }
    }
}

// Переключение видимости пароля
function togglePasswordVisibility(passwordInput, toggleButton) {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = toggleButton.querySelector('i');
    if (type === 'password') {
        icon.className = 'fas fa-eye';
    } else {
        icon.className = 'fas fa-eye-slash';
    }
}

// Обработка входа
async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Валидация
    if (!username || !password) {
        showMessage('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Пароль должен содержать минимум 6 символов', 'error');
        return;
    }
    
    // Показываем загрузку
    setLoadingState(true);
    
    try {
        // Пытаемся авторизоваться
        const response = await loginUser(username, password);
        
        if (response.success) {
            // Сохраняем данные пользователя
            saveUserData(response.user, response.token, rememberMe);
            
            showMessage('Успешный вход! Перенаправление...', 'success');
            
            // Перенаправляем после небольшой задержки
            setTimeout(() => {
                const redirectUrl = getRedirectUrl();
                window.location.href = redirectUrl;
            }, 1500);
            
        } else {
            showMessage(response.error || 'Ошибка авторизации', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        showMessage('Ошибка соединения с сервером', 'error');
    } finally {
        setLoadingState(false);
    }
}

// API: Авторизация пользователя
async function loginUser(username, password) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                username: username,
                password: password 
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('API Error:', error);
        
        // Fallback: попробуем локальную авторизацию
        return await localLogin(username, password);
    }
}

// Локальная авторизация (fallback)
async function localLogin(username, password) {
    try {
        // Пробуем получить пользователей из localStorage
        const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
        
        // Ищем пользователя
        const user = users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password // В реальном приложении здесь должно быть хеширование
        );
        
        if (user) {
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'user',
                    created_at: user.created_at
                },
                token: btoa(JSON.stringify(user))
            };
        }
        
        return {
            success: false,
            error: 'Неверные учетные данные'
        };
        
    } catch (error) {
        console.error('Local login error:', error);
        return {
            success: false,
            error: 'Ошибка локальной авторизации'
        };
    }
}

// Сохранение данных пользователя
function saveUserData(user, token, rememberMe) {
    // Сохраняем токен и данные пользователя
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    
    // Если выбрано "Запомнить меня", сохраняем username
    if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
            username: user.username,
            email: user.email
        }));
    } else {
        localStorage.removeItem('rememberedUser');
    }
    
    // Сохраняем время входа
    localStorage.setItem('lastLogin', new Date().toISOString());
}

// Получение URL для перенаправления
function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    if (redirect && redirect.startsWith('/')) {
        return redirect;
    }
    
    return 'index.html';
}

// Обработка "Забыли пароль"
function handleForgotPassword() {
    const username = document.getElementById('login-username').value.trim();
    
    if (!username) {
        showMessage('Пожалуйста, введите ваш username или email для восстановления пароля', 'info');
        return;
    }
    
    showMessage('Функция восстановления пароля временно недоступна. Обратитесь к администратору.', 'info');
    
    // В реальном приложении здесь был бы запрос на сброс пароля
    /*
    fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Инструкции по восстановлению пароля отправлены на ваш email', 'success');
        } else {
            showMessage(data.error || 'Ошибка восстановления пароля', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Ошибка соединения с сервером', 'error');
    });
    */
}

// Показать сообщение
function showMessage(text, type = 'info') {
    const messageElement = document.getElementById('login-message');
    const messageText = document.getElementById('message-text');
    
    messageText.textContent = text;
    messageElement.className = `login-message ${type}`;
    messageElement.style.display = 'flex';
    
    // Автоматическое скрытие для success сообщений
    if (type === 'success') {
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// Установка состояния загрузки
function setLoadingState(loading) {
    const loginBtn = document.getElementById('login-btn');
    const inputs = document.querySelectorAll('input');
    
    if (loading) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<div class="loading"></div> Вход...';
        inputs.forEach(input => input.disabled = true);
    } else {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
        inputs.forEach(input => input.disabled = false);
    }
}

// Утилиты для работы с localStorage
const storageUtils = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }
};

// Обработка ошибок сети
function handleNetworkError(error) {
    console.error('Network error:', error);
    
    if (!navigator.onLine) {
        showMessage('Отсутствует подключение к интернету. Проверьте ваше соединение.', 'error');
        return true;
    }
    
    return false;
}

// Проверка поддержки localStorage
function checkLocalStorageSupport() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.error('localStorage is not supported:', e);
        showMessage('Ваш браузер не поддерживает необходимые функции. Пожалуйста, обновите браузер.', 'error');
        return false;
    }
}

// Инициализация проверки поддержки
if (!checkLocalStorageSupport()) {
    document.getElementById('login-btn').disabled = true;
    document.getElementById('remember-me').disabled = true;
}

// Глобальные обработчики ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showMessage('Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.', 'error');
});