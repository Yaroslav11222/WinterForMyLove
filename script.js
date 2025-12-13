// script.js

// ЭЛЕМЕНТЫ DOM
const calendarContainer = document.getElementById('calendar');
const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');
const dailySurpriseWrapper = document.getElementById('dailySurprise');
const dailyEmoji = document.getElementById('dailyEmoji');
const dailyText = document.getElementById('dailyText');
const pinkCurtain = document.getElementById('pink-curtain'); // Наш экран загрузки

// --- ГЛОБАЛЬНАЯ ПЕРЕМЕННАЯ ТЕКУЩЕГО ДНЯ ---
let globalCurrentDay = new Date().getDate();
let globalIsDecember = new Date().getMonth() === CONFIG.MONTH;

// --- ЗАЩИТА: ПОЛУЧЕНИЕ ВРЕМЕНИ ИЗ ИНТЕРНЕТА ---
async function fetchServerTime() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Kyiv');
        if (response.ok) {
            const data = await response.json();
            const serverDate = new Date(data.datetime);
            globalCurrentDay = serverDate.getDate();
            globalIsDecember = serverDate.getMonth() === CONFIG.MONTH;
            console.log("Время (Server):", serverDate);
            return true;
        }
    } catch (e) {
        console.log("Время (Local): Интернет недоступен.");
    }
    return false;
}

// --- ЛОГИКА ЭМОДЗИ ---
function setupDailyEmoji() {
    const update = dailyUpdates[globalCurrentDay] || dailyUpdates['default'];
    dailyEmoji.innerText = update.emoji;
    dailyText.innerText = update.text;
    const animationClass = `anim-${update.anim || 'fade-zoom'}`;
    dailySurpriseWrapper.classList.add(animationClass);
    dailyEmoji.onclick = () => {
        dailySurpriseWrapper.classList.add('revealed');
    };
}

// --- РЕНДЕР КАЛЕНДАРЯ ---
function renderCalendar() {
    calendarContainer.innerHTML = ''; 
    let openedDays = JSON.parse(localStorage.getItem('adventOpenedDays')) || [];

    for (let i = CONFIG.START_DAY; i <= CONFIG.END_DAY; i++) {
        const card = document.createElement('div');
        card.classList.add('day-card');
        card.innerText = i;
        
        const isUnlocked = CONFIG.IS_DEV_MODE || (globalIsDecember && globalCurrentDay >= i);

        if (openedDays.includes(i)) card.classList.add('opened');

        if (isUnlocked) {
            card.onclick = () => {
                openModal(i);
                if (!openedDays.includes(i)) {
                    openedDays.push(i);
                    localStorage.setItem('adventOpenedDays', JSON.stringify(openedDays));
                    card.classList.add('opened'); 
                }
            };
        } else {
            card.classList.add('locked');
            card.onclick = () => {
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 500);
                const msgs = ["Люблю тебя, но пока рано! 💟", "Зайка, еще рано! 💕", "Солнышко, еще совсем чуть-чуть! 💝"];
                alert(msgs[Math.floor(Math.random() * msgs.length)]);
            };
        }
        calendarContainer.appendChild(card);
    }
}

// --- ФУНКЦИЯ ДЛЯ СКРЫТИЯ ЗАГРУЗКИ ---
function hideLoadingScreen() {
    if (pinkCurtain) {
        pinkCurtain.style.opacity = '0';
        // Удаляем элемент через 1 секунду (время анимации css)
        setTimeout(() => {
            pinkCurtain.remove();
        }, 300);
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
async function init() {
    // 1. Ждем проверку времени (логика)
    await fetchServerTime();
    
    // 2. Строим интерфейс
    setupDailyEmoji();
    renderCalendar();

    // 3. Проверяем, загрузились ли картинки/стили
    if (document.readyState === 'complete') {
        // Если уже всё загрузилось пока мы ждали время -> скрываем сразу
        hideLoadingScreen();
    } else {
        // Если нет -> ждем события load
        window.addEventListener('load', hideLoadingScreen);
    }
}

// Запуск
init();


// --- МОДАЛЬНОЕ ОКНО ---
function openModal(day) {
    const content = contents[day] || { type: 'text', text: 'Подарок загружается...' };
    let mediaHtml = '';
    if (content.type === 'image') {
        mediaHtml = `<img src="${content.url}" class="modal-media" alt="Day ${day}">`;
    } else if (content.type === 'video') {
        mediaHtml = `<video class="modal-media" controls autoplay><source src="${content.url}" type="video/mp4"></video>`;
    }
    modalBody.innerHTML = `${mediaHtml}<p style="font-size: 1.2rem; margin-top: 15px;">${content.text}</p>`;
    overlay.classList.add('visible');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('visible'), 10);
}

function closeModal() {
    overlay.classList.remove('visible');
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 500);
}

closeBtn.onclick = closeModal;
overlay.onclick = closeModal;

// --- СНЕГ ---
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    const startLeft = Math.random() * window.innerWidth;
    const fallDuration = Math.random() * 5 + 5; 
    const swayDuration = Math.random() * 2 + 3; 
    const size = Math.random() * 7 + 5; 
    const opacity = Math.random() * 0.3 + 0.7;
    snowflake.style.left = startLeft + 'px';
    snowflake.style.width = size + 'px';
    snowflake.style.height = size + 'px';
    snowflake.style.opacity = opacity;
    snowflake.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
    snowflake.style.animationDelay = `0s, -${Math.random() * 5}s`;
    document.body.appendChild(snowflake);
    setTimeout(() => { snowflake.remove(); }, fallDuration * 1000);
}
setInterval(createSnowflake, 500);