 
let currentCategory = 'all';
let currentPage = 1;

// 1. Функция создания HTML-кода карточки
function createCardHTML(game) {
    // Превращаем массив категорий в классы: ["puzzle", "action"] -> "category-puzzle category-action"
    const catClasses = game.categories.map(c => 'category-' + c).join(' ');
    
    return `
        <a href="${game.link}" class="game-card ${catClasses}">
            <img src="${game.image}" alt="${game.title}">
            <h3>${game.title}</h3>
        </a>
    `;
}

// 2. Прокрутка категорий
function scrollSlider(direction) {
    const slider = document.getElementById('cat-menu');
    slider.scrollBy({ left: direction * 300, behavior: 'smooth' });
}

// 3. Расчет количества игр (3 ряда)
function getGamesPerPage() {
    const grid = document.getElementById('games-grid');
    if (!grid) return 9;
    const columns = Math.floor(grid.offsetWidth / 165);
    return Math.max(columns, 1) * 3;
}

// 4. Фильтрация
function filterGames(category) {
    currentCategory = category;
    currentPage = 1;
    
    document.querySelectorAll('.cat-item').forEach(item => {
        item.style.borderColor = "#870d7b"; 
        if(item.innerText.toLowerCase().includes(category.toLowerCase())) {
             item.style.borderColor = "#ff00ff"; 
        }
    });
    updateGallery();
}

// 5. ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ
function updateGallery() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    // Фильтруем данные из нашего хранилища gamesData.js
    let filtered = allGamesData.filter(game => {
        if (currentCategory === 'all') return true;
        if (currentCategory === 'best') {
            const likes = parseInt(localStorage.getItem('likes_' + game.title)) || 0;
            return likes > 0;
        }
        return game.categories.includes(currentCategory);
    });

    // Сортировка для категории Best
    if (currentCategory === 'best') {
        filtered.sort((a, b) => {
            const likesA = parseInt(localStorage.getItem('likes_' + a.title)) || 0;
            const likesB = parseInt(localStorage.getItem('likes_' + b.title)) || 0;
            return likesB - likesA;
        });
    }

    // Пагинация
    const gamesLimit = getGamesPerPage();
    const totalPages = Math.ceil(filtered.length / gamesLimit);
    const startIndex = (currentPage - 1) * gamesLimit;
    const cardsToShow = filtered.slice(startIndex, startIndex + gamesLimit);

    // ВСТАВЛЯЕМ КАРТОЧКИ В ГРИД
    grid.innerHTML = cardsToShow.map(game => createCardHTML(game)).join('');

    renderPagination(totalPages);
}

// 6. Пагинация
function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (!container) return;
    container.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.onclick = () => {
            currentPage = i;
            updateGallery();
            document.getElementById('games-grid').scrollIntoView({ behavior: 'smooth' });
        };
        container.appendChild(btn);
    }
}

 
// gameData.js
function gameDataDraw(){
    allGamesData;
}
gameDataDraw();

// Слушатели
document.addEventListener('DOMContentLoaded', updateGallery);
window.addEventListener('resize', updateGallery);





 