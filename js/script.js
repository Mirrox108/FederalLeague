/*
Configuration
------------------------
If something doesn't work please contact me on discord (Astronawta#0012).
*/

const config = {
    serverInfo: {
        serverLogoImageFileName: "logo.png", /*This is a file name for logo in /images/ (If you upload new logo with other name, you must change this value)*/
        serverName: "Federal League", /*Server name*/
        serverIp: "45.11.231.92:30038", /*Server IP (if you want to add online user counter, you must have true the enable-status and enable-query of server.properties)*/
        discordServerID: "1315262166458171465" /*Your server ID (if you want to add online user counter, you must have enabled Discord server widget)*/
    },

    /*Admin-Team
    ------------
    If you want to create new group, you must add this structure to adminTeamPage:
    <nameOfGroup>: [
        {
            inGameName: "Astronavta",
            rank: "Owner",
            skinUrlOrPathToFile: "",
            rankColor: ""
        },
    ]
    then you must add this group with same name to atGroupsDefaultColors and set the color you want for the group.
    You can also set a special color for a specific user, just put it in the rankColor of that user.

    All skins for original players are generate automaticaly. If you want to add skins to warez players, yout must add url for skin to skinUrlOrPathToFile
        {
            inGameName: "Astronavta",  <--- In-Game name
            rank: "Owner",  <-- rank
            skinUrlOrPathToFile: "",  <-- url or file path for skin image for warez players (if you have original minecraft leave it be empty)
            rankColor: "rgba(255, 3, 3, 1)"  <-- special rank color
        },

    If you want to change skin type replace userSKinTypeInAdminTeam with something you want from array in comments
    */
    userSKinTypeInAdminTeam: "bust", /*[full, bust, head, face, front, frontFull, skin]*/
    atGroupsDefaultColors: {
        leaders: "rgba(255, 124, 124, 0.5)",
        developers: "rgba(230, 83, 0, 0.5)",
        helpers: "rgba(11, 175, 255, 0.5)",
        builders: "rgba(247, 2, 176, 0.5)",
    },
    adminTeamPage: {
        leaders: [
            {
                inGameName: "Astronavta",
                rank: "Owner",
                skinUrlOrPathToFile: "",
                rankColor: "rgba(255, 3, 3, 1)"
            },
            {
                inGameName: "Astronavta",
                rank: "Owner",
                skinUrlOrPathToFile: "",
                rankColor: "rgba(255, 3, 3, 1)"
            },
            {
                inGameName: "Astronavta",
                rank: "Manager",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Moderator",
                skinUrlOrPathToFile: "",
                rankColor: ""
            }
        ],
        developers: [
            {
                inGameName: "Astronavta",
                rank: "Developer",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Developer",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Webmaster",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Discord manager",
                skinUrlOrPathToFile: "",
                rankColor: ""
            }
        ],
        helpers: [
            {
                inGameName: "Astronavta",
                rank: "Helper++",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Helper++",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Helper+",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Helper+",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Helper",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Helper",
                skinUrlOrPathToFile: "",
                rankColor: ""
            }
        ],
        builders: [
            {
                inGameName: "Astronavta",
                rank: "Builder++",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Builder++",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Builder+",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Builder+",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Builder",
                skinUrlOrPathToFile: "",
                rankColor: ""
            },
            {
                inGameName: "Astronavta",
                rank: "Builder",
                skinUrlOrPathToFile: "",
                rankColor: ""
            }
        ]
    },

    /*
    Contact form
    ------------
    To activate, you need to send the first email via the contact form and confirm it in the email.
    Emails are sent via https://formsubmit.co/
    */
    contactPage: {
        email: "astronavta@example.com"
    }
}

/*If you want to change website color go to /css/global.css and in :root {} is a color pallete (don't change names of variables, change only values)*/
















/*If you want everything to work as it should and you don't understand what is written here, don't touch it :D*/


/*Mobile navbar (open, close)*/
const navbar = document.querySelector(".navbar");
const navbarLinks = document.querySelector(".links");
const hamburger = document.querySelector(".hamburger");

hamburger.addEventListener("click", () => {
    navbar.classList.toggle("active");
    navbarLinks.classList.toggle("active");
})

