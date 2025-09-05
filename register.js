// Конфигурация API
const API_CONFIG = {
    BASE_URL: window.location.origin,
    ENDPOINTS: {
        REGISTER: '/api/register',
        CHECK_USERNAME: '/api/check-username',
        CHECK_EMAIL: '/api/check-email'
    }
};

// Основные функции
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    initRegisterPage();
    
    // Обработчики событий
    setupEventListeners();
    
    // Проверка, если пользователь уже авторизован
    checkExistingAuth();
});

function initRegisterPage() {
    console.log('Инициализация страницы регистрации...');
    
    // Устанавливаем минимальную дату рождения (13+ лет)
    const minBirthDate = new Date();
    minBirthDate.setFullYear(minBirthDate.getFullYear() - 13);
    
    // Фокус на первом поле
    setTimeout(() => {
        document.getElementById('register-username').focus();
    }, 100);
}

function setupEventListeners() {
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('register-password');
    const passwordConfirmInput = document.getElementById('register-password-confirm');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const togglePasswordConfirmBtn = document.getElementById('toggle-password-confirm');
    
    // Обработка формы регистрации
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleRegistration();
    });
    
    // Переключение видимости паролей
    togglePasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, this);
    });
    
    togglePasswordConfirmBtn.addEventListener('click', function() {
        togglePasswordVisibility(passwordConfirmInput, this);
    });
    
    // Валидация в реальном времени
    document.getElementById('register-username').addEventListener('blur', function() {
        validateUsername(this.value);
    });
    
    document.getElementById('register-email').addEventListener('blur', function() {
        validateEmail(this.value);
    });
    
    passwordInput.addEventListener('input', function() {
        validatePassword(this.value);
        updatePasswordStrength(this.value);
    });
    
    passwordConfirmInput.addEventListener('input', function() {
        validatePasswordConfirm(this.value, passwordInput.value);
    });
    
    // Проверка доступности username при вводе (с debounce)
    let usernameTimeout;
    document.getElementById('register-username').addEventListener('input', function(e) {
        clearTimeout(usernameTimeout);
        usernameTimeout = setTimeout(() => {
            if (e.target.value.length >= 3) {
                checkUsernameAvailability(e.target.value);
            }
        }, 500);
    });
    
    // Проверка email при вводе (с debounce)
    let emailTimeout;
    document.getElementById('register-email').addEventListener('input', function(e) {
        clearTimeout(emailTimeout);
        emailTimeout = setTimeout(() => {
            if (e.target.value.includes('@')) {
                checkEmailAvailability(e.target.value);
            }
        }, 500);
    });
    
    // Автозаполнение при нажатии Enter
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT' && activeElement.type !== 'button') {
                registerForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}

// Проверка, если пользователь уже авторизован
function checkExistingAuth() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        showMessage('Вы уже авторизованы. Перенаправление...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
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

// Валидация имени пользователя
function validateUsername(username) {
    const errorElement = document.getElementById('username-error');
    const inputElement = document.getElementById('register-username');
    
    if (!username) {
        showError(inputElement, errorElement, 'Имя пользователя обязательно');
        return false;
    }
    
    if (username.length < 3) {
        showError(inputElement, errorElement, 'Минимум 3 символа');
        return false;
    }
    
    if (username.length > 20) {
        showError(inputElement, errorElement, 'Максимум 20 символов');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError(inputElement, errorElement, 'Только буквы, цифры и подчеркивания');
        return false;
    }
    
    clearError(inputElement, errorElement);
    return true;
}

// Валидация email
function validateEmail(email) {
    const errorElement = document.getElementById('email-error');
    const inputElement = document.getElementById('register-email');
    
    if (!email) {
        showError(inputElement, errorElement, 'Email обязателен');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(inputElement, errorElement, 'Неверный формат email');
        return false;
    }
    
    clearError(inputElement, errorElement);
    return true;
}

// Валидация пароля
function validatePassword(password) {
    const errorElement = document.getElementById('password-error');
    const inputElement = document.getElementById('register-password');
    
    if (!password) {
        showError(inputElement, errorElement, 'Пароль обязателен');
        return false;
    }
    
    if (password.length < 6) {
        showError(inputElement, errorElement, 'Минимум 6 символов');
        return false;
    }
    
    clearError(inputElement, errorElement);
    return true;
}

// Валидация подтверждения пароля
function validatePasswordConfirm(passwordConfirm, password) {
    const errorElement = document.getElementById('password-confirm-error');
    const inputElement = document.getElementById('register-password-confirm');
    
    if (!passwordConfirm) {
        showError(inputElement, errorElement, 'Подтвердите пароль');
        return false;
    }
    
    if (passwordConfirm !== password) {
        showError(inputElement, errorElement, 'Пароли не совпадают');
        return false;
    }
    
    clearError(inputElement, errorElement);
    return true;
}

// Обновление индикатора сложности пароля
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    
    let strength = 0;
    let message = '';
    let color = '';
    
    // Проверяем требования
    const hasLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    // Обновляем список требований
    updateRequirement('req-length', hasLength);
    updateRequirement('req-uppercase', hasUppercase);
    updateRequirement('req-lowercase', hasLowercase);
    updateRequirement('req-number', hasNumber);
    
    // Вычисляем силу пароля
    if (password.length > 0) strength += 20;
    if (hasLength) strength += 20;
    if (hasUppercase) strength += 20;
    if (hasLowercase) strength += 20;
    if (hasNumber) strength += 10;
    if (hasSpecial) strength += 10;
    
    // Устанавливаем сообщение и цвет
    if (strength === 0) {
        message = '';
        color = 'transparent';
    } else if (strength < 40) {
        message = 'Слабый';
        color = '#ff4757';
    } else if (strength < 70) {
        message = 'Средний';
        color = '#ffa502';
    } else if (strength < 90) {
        message = 'Хороший';
        color = '#2ed573';
    } else {
        message = 'Отличный';
        color = '#2ed573';
    }
    
    strengthBar.style.width = strength + '%';
    strengthBar.style.background = color;
    strengthText.textContent = message;
    strengthText.style.color = color;
}

// Обновление отображения требования пароля
function updateRequirement(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (element) {
        element.className = isValid ? 'valid' : 'invalid';
    }
}

// Проверка доступности имени пользователя
async function checkUsernameAvailability(username) {
    if (username.length < 3) return;
    
    try {
        const response = await fetch(`${API_CONFIG.ENDPOINTS.CHECK_USERNAME}?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        const errorElement = document.getElementById('username-error');
        const inputElement = document.getElementById('register-username');
        
        if (!data.available) {
            showError(inputElement, errorElement, 'Имя пользователя уже занято');
        } else {
            clearError(inputElement, errorElement);
        }
    } catch (error) {
        console.error('Ошибка проверки username:', error);
        // Игнорируем ошибки проверки
    }
}

// Проверка доступности email
async function checkEmailAvailability(email) {
    if (!email.includes('@')) return;
    
    try {
        const response = await fetch(`${API_CONFIG.ENDPOINTS.CHECK_EMAIL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        const errorElement = document.getElementById('email-error');
        const inputElement = document.getElementById('register-email');
        
        if (!data.available) {
            showError(inputElement, errorElement, 'Email уже используется');
        } else {
            clearError(inputElement, errorElement);
        }
    } catch (error) {
        console.error('Ошибка проверки email:', error);
        // Игнорируем ошибки проверки
    }
}

// Обработка регистрации
async function handleRegistration() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    const newsletter = document.getElementById('newsletter').checked;
    
    // Валидация всех полей
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPasswordConfirmValid = validatePasswordConfirm(passwordConfirm, password);
    
    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isPasswordConfirmValid) {
        showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('Необходимо согласиться с правилами использования', 'error');
        return;
    }
    
    // Показываем загрузку
    setLoadingState(true);
    
    try {
        const response = await registerUser(username, email, password, newsletter);
        
        if (response.success) {
            showMessage('Регистрация успешна! Перенаправление на страницу входа...', 'success');
            
            // Очищаем форму
            document.getElementById('register-form').reset();
            updatePasswordStrength('');
            
            // Перенаправляем после задержки
            setTimeout(() => {
                window.location.href = 'login.html?message=Регистрация успешна! Теперь вы можете войти.&type=success';
            }, 2000);
            
        } else {
            showMessage(response.error || 'Ошибка регистрации', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showMessage('Ошибка соединения с сервером', 'error');
    } finally {
        setLoadingState(false);
    }
}

// API: Регистрация пользователя
async function registerUser(username, email, password, newsletter) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                username: username,
                email: email,
                password: password,
                newsletter: newsletter,
                agreed_to_terms: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('API Error:', error);
        
        // Fallback: локальная регистрация
        return await localRegister(username, email, password, newsletter);
    }
}

// Локальная регистрация (fallback)
async function localRegister(username, email, password, newsletter) {
    try {
        // Получаем существующих пользователей
        const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
        
        // Проверяем, существует ли пользователь
        const userExists = users.some(user => 
            user.username === username || user.email === email
        );
        
        if (userExists) {
            return {
                success: false,
                error: 'Пользователь с таким именем или email уже существует'
            };
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password, // В реальном приложении нужно хешировать!
            role: 'user',
            newsletter: newsletter,
            created_at: new Date().toISOString(),
            status: 'active'
        };
        
        // Сохраняем
        users.push(newUser);
        localStorage.setItem('localUsers', JSON.stringify(users));
        
        return {
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        };
        
    } catch (error) {
        console.error('Local register error:', error);
        return {
            success: false,
            error: 'Ошибка локальной регистрации'
        };
    }
}

// Показать ошибку поля
function showError(inputElement, errorElement, message) {
    inputElement.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Очистить ошибку поля
function clearError(inputElement, errorElement) {
    inputElement.classList.remove('error');
    errorElement.style.display = 'none';
}

// Показать сообщение
function showMessage(text, type = 'info') {
    const messageElement = document.getElementById('register-message');
    const messageText = document.getElementById('message-text');
    
    messageText.textContent = text;
    messageElement.className = `register-message ${type}`;
    messageElement.style.display = 'flex';
    
    // Автоматическое скрытие
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Установка состояния загрузки
function setLoadingState(loading) {
    const registerBtn = document.getElementById('register-btn');
    const inputs = document.querySelectorAll('input');
    
    if (loading) {
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<div class="loading"></div> Регистрация...';
        inputs.forEach(input => input.disabled = true);
    } else {
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Создать аккаунт';
        inputs.forEach(input => input.disabled = false);
    }
}

// Утилиты
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Глобальные обработчики ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showMessage('Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.', 'error');
});