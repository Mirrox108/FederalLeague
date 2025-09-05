document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    checkAuth();
    
    // Навигация
    document.querySelectorAll('.account-nav .nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.id === 'logout-btn') {
                e.preventDefault();
                logout();
                return;
            }
            
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            switchSection(target);
        });
    });
    
    // Обработка формы профиля
    document.querySelector('.profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Загрузка данных пользователя
    loadUserData();
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Проверяем валидность токена
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.id) {
        window.location.href = 'login.html';
    }
}

function switchSection(sectionId) {
    // Обновляем активные элементы навигации
    document.querySelectorAll('.account-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.account-nav .nav-item[href="#${sectionId}"]`).classList.add('active');
    
    // Показываем соответствующую секцию
    document.querySelectorAll('.account-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

async function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Заполняем данные в интерфейсе
    document.getElementById('user-name').textContent = userData.username || 'Гость';
    document.getElementById('user-role').textContent = getRoleName(userData.role) || 'Не авторизован';
    document.getElementById('profile-username').value = userData.username || '';
    document.getElementById('profile-email').value = userData.email || '';
}

function getRoleName(role) {
    const roles = {
        'user': 'Пользователь',
        'moderator': 'Модератор',
        'admin': 'Администратор',
        'superadmin': 'Старший администратор'
    };
    return roles[role] || role;
}

async function updateProfile() {
    const formData = {
        email: document.getElementById('profile-email').value,
        password: document.getElementById('profile-password').value || undefined
    };
    
    try {
        const response = await fetch('/api/account/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Профиль успешно обновлен!');
        } else {
            throw new Error('Ошибка обновления профиля');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось обновить профиль');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}