/*FAQs*/
const accordionItemHeaders = document.querySelectorAll(".accordion-item-header");

accordionItemHeaders.forEach(accordionItemHeader => {
    accordionItemHeader.addEventListener("click", () => {
        accordionItemHeader.classList.toggle("active");
        const accordionItemBody = accordionItemHeader.nextElementSibling;

        if(accordionItemHeader.classList.contains("active")) accordionItemBody.style.maxHeight = accordionItemBody.scrollHeight + "px";
        else accordionItemBody.style.maxHeight = "0px";
    });
});

/*Config navbar*/
const serverName = document.querySelector(".server-name");
const serverLogo = document.querySelector(".logo-img");
/*Config header*/
const serverIp = document.querySelector(".minecraft-server-ip");
const serverLogoHeader = document.querySelector(".logo-img-header");
const discordOnlineUsers = document.querySelector(".discord-online-users");
const minecraftOnlinePlayers = document.querySelector(".minecraft-online-players");
/*Config contact*/
const contactForm = document.querySelector(".contact-form");
const inputWithLocationAfterSubmit = document.querySelector(".location-after-submit");

const getDiscordOnlineUsers = async () => {
    try {
        const discordServerId = config.serverInfo.discordServerID;

        const apiWidgetUrl = `https://discord.com/api/guilds/${discordServerId}/widget.json`;
        let response = await fetch(apiWidgetUrl);
        let data = await response.json();

        if(!data.presence_count) return "None";
        else return (await data.presence_count);
    } catch (e) {
        return "None";
    }
}

const getMinecraftOnlinePlayer = async () => {
    try {
        const serverIp = config.serverInfo.serverIp;

        const apiUrl = `https://api.mcsrvstat.us/2/${serverIp}`;
        let response = await fetch(apiUrl);
        let data = await response.json();

        return data.players.online;
    } catch (e) {
        console.log(e);
        return "None";
    }
}

const getUuidByUsername = async (username) => {
    try {
        const usernameToUuidApi = `https://api.minetools.eu/uuid/${username}`;
        let response = await fetch(usernameToUuidApi);
        let data = await response.json();

        return data.id;
    } catch (e) {
        console.log(e);
        return "None";
    }
}

const getSkinByUuid = async (username) => {
    try {
        const skinByUuidApi = `https://visage.surgeplay.com/${config.userSKinTypeInAdminTeam}/512/${await getUuidByUsername(username)}`;
        let response = await fetch(skinByUuidApi);

        if(response.status === 400) return `https://visage.surgeplay.com/${config.userSKinTypeInAdminTeam}/512/ec561538f3fd461daff5086b22154bce`;
        else return skinByUuidApi;
    } catch (e) {
        console.log(e);
        return "None";
    }
}

/*IP copy only works if you have HTTPS on your website*/
const copyIp = () => {
    const copyIpButton = document.querySelector(".copy-ip");
    const copyIpAlert = document.querySelector(".ip-copied");

    copyIpButton.addEventListener("click", () => {
        try {
            navigator.clipboard.writeText(config.serverInfo.serverIp);
    
            copyIpAlert.classList.add("active");

            setTimeout(() => {
                copyIpAlert.classList.remove("active");
            }, 5000);
        } catch (e) {
            console.log(e);
            copyIpAlert.innerHTML = "An error has occurred!";
            copyIpAlert.classList.add("active");
            copyIpAlert.classList.add("error");

            setTimeout(() => {
                copyIpAlert.classList.remove("active");
                copyIpAlert.classList.remove("error");
            }, 5000);
        }
    })
}

const setDataFromConfigToHtml = async () => {
    /*Set config data to navbar*/
    serverName.innerHTML = config.serverInfo.serverName;
    serverLogo.src = `images/` + config.serverInfo.serverLogoImageFileName;

    /*Set config data to header*/
    serverIp.innerHTML = config.serverInfo.serverIp;

    let locationPathname = location.pathname;

    if(locationPathname == "/" || locationPathname.includes("index")) {
        copyIp();
        /*Set config data to header*/
        serverLogoHeader.src = `images/` + config.serverInfo.serverLogoImageFileName;
        discordOnlineUsers.innerHTML = await getDiscordOnlineUsers();
        minecraftOnlinePlayers.innerHTML = await getMinecraftOnlinePlayer();
    } else if(locationPathname.includes("rules")) {
        copyIp();
    }
    else if(locationPathname.includes("admin-team")) {
        for (let team in config.adminTeamPage) {
            const atContent = document.querySelector(".at-content");
            
            const group = document.createElement("div");
            group.classList.add("group");
            group.classList.add(team);

            const groupSchema = `
                <h2 class="rank-title">${team.charAt(0).toUpperCase() + team.slice(1)}</h2>
                <div class="users">
                </div>
            `;

            group.innerHTML = groupSchema;

            atContent.appendChild(group);

            for (let j = 0; j < config.adminTeamPage[team].length; j++) {
                let user = config.adminTeamPage[team][j];
                const group = document.querySelector("." + team + " .users");

                const userDiv = document.createElement("div");
                userDiv.classList.add("user");

                let userSkin = config.adminTeamPage[team][j].skinUrlOrPathToFile;

                if(userSkin == "") userSkin = await getSkinByUuid(user.inGameName);
                let rankColor = config.atGroupsDefaultColors[team];

                if(user.rankColor != "") {
                    rankColor = user.rankColor;
                }

                const userDivSchema = `
                    <img src="${await (userSkin)}" alt="${user.inGameName}">
                    <h5 class="name">${user.inGameName}</h5>
                    <p class="rank ${team}" style="background: ${rankColor}">${user.rank}</p>  
                `;

                userDiv.innerHTML = userDivSchema;
                group.appendChild(userDiv);
            }
        }
    } else if(locationPathname.includes("contact")) {
        contactForm.action = `https://formsubmit.co/${config.contactPage.email}`;
        discordOnlineUsers.innerHTML = await getDiscordOnlineUsers();
        inputWithLocationAfterSubmit.value = location.href;
    }
}

setDataFromConfigToHtml();

// ==================== НОВОСТИ ====================

// Загрузка новостей
async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    try {
        newsContainer.innerHTML = `
            <div class="news-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка новостей...</p>
            </div>
        `;

        // Пробуем несколько источников
        const news = await loadNewsFromLocalStorage() || await loadFallbackNews();
        
        displayNews(news, newsContainer);
        
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        showErrorState(newsContainer);
    }
}

// Загрузка из localStorage
async function loadNewsFromLocalStorage() {
    try {
        const news = JSON.parse(localStorage.getItem('websiteNews') || '[]');
        // Фильтруем только опубликованные и сортируем по дате
        return news
            .filter(item => item.status === 'published')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3);
    } catch (error) {
        console.log('Ошибка чтения localStorage:', error);
        return null;
    }
}

// Резервные новости
async function loadFallbackNews() {
    return [
        {
            id: 1,
            title: "Добро пожаловать на Federal League!",
            excerpt: "Сервер открыт для всех желающих. Присоединяйтесь к нам и начните создавать свою империю!",
            content: "<p>Мы рады приветствовать вас на нашем политическом Minecraft сервере! Здесь вы можете:</p><ul><li>Создавать свои государства</li><li>Участвовать в политической системе</li><li>Участвовать в войнах и дипломатии</li><li>Развивать экономику</li></ul><p>Присоединяйтесь к нам!</p>",
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            status: "published"
        }
    ];
}

// Отображение новостей
function displayNews(news, container) {
    if (!news || news.length === 0) {
        container.innerHTML = `
            <div class="news-empty">
                <i class="fas fa-newspaper"></i>
                <p>Пока нет новостей</p>
                <small>Будьте первым, кто добавит новость!</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = news.map(item => `
        <div class="news-item" data-news-id="${item.id}">
            <div class="news-image">
                <img src="${item.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}" 
                     alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f'">
                <div class="news-date">
                    <span class="day">${formatDate(item.date).day}</span>
                    <span class="month">${formatDate(item.date).month}</span>
                </div>
            </div>
            <div class="news-content">
                <h3 class="news-title">${item.title}</h3>
                <p class="news-excerpt">${item.excerpt}</p>
                <button class="news-read-btn" data-news-id="${item.id}">
                    Читать далее <i class="fas fa-arrow-right"></i>
                </button>
                
                <div class="news-full-content" style="display: none;">
                    ${item.content || item.excerpt}
                </div>
            </div>
        </div>
    `).join('');
    
    // Добавляем обработчики событий
    attachNewsEventListeners();
}

// Форматирование даты
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('ru', { month: 'short' });
        return { day, month };
    } catch (error) {
        const today = new Date();
        return { 
            day: today.getDate().toString().padStart(2, '0'), 
            month: today.toLocaleString('ru', { month: 'short' }) 
        };
    }
}

// Показ состояния ошибки
function showErrorState(container) {
    container.innerHTML = `
        <div class="news-empty">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Не удалось загрузить новости</p>
            <button onclick="loadNews()" class="btn-secondary" style="margin-top: 15px;">
                <i class="fas fa-sync-alt"></i> Попробовать снова
            </button>
        </div>
    `;
}

// Загрузка всех новостей
function loadAllNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    try {
        const allNews = JSON.parse(localStorage.getItem('websiteNews') || '[]');
        const publishedNews = allNews
            .filter(item => item.status === 'published')
            .sort((a, b) => b.timestamp - a.timestamp);
        
        displayNews(publishedNews, newsContainer);
        
        // Прячем кнопку "Смотреть все"
        document.querySelector('.news-actions').style.display = 'none';
        
    } catch (error) {
        console.error('Ошибка загрузки всех новостей:', error);
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', function() {
    // Существующий код...
    
    // Загружаем новости
    loadNews();
    
    // Обновляем каждые 2 минуты
    setInterval(loadNews, 2 * 60 * 1000);
});

// Добавьте эту функцию если её нет
function attachNewsEventListeners() {
    // Обработчики для кнопок "Читать далее"
    document.querySelectorAll('.news-read-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const newsItem = this.closest('.news-item');
            if (window.openNewsModal) {
                window.openNewsModal(newsItem);
            }
        });
    });
    
    // Клик по всей карточке новости
    document.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.news-read-btn')) {
                const newsItem = this;
                if (window.openNewsModal) {
                    window.openNewsModal(newsItem);
                }
            }
        });
    });
}

// ==================== СИСТЕМА ПОЛЬЗОВАТЕЛЕЙ ====================

// Проверка авторизации
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    return !!(token && userData.id);
}

// Получение данных текущего пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('userData') || '{}');
}

// Обновление интерфейса в зависимости от авторизации
function updateUIForAuth() {
    const isAuthenticated = checkAuth();
    const user = getCurrentUser();
    
    // Обновляем навбар
    const accountLink = document.querySelector('a[href="account.html"]');
    if (accountLink) {
        if (isAuthenticated) {
            accountLink.innerHTML = '<i class="fas fa-user"></i> Кабинет';
            accountLink.style.color = 'var(--main-color)';
        } else {
            accountLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
            accountLink.style.color = 'var(--description-color)';
        }
    }
    
    // Показываем/скрываем админ-ссылку
    const adminLink = document.querySelector('a[href="admin.html"]');
    if (adminLink && user.role && ['admin', 'superadmin'].includes(user.role)) {
        adminLink.style.display = 'block';
    } else if (adminLink) {
        adminLink.style.display = 'none';
    }
}

// Регистрация пользователя
async function registerUser(username, email, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        throw error;
    }
}

// Авторизация пользователя
async function loginUser(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            return data;
        } else {
            throw new Error('Ошибка авторизации');
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        throw error;
    }
}

// Выход из системы
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    updateUIForAuth();
    window.location.href = 'index.html';
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', function() {
    // Обновляем интерфейс при загрузке
    updateUIForAuth();
    
    // Добавляем обработчик для выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Проверяем права доступа для админ-панели
    const user = getCurrentUser();
    if (user.role && ['admin', 'superadmin'].includes(user.role)) {
        // Добавляем ссылку на админ-панель
        const navbar = document.querySelector('.navbar .links');
        if (navbar) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'link';
            adminLink.innerHTML = '<i class="fas fa-cog"></i> Админка';
            adminLink.style.color = 'var(--main-color)';
            navbar.appendChild(adminLink);
        }
    }
});