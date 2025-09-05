document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        // Валидация
        if (password !== passwordConfirm) {
            alert('Пароли не совпадают!');
            return;
        }
        
        if (username.length < 3) {
            alert('Имя пользователя должно содержать минимум 3 символа');
            return;
        }
        
        if (password.length < 6) {
            alert('Пароль должен содержать минимум 6 символов');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Регистрация успешна! Теперь вы можете войти.');
                window.location.href = 'login.html';
            } else {
                alert(data.error || 'Ошибка регистрации');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    });
});