/**
 * Файл для отладки проблемы с поиском
 */

// Функция для добавления отладочной информации на страницу
function addDebugInfo() {
    // Проверяем, находимся ли мы на странице поиска
    if (window.location.pathname === '/search') {
        console.log('Страница поиска загружена');
        
        // Проверяем, существует ли уже контейнер для отладки
        if (document.getElementById('debug-container')) {
            console.log('Отладочный контейнер уже существует, пропускаем создание');
            return;
        }
        
        // Создаем контейнер для отладочной информации
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debug-container';
        debugContainer.style.position = 'fixed';
        debugContainer.style.bottom = '10px';
        debugContainer.style.right = '10px';
        debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugContainer.style.color = 'white';
        debugContainer.style.padding = '10px';
        debugContainer.style.borderRadius = '5px';
        debugContainer.style.zIndex = '9999';
        debugContainer.style.maxWidth = '500px';
        debugContainer.style.maxHeight = '300px';
        debugContainer.style.overflow = 'auto';
        
        // Получаем данные из window.__INITIAL_STATE__
        let initialState = null;
        try {
            initialState = window.__INITIAL_STATE__ || window.Inertia?.page?.props;
        } catch (e) {
            console.error('Ошибка при получении initialState:', e);
        }
        
        // Добавляем информацию о props
        if (initialState) {
            const propsInfo = document.createElement('div');
            propsInfo.innerHTML = `
                <h3>Данные страницы:</h3>
                <p>searchQuery: ${initialState.searchQuery || 'не задан'}</p>
                <p>spareParts: ${Array.isArray(initialState.spareParts) ? initialState.spareParts.length + ' элементов' : 'не массив'}</p>
            `;
            debugContainer.appendChild(propsInfo);
            
            // Если есть spareParts, показываем первый элемент
            if (Array.isArray(initialState.spareParts) && initialState.spareParts.length > 0) {
                const firstItem = initialState.spareParts[0];
                const itemInfo = document.createElement('div');
                itemInfo.innerHTML = `
                    <h4>Первый элемент:</h4>
                    <p>ID: ${firstItem.id}</p>
                    <p>Название: ${firstItem.name}</p>
                    <p>Артикул: ${firstItem.part_number}</p>
                    <p>Цена: ${firstItem.price}</p>
                `;
                debugContainer.appendChild(itemInfo);
            }
            
            // Добавляем кнопку для отображения результатов поиска
            const showResultsButton = document.createElement('button');
            showResultsButton.textContent = 'Показать результаты';
            showResultsButton.style.backgroundColor = '#4CAF50';
            showResultsButton.style.border = 'none';
            showResultsButton.style.color = 'white';
            showResultsButton.style.padding = '10px';
            showResultsButton.style.borderRadius = '5px';
            showResultsButton.style.cursor = 'pointer';
            showResultsButton.style.marginTop = '10px';
            
            showResultsButton.addEventListener('click', function() {
                // Создаем простой контейнер для отображения результатов
                const resultsContainer = document.createElement('div');
                resultsContainer.style.position = 'fixed';
                resultsContainer.style.top = '50%';
                resultsContainer.style.left = '50%';
                resultsContainer.style.transform = 'translate(-50%, -50%)';
                resultsContainer.style.backgroundColor = 'white';
                resultsContainer.style.color = 'black';
                resultsContainer.style.padding = '20px';
                resultsContainer.style.borderRadius = '5px';
                resultsContainer.style.zIndex = '10000';
                resultsContainer.style.maxWidth = '80%';
                resultsContainer.style.maxHeight = '80%';
                resultsContainer.style.overflow = 'auto';
                resultsContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
                
                // Добавляем заголовок
                const title = document.createElement('h2');
                title.textContent = `Результаты поиска по запросу: ${initialState.searchQuery || 'не задан'}`;
                resultsContainer.appendChild(title);
                
                // Добавляем кнопку закрытия
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Закрыть';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.backgroundColor = '#f44336';
                closeButton.style.border = 'none';
                closeButton.style.color = 'white';
                closeButton.style.padding = '5px 10px';
                closeButton.style.borderRadius = '5px';
                closeButton.style.cursor = 'pointer';
                closeButton.addEventListener('click', function() {
                    document.body.removeChild(resultsContainer);
                });
                resultsContainer.appendChild(closeButton);
                
                // Добавляем результаты
                if (Array.isArray(initialState.spareParts) && initialState.spareParts.length > 0) {
                    const resultsList = document.createElement('div');
                    resultsList.style.marginTop = '20px';
                    
                    initialState.spareParts.forEach((part, index) => {
                        const partItem = document.createElement('div');
                        partItem.style.padding = '10px';
                        partItem.style.marginBottom = '10px';
                        partItem.style.border = '1px solid #ddd';
                        partItem.style.borderRadius = '5px';
                        
                        partItem.innerHTML = `
                            <h3>${part.name || 'Без названия'}</h3>
                            <p><strong>Артикул:</strong> ${part.part_number || 'Н/Д'}</p>
                            <p><strong>Производитель:</strong> ${part.manufacturer || 'Не указан'}</p>
                            <p><strong>Категория:</strong> ${part.category || 'Не указана'}</p>
                            <p><strong>Цена:</strong> ${part.price ? part.price + ' ₽' : '—'}</p>
                            <p><strong>Наличие:</strong> ${part.stock_quantity > 0 ? `В наличии (${part.stock_quantity})` : 'Нет в наличии'}</p>
                        `;
                        
                        resultsList.appendChild(partItem);
                    });
                    
                    resultsContainer.appendChild(resultsList);
                } else {
                    const noResults = document.createElement('p');
                    noResults.textContent = 'По вашему запросу ничего не найдено';
                    noResults.style.marginTop = '20px';
                    resultsContainer.appendChild(noResults);
                }
                
                document.body.appendChild(resultsContainer);
            });
            
            debugContainer.appendChild(showResultsButton);
        } else {
            const errorInfo = document.createElement('div');
            errorInfo.textContent = '';
            debugContainer.appendChild(errorInfo);
        }
        
        // Добавляем контейнер на страницу
        document.body.appendChild(debugContainer);
    }
}

// Запускаем функцию после загрузки страницы
if (document.readyState === 'complete') {
    addDebugInfo();
} else {
    window.addEventListener('load', addDebugInfo);
}

// Полезные отладочные функции для фронтенда

window.dd = function(...args) {
    console.log('DEBUG:', ...args);
};

// Сохранение CSRF-токена при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        localStorage.setItem('csrf_token', metaTag.getAttribute('content'));
    }
});

// Глобальная функция получения CSRF-токена для всего приложения
window.getCsrfToken = function() {
    // Пробуем получить из мета-тега
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag && metaTag.getAttribute('content')) {
        return metaTag.getAttribute('content');
    }
    
    // Пробуем получить из cookies (Laravel хранит токен в зашифрованном виде)
    let match = document.cookie.match(new RegExp('(^|;)\\s*XSRF-TOKEN\\s*=\\s*([^;]+)'));
    if (match) {
        // Laravel хранит токен в URL-закодированном виде
        return decodeURIComponent(match[2]);
    }
    
    // Пробуем получить из простого cookie csrf_token
    match = document.cookie.match(new RegExp('(^|;)\\s*csrf_token\\s*=\\s*([^;]+)'));
    if (match) {
        return match[2];
    }
    
    // Последняя попытка - получить из локального хранилища
    const storedToken = localStorage.getItem('csrf_token');
    if (storedToken) {
        return storedToken;
    }
    
    console.warn('CSRF токен не найден, запрос может быть отклонен сервером');
    return '';
}; 