// Функционал модального окна новостей с синхронизацией текста
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('news-modal');
    const newsButtons = document.querySelectorAll('.news-read-btn');
    const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    
    // Открытие модального окна
    newsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newsItem = this.closest('.news-item');
            openNewsModal(newsItem);
        });
    });

    // Закрытие модального окна
    closeButtons.forEach(button => {
        button.addEventListener('click', closeNewsModal);
    });

    // Закрытие по клику вне окна
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeNewsModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeNewsModal();
        }
    });

    function openNewsModal(newsItem) {
        // Получаем данные из карточки новости
        const title = newsItem.querySelector('.news-title').textContent;
        const dateDay = newsItem.querySelector('.news-date .day').textContent;
        const dateMonth = newsItem.querySelector('.news-date .month').textContent;
        const imageSrc = newsItem.querySelector('.news-image img').src;
        const imageAlt = newsItem.querySelector('.news-image img').alt;
        const fullContent = newsItem.querySelector('.news-full-content').innerHTML;
        
        // Заполняем модальное окно
        document.querySelector('.modal-day').textContent = dateDay;
        document.querySelector('.modal-month').textContent = dateMonth;
        document.querySelector('.modal-title').textContent = title;
        document.querySelector('.modal-image img').src = imageSrc;
        document.querySelector('.modal-image img').alt = imageAlt;
        document.querySelector('.modal-text').innerHTML = fullContent;
        
        // Показываем модальное окно
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeNewsModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    async function loadNews() {
    try {
        const response = await fetch('/news-data.json?t=' + Date.now());
        const data = await response.json();
        return data.news || [];
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        return loadLocalNews(); // Fallback на локальные новости
    }
}

function loadLocalNews() {
    const localNews = JSON.parse(localStorage.getItem('localNews') || '[]');
    return localNews.filter(news => news.status !== 'draft');
}

// Функционал модального окна новостей
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('news-modal');
    const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    
    // Закрытие модального окна
    closeButtons.forEach(button => {
        button.addEventListener('click', closeNewsModal);
    });

    // Закрытие по клику вне окна
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeNewsModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeNewsModal();
        }
    });

    // Глобальная функция для открытия модального окна
    window.openNewsModal = function(newsItem) {
        // Получаем данные из карточки новости
        const title = newsItem.querySelector('.news-title').textContent;
        const dateElement = newsItem.querySelector('.news-date');
        const dateDay = dateElement ? dateElement.querySelector('.day').textContent : '15';
        const dateMonth = dateElement ? dateElement.querySelector('.month').textContent : 'Янв';
        const imageSrc = newsItem.querySelector('.news-image img').src;
        const imageAlt = newsItem.querySelector('.news-image img').alt;
        const fullContent = newsItem.querySelector('.news-full-content').innerHTML;
        
        // Заполняем модальное окно
        document.querySelector('.modal-day').textContent = dateDay;
        document.querySelector('.modal-month').textContent = dateMonth;
        document.querySelector('.modal-title').textContent = title;
        document.querySelector('.modal-image img').src = imageSrc;
        document.querySelector('.modal-image img').alt = imageAlt;
        document.querySelector('.modal-text').innerHTML = fullContent;
        
        // Показываем модальное окно
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };
});

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Предотвращаем закрытие при клике на само модальное окно
document.querySelector('.modal-content').addEventListener('click', function(event) {
    event.stopPropagation();
});
});