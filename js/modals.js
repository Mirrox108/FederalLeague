// Функционал модального окна новостей
document.addEventListener('DOMContentLoaded', function() {
    initializeModal();
});

// Инициализация модального окна
function initializeModal() {
    const modal = document.getElementById('news-modal');
    if (!modal) {
        console.error('Модальное окно не найдено!');
        return;
    }

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

    // Предотвращаем закрытие при клике на само модальное окно
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}

// Глобальная функция для открытия модального окна
function openNewsModal(newsItem) {
    const modal = document.getElementById('news-modal');
    if (!modal) {
        console.error('Модальное окно не найдено!');
        return;
    }
    
    // Получаем данные из карточки новости
    const title = newsItem.querySelector('.news-title').textContent;
    const dateElement = newsItem.querySelector('.news-date');
    const dateDay = dateElement ? dateElement.querySelector('.day').textContent : '15';
    const dateMonth = dateElement ? dateElement.querySelector('.month').textContent : 'Янв';
    
    const imageElement = newsItem.querySelector('.news-image img');
    const imageSrc = imageElement ? imageElement.src : '';
    const imageAlt = imageElement ? imageElement.alt : '';
    
    const fullContentElement = newsItem.querySelector('.news-full-content');
    const fullContent = fullContentElement ? fullContentElement.innerHTML : '<p>Содержимое новости недоступно</p>';
    
    // Заполняем модальное окно
    const modalDay = document.querySelector('.modal-day');
    const modalMonth = document.querySelector('.modal-month');
    const modalTitle = document.querySelector('.modal-title');
    const modalImage = document.querySelector('.modal-image img');
    const modalText = document.querySelector('.modal-text');
    
    if (modalDay) modalDay.textContent = dateDay;
    if (modalMonth) modalMonth.textContent = dateMonth;
    if (modalTitle) modalTitle.textContent = title;
    
    if (modalImage && imageSrc) {
        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
    }
    
    if (modalText) modalText.innerHTML = fullContent;
    
    // Показываем модальное окно
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Функция для загрузки новостей
async function loadNews() {
    try {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;
        
        // Показываем индикатор загрузки
        newsContainer.innerHTML = `
            <div class="news-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка новостей...</p>
            </div>
        `;

        // Попытка загрузить новости с API
        const response = await fetch('https://api.federalleague.ru/news');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newsData = await response.json();
        
        // Очищаем контейнер
        newsContainer.innerHTML = '';
        
        // Добавляем новости
        if (newsData && newsData.length > 0) {
            newsData.forEach(item => {
                addNewsItem(newsContainer, item);
            });
        } else {
            // Если новостей нет, показываем демо-новости
            showDemoNews(newsContainer);
        }
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        // Показываем демо-новости при ошибке
        const newsContainer = document.getElementById('news-container');
        if (newsContainer) {
            showDemoNews(newsContainer);
        }
    }
}

// Функция для добавления элемента новости
function addNewsItem(container, item) {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    
    const newsDate = new Date(item.date || Date.now());
    const day = newsDate.getDate();
    const month = newsDate.toLocaleString('ru-RU', { month: 'short' });
    
    newsItem.innerHTML = `
        <div class="news-image">
            <img src="${item.image || 'images/news-placeholder.jpg'}" alt="${item.title || 'Новость'}">
        </div>
        <div class="news-content">
            <div class="news-date">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
            </div>
            <h3 class="news-title">${item.title || 'Без названия'}</h3>
            <p class="news-excerpt">${item.excerpt || 'Описание отсутствует'}</p>
            <button class="news-read-btn" onclick="openNewsModal(this.parentNode.parentNode)">
                <i class="fas fa-book-open"></i>
                Читать далее
            </button>
            <div class="news-full-content" style="display: none;">
                ${item.content || '<p>Содержимое новости недоступно</p>'}
            </div>
        </div>
    `;
    
    container.appendChild(newsItem);
}

// Функция для показа демо-новостей
function showDemoNews(container) {
    const demoNews = [
        {
            title: "Запуск нового сезона!",
            date: new Date(),
            image: "images/news1.jpg",
            excerpt: "Мы рады объявить о начале нового сезона на нашем сервере. Много новых возможностей и улучшений ждут вас!",
            content: `<p>Мы рады объявить о начале нового сезона на нашем сервере Federal League! Этот сезон принесет много новых возможностей и улучшений:</p>
                     <ul>
                         <li>Обновленная политическая система</li>
                         <li>Новые механики войны между государствами</li>
                         <li>Улучшенная экономическая система</li>
                         <li>Исправление множества багов и оптимизация производительности</li>
                     </ul>
                     <p>Присоединяйтесь к нам и станьте частью истории нашего сервера!</p>`
        },
        {
            title: "Конкурс на лучший город",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            image: "images/news2.jpg",
            excerpt: "Объявляем конкурс на самый красивый и функциональный город. Ценные призы победителям!",
            content: `<p>Объявляем конкурс на самый красивый и функциональный город на нашем сервере! Условия участия:</p>
                     <ul>
                         <li>Город должен быть основан не позднее чем за неделю до окончания конкурса</li>
                         <li>Минимальное количество жителей - 5 человек</li>
                         <li>Город должен иметь уникальный дизайн и инфраструктуру</li>
                     </ul>
                     <p>Главный приз: 5000 FL Coins и уникальный титул «Архитектор сезона»!</p>`
        },
        {
            title: "Обновление системы сражений",
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            image: "images/news3.jpg",
            excerpt: "Мы полностью переработали систему войн и сражений между государствами. Теперь битвы стали еще эпичнее!",
            content: `<p>Мы полностью переработали систему войн и сражений между государствами. Основные изменения:</p>
                     <ul>
                         <li>Новая система осад замков и крепостей</li>
                         <li>Улучшенный баланс между нападающими и защитниками</li>
                         <li>Добавлены новые виды осадных орудий</li>
                         <li>Введена система военных рангов и званий</li>
                     </ul>
                     <p>Теперь битвы стали еще эпичнее и стратегически интереснее!</p>`
        }
    ];
    
    container.innerHTML = '';
    
    demoNews.forEach(item => {
        addNewsItem(container, item);
    });
}

// Функция для загрузки всех новостей
function loadAllNews() {
    // В реальном приложении здесь будет переход на страницу со всеми новостей
    alert('Функция "Смотреть все новости" будет реализована в будущем обновлении');
}

// Функция для создания новости (для админ-панели)
function createNewsItem(title, content, excerpt, image) {
    return {
        title: title || 'Без названия',
        content: content || '<p>Содержимое новости отсутствует</p>',
        excerpt: excerpt || 'Описание отсутствует',
        image: image || 'images/news-placeholder.jpg',
        date: new Date()
    };
}

// Экспорт функций для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeModal,
        openNewsModal,
        closeNewsModal,
        loadNews,
        showDemoNews,
        loadAllNews,
        createNewsItem
    };
}