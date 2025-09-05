// Конфигурация админ-панели
const ADMIN_CONFIG = {
    PASSWORD: "bLPU8sijONYk",
    SECURITY_CODE: "FLADMIN", 
    ALLOWED_IPS: [
        "212.35.189.21",
        "127.0.0.1",
        "localhost"
    ],
    SESSION_TIMEOUT: 30 * 60 * 1000,
    API_URL: "/api/admin/news"
};

// Основной код админ-панели
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const sessionTimer = document.getElementById('session-timer');
    const ipStatus = document.getElementById('ip-status');
    const currentIp = document.getElementById('current-ip');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('admin-password');
    const newsForm = document.getElementById('news-form');
    const imageInput = document.getElementById('news-image');
    const imagePreview = document.getElementById('image-preview');
    const fileName = document.getElementById('file-name');
    
    let sessionTimeout;
    let sessionTimeLeft = ADMIN_CONFIG.SESSION_TIMEOUT;
    
    // Проверка IP при загрузке
    checkIP();
    
    // Переключение видимости пароля
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Обработка формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('admin-password').value;
            const securityCode = document.getElementById('security-code').value;
            
            if (authenticate(password, securityCode)) {
                startSession();
            } else {
                showMessage('Неверные учетные данные!', 'error');
            }
        });
    }
    
    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            endSession();
        });
    }
    
    // Обработка загрузки изображения
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.querySelector('img').src = e.target.result;
                        imagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }
    
    // Удаление изображения
    const removeImageBtn = document.querySelector('.remove-image');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            imageInput.value = '';
            fileName.textContent = 'Файл не выбран';
            imagePreview.style.display = 'none';
        });
    }
    
    // Счетчик символов
    const newsTitle = document.getElementById('news-title');
    const newsExcerpt = document.getElementById('news-excerpt');
    
    if (newsTitle) {
        newsTitle.addEventListener('input', updateCharCounter);
    }
    if (newsExcerpt) {
        newsExcerpt.addEventListener('input', updateCharCounter);
    }
    
    // Панель инструментов редактора
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tag = this.dataset.tag;
            insertText(tag);
        });
    });
    
    // Обработка формы новости
    if (newsForm) {
        newsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNews();
        });
    }
    
    // Сохранение черновика
    const saveDraftBtn = document.getElementById('save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            saveNews(true);
        });
    }
    
    // Функции
    async function checkIP() {
        const ipStatus = document.getElementById('ip-status');
        const ipAddress = document.getElementById('ip-address');
        const loginBtn = document.querySelector('.login-btn');
        const passwordInput = document.getElementById('admin-password');
        const securityInput = document.getElementById('security-code');
        
        ipStatus.textContent = "Определение...";
        ipAddress.textContent = "Ваш IP: определение...";

        // Fallback для локальной разработки
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname === '' ||
            window.location.protocol === 'file:') {
            
            ipStatus.textContent = "✓ Локальный режим";
            ipStatus.style.color = 'var(--green-color)';
            ipAddress.textContent = "Ваш IP: 127.0.0.1 (localhost)";
            currentIp.textContent = `IP: 127.0.0.1`;
            
            // Разблокируем форму
            passwordInput.disabled = false;
            securityInput.disabled = false;
            loginBtn.disabled = false;
            
            showMessage('Локальный режим разработки - доступ разрешен', 'info');
            return;
        }
        
        try {
            // Получаем IP пользователя
            const userIP = await getClientIP();
            
            // Обновляем отображение IP
            ipAddress.textContent = `Ваш IP: ${userIP}`;
            ipAddress.style.color = 'var(--description-color)';
            currentIp.textContent = `IP: ${userIP}`;
            
            // Проверяем разрешенные IP
            const isAllowed = ADMIN_CONFIG.ALLOWED_IPS.includes(userIP) || 
                             ADMIN_CONFIG.ALLOWED_IPS.includes('*') ||
                             window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1';
            
            if (isAllowed) {
                ipStatus.textContent = "✓ Разрешен";
                ipStatus.style.color = 'var(--green-color)';
                
                // Разблокируем форму
                passwordInput.disabled = false;
                securityInput.disabled = false;
                loginBtn.disabled = false;
                
            } else {
                ipStatus.textContent = "✗ Заблокирован";
                ipStatus.style.color = 'var(--red-color)';
                
                // Блокируем форму
                passwordInput.disabled = true;
                securityInput.disabled = true;
                loginBtn.disabled = true;
                
                showMessage('Доступ с вашего IP запрещен! Обратитесь к администратору.', 'error');
            }
            
        } catch (error) {
            console.error('Ошибка проверки IP:', error);
            ipStatus.textContent = "Ошибка проверки";
            ipStatus.style.color = 'var(--red-color)';
            ipAddress.textContent = "Ваш IP: не определен";
            
            // В режиме разработки разрешаем доступ
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname === '' ||
                window.location.protocol === 'file:') {
                
                ipStatus.textContent = "✓ Локальный доступ";
                ipStatus.style.color = 'var(--green-color)';
                ipAddress.textContent = "Ваш IP: 127.0.0.1 (localhost)";
                passwordInput.disabled = false;
                securityInput.disabled = false;
                loginBtn.disabled = false;
                
            } else {
                showMessage('Не удалось определить IP. Попробуйте обновить страницу.', 'warning');
            }
        }
    }

    async function getClientIP() {
        // Простой и надежный способ через ipify.org
        try {
            const response = await fetch('https://api.ipify.org?format=json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.ip;
            
        } catch (error) {
            console.log('ipify.org не сработал:', error);
            
            // Пробуем альтернативный метод через text
            try {
                const response = await fetch('https://api.ipify.org?format=text', {
                    credentials: 'omit'
                });
                
                if (response.ok) {
                    const ip = await response.text();
                    if (ip && ip.trim().length > 0) {
                        return ip.trim();
                    }
                }
            } catch (textError) {
                console.log('ipify text format тоже не сработал:', textError);
            }
            
            // Последний вариант - используем DNS запрос через trick
            try {
                const ip = await getIPviaWebRTC();
                if (ip) return ip;
            } catch (webrtcError) {
                console.log('WebRTC метод не сработал:', webrtcError);
            }
            
            throw new Error('Не удалось определить IP');
        }
    }

    // Альтернативный метод через WebRTC (работает локально)
    async function getIPviaWebRTC() {
        return new Promise((resolve, reject) => {
            const pc = new RTCPeerConnection({ iceServers: [] });
            
            pc.createDataChannel('');
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .catch(reject);
            
            pc.onicecandidate = ice => {
                if (ice && ice.candidate && ice.candidate.candidate) {
                    const candidate = ice.candidate.candidate;
                    const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                    
                    if (ipMatch && ipMatch[1]) {
                        resolve(ipMatch[1]);
                        pc.close();
                    }
                }
            };
            
            setTimeout(() => reject(new Error('WebRTC timeout')), 2000);
        });
    }

    function authenticate(password, securityCode) {
        return password === ADMIN_CONFIG.PASSWORD && 
               securityCode === ADMIN_CONFIG.SECURITY_CODE;
    }
    
    function startSession() {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        
        // Запуск таймера сессии
        startSessionTimer();
        
        showMessage('Успешный вход в систему!', 'success');
    }
    
    function endSession() {
        clearTimeout(sessionTimeout);
        loginScreen.style.display = 'flex';
        adminPanel.style.display = 'none';
        
        // Сброс формы
        loginForm.reset();
        if (newsForm) newsForm.reset();
        if (imagePreview) imagePreview.style.display = 'none';
        if (fileName) fileName.textContent = 'Файл не выбран';
        
        showMessage('Сессия завершена', 'info');
    }
    
    function startSessionTimer() {
        sessionTimeLeft = ADMIN_CONFIG.SESSION_TIMEOUT;
        updateTimerDisplay();
        
        sessionTimeout = setInterval(function() {
            sessionTimeLeft -= 1000;
            
            if (sessionTimeLeft <= 0) {
                clearInterval(sessionTimeout);
                endSession();
                showMessage('Сессия истекла!', 'warning');
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        if (sessionTimer) {
            const minutes = Math.floor(sessionTimeLeft / 60000);
            const seconds = Math.floor((sessionTimeLeft % 60000) / 1000);
            sessionTimer.querySelector('span').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    function updateCharCounter(e) {
        const input = e.target;
        const counter = input.parentElement.querySelector('.char-counter');
        const maxLength = input.getAttribute('maxlength');
        if (counter) {
            counter.textContent = `${input.value.length}/${maxLength}`;
        }
    }
    
    function insertText(tag) {
        const textarea = document.getElementById('news-content');
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let wrappedText = '';
        
        switch(tag) {
            case 'h2':
                wrappedText = `<h2>${selectedText || 'Заголовок'}</h2>`;
                break;
            case 'h3':
                wrappedText = `<h3>${selectedText || 'Подзаголовок'}</h3>`;
                break;
            case 'ul':
                wrappedText = `<ul>\n<li>${selectedText || 'Элемент списка'}</li>\n</ul>`;
                break;
            case 'li':
                wrappedText = `<li>${selectedText || 'Новый элемент'}</li>`;
                break;
            case 'b':
                wrappedText = `<b>${selectedText || 'жирный текст'}</b>`;
                break;
            case 'i':
                wrappedText = `<i>${selectedText || 'курсив'}</i>`;
                break;
        }
        
        textarea.value = textarea.value.substring(0, start) + 
                         wrappedText + 
                         textarea.value.substring(end);
    }
    
    function saveNews(isDraft = false) {
        const newsData = {
            id: Date.now(),
            title: document.getElementById('news-title').value,
            date: document.getElementById('news-date').value,
            excerpt: document.getElementById('news-excerpt').value,
            content: document.getElementById('news-content').value,
            image: getImagePreviewData(),
            timestamp: new Date().getTime(),
            status: isDraft ? 'draft' : 'published'
        };

        // Сохраняем в localStorage
        const allNews = JSON.parse(localStorage.getItem('websiteNews') || '[]');
        allNews.unshift(newsData); // Добавляем в начало
        
        // Ограничиваем количество новостей (последние 50)
        const limitedNews = allNews.slice(0, 50);
        
        localStorage.setItem('websiteNews', JSON.stringify(limitedNews));
        
        showMessage(
            isDraft ? 'Черновик сохранен локально!' : 'Новость опубликована!', 
            'success'
        );
        
        if (!isDraft) {
            clearForm();
        }
    }

    function getImagePreviewData() {
        const preview = document.querySelector('#image-preview img');
        return preview ? preview.src : null;
    }

    function clearForm() {
        if (newsForm) newsForm.reset();
        if (imagePreview) imagePreview.style.display = 'none';
        if (fileName) fileName.textContent = 'Файл не выбран';
        
        // Сбрасываем счетчики символов
        document.querySelectorAll('.char-counter').forEach(counter => {
            counter.textContent = '0/100';
        });
    }

    function showMessage(message, type = 'info') {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Убираем через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function getIconForType(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Синхронизация локальных новостей
    function syncLocalNews() {
        const localNews = JSON.parse(localStorage.getItem('localNews') || '[]');
        if (localNews.length > 0) {
            showMessage(`Есть ${localNews.length} несинхронизированных новостей`, 'warning');
            
            // Пытаемся синхронизировать
            localNews.forEach(async (news) => {
                try {
                    await fetch('/api/save-news', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(news)
                    });
                    
                    // Удаляем из локального хранилища после успешной синхронизации
                    const updatedNews = localNews.filter(n => n.id !== news.id);
                    localStorage.setItem('localNews', JSON.stringify(updatedNews));
                    
                } catch (error) {
                    console.error('Ошибка синхронизации новости:', error);
                }
            });
        }
    }

    // Вызываем при загрузке админ-панели
    syncLocalNews();

    // Функции для переключения разделов
    function switchSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }

    // Инициализация Chart.js для статистики
    function initCharts() {
        const usersCtx = document.getElementById('users-chart');
        const activityCtx = document.getElementById('activity-chart');
        
        if (usersCtx && activityCtx) {
            // Заглушки для графиков
            new Chart(usersCtx, {
                type: 'line',
                data: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Пользователи',
                        data: [12, 19, 3, 5, 2, 3, 15],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                }
            });
            
            new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                    datasets: [{
                        label: 'Активность',
                        data: [65, 59, 80, 81, 56, 55],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    }]
                }
            });
        }
    }

    // Инициализация графиков при загрузке раздела статистики
    const statsSection = document.getElementById('stats');
    if (statsSection) {
        statsSection.addEventListener('click', function() {
            setTimeout(initCharts, 100);
        });
    }

    // Обработчики для модальных окон
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Закрытие модальных окон по клику вне области
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});