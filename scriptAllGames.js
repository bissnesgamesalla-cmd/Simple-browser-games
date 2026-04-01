const btn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn'); // ИЗМЕНЕНО
const loader = document.getElementById('loader');
const overlay = document.getElementById('overlay');
const frame = document.getElementById('gameFrame');
const body = document.getElementById('pageBody');
const container = document.getElementById('game-container'); // ИЗМЕНЕНО

 
function startGame() {
    // 1. Сначала скрываем элементы интерфейса (твой старый код)
    btn.style.display = 'none';
    loader.style.display = 'block';

    const frame = document.getElementById('gameFrame');
    const overlay = document.getElementById('overlay');
    const fsBtn = document.getElementById('fsBtn');

    frame.src = frame.getAttribute('data-src');

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.classList.add('is-playing'); 
            
            // Показываем кнопку фуллскрина на ПК
            if (fsBtn) {
                fsBtn.style.opacity = '1';
                fsBtn.style.pointerEvents = 'auto';
            }
        }, 500);
    }, 1200);

    // --- НОВАЯ ЛОГИКА ---
    
    // Проверяем: узкое ли окно (портрет) И является ли устройство мобильным (есть тач)
    /*const isPortrait = window.innerWidth < window.innerHeight;
    const isGorezont = window.innerHeight < 450;*/
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Запускаем фуллскрин ТОЛЬКО если это узкое окно И это реально телефон/планшет
    /*if (isPortrait && isMobile || isGorezont && isMobile) {*/
    if (isMobile) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    }
    
    
    // ---------------------

    console.log("Игра запущена. Режим ПК: " + !isMobile);
}



/* ИЗМЕНЕНО: Функция возврата из игры в описание */
function exitToDescription() {
    // Если был включен фуллскрин на ПК — выходим из него
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
            
    body.classList.remove('is-playing');
    frame.src = "about:blank"; // Останавливаем игру
            
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    btn.style.display = 'inline-block';
    loader.style.display = 'none';
            
    // Прячем кнопку фуллскрина
    fsBtn.style.opacity = '0';
    fsBtn.style.pointerEvents = 'none';
}

/* ИЗМЕНЕНО: Новая функция для кнопки-квадратика (ПК) */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.log("Error attempting to enable fullscreen:", err.message);
        });
    } else {
        document.exitFullscreen();
    }
}


// 1. Настройка Firebase (Убедись, что эти данные из твоего Firebase Console!)
const firebaseConfig = {
    databaseURL: "https://ВАШ-ПРОЕКТ.firebaseio.com" // ЗАМЕНИ НА СВОЙ URL
};

// Инициализация (делаем проверку, чтобы не инициализировать дважды)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Убедись, что переменная gameID определена (например, из названия папки или заголовка)
const gameID = window.location.pathname.split('/').pop().replace('.html', ''); 

// 2. СЛУШАЕМ БАЗУ ДАННЫХ (Обновляет UI для всех пользователей сразу)
database.ref('game_likes/' + gameID).on('value', (snapshot) => {
    const serverLikes = snapshot.val() || 0;
    const likeCountElement = document.getElementById('likeCount');
    if (likeCountElement) {
        likeCountElement.innerText = serverLikes;
    }
});

// 3. ОБНОВЛЕНИЕ СОСТОЯНИЯ КНОПКИ (Только для текущего юзера: нажал он или нет)
function updateButtonState() {
    const isLiked = localStorage.getItem('isLiked_' + gameID) === 'true';
    const likeBtn = document.getElementById('likeBtn');
    const likeIcon = document.getElementById('likeIcon');
    
    if (isLiked) {
        likeBtn.classList.add('active');
        likeIcon.innerText = '❤️';
    } else {
        likeBtn.classList.remove('active');
        likeIcon.innerText = '🤍';
    }
}

// 4. ГЛАВНАЯ ФУНКЦИЯ ЛАЙКА
function handleLike() {
    let isLiked = localStorage.getItem('isLiked_' + gameID) === 'true';
    const likeRef = database.ref('game_likes/' + gameID);

    if (!isLiked) {
        // ПЛЮС ОДИН в облаке
        likeRef.transaction((current) => (current || 0) + 1);
        localStorage.setItem('isLiked_' + gameID, 'true');
    } else {
        // МИНУС ОДИН в облаке
        likeRef.transaction((current) => (current > 0 ? current - 1 : 0));
        localStorage.setItem('isLiked_' + gameID, 'false');
    }
    
    updateButtonState(); // Сразу меняем иконку (🤍/❤️)
}

// Запускаем проверку кнопки при загрузке
document.addEventListener('DOMContentLoaded', updateButtonState);