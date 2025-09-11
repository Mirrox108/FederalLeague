// news-api.js - Клиент для работы с API новостей
class NewsAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiURL = `${this.baseURL}/api.php`;
        this.authToken = localStorage.getItem('news_auth_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.apiURL}?${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Добавляем токен авторизации если есть
        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Получить все новости
    async getNews() {
        return this.request('action=get');
    }

    // Получить опубликованные новости
    async getPublishedNews() {
        return this.request('action=get-published');
    }

    // Создать новость
    async createNews(newsData) {
        return this.request('action=create', {
            method: 'POST',
            body: JSON.stringify(newsData)
        });
    }

    // Обновить новость
    async updateNews(id, newsData) {
        return this.request('action=update', {
            method: 'POST',
            body: JSON.stringify({ id, ...newsData })
        });
    }

    // Удалить новость
    async deleteNews(id) {
        return this.request(`action=delete&id=${id}`, {
            method: 'DELETE'
        });
    }

    // Получить статистику
    async getStats() {
        return this.request('action=stats');
    }

    // Авторизация
    login(password) {
        this.authToken = password;
        localStorage.setItem('news_auth_token', password);
        return true;
    }

    // Выход
    logout() {
        this.authToken = null;
        localStorage.removeItem('news_auth_token');
    }

    // Проверить авторизацию
    isAuthenticated() {
        return !!this.authToken;
    }
}

// Глобальный экземпляр
window.newsAPI = new NewsAPI();