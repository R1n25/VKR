/**
 * Скрипт для обхода CSRF-защиты в Laravel
 */
(function() {
    // Создаем фейковый CSRF-токен, который всегда будет действительным
    const fakeCsrfToken = 'csrf-disabled';
    
    // Перехватываем получение CSRF-токена из meta-тегов
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
        if (selector === 'meta[name="csrf-token"]') {
            // Создаем фейковый мета-тег с CSRF-токеном
            const fakeMetaTag = document.createElement('meta');
            fakeMetaTag.setAttribute('name', 'csrf-token');
            fakeMetaTag.setAttribute('content', fakeCsrfToken);
            
            // Позволяем получать атрибуты
            fakeMetaTag.getAttribute = function(attr) {
                if (attr === 'content') {
                    return fakeCsrfToken;
                }
                return null;
            };
            
            return fakeMetaTag;
        }
        return originalQuerySelector.apply(document, arguments);
    };
    
    // Перехватываем получение всех CSRF-токенов
    const originalQuerySelectorAll = document.querySelectorAll;
    document.querySelectorAll = function(selector) {
        if (selector === 'meta[name="csrf-token"]') {
            // Создаем фейковый NodeList с мета-тегом
            const fakeMetaTag = document.createElement('meta');
            fakeMetaTag.setAttribute('name', 'csrf-token');
            fakeMetaTag.setAttribute('content', fakeCsrfToken);
            return [fakeMetaTag];
        }
        return originalQuerySelectorAll.apply(document, arguments);
    };
    
    // Перехватываем XHR-запросы для добавления CSRF-токена
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 1) {
                this.setRequestHeader('X-CSRF-TOKEN', fakeCsrfToken);
            }
        });
        return originalXhrOpen.apply(this, arguments);
    };
    
    // Перехватываем fetch-запросы
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        if (!options.headers) {
            options.headers = {};
        }
        
        if (options.headers instanceof Headers) {
            options.headers.set('X-CSRF-TOKEN', fakeCsrfToken);
        } else {
            options.headers['X-CSRF-TOKEN'] = fakeCsrfToken;
        }
        
        return originalFetch.call(this, url, options);
    };
    
    // Также подменяем и axios, если он используется
    if (window.axios) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = fakeCsrfToken;
    }
    
    // Перехватываем cookie для CSRF-токена
    Object.defineProperty(document, 'cookie', {
        get: function() {
            return document._cookies || '';
        },
        set: function(value) {
            // Если устанавливается CSRF-токен, модифицируем его
            if (value.includes('XSRF-TOKEN=')) {
                value = value.replace(/XSRF-TOKEN=[^;]+/, 'XSRF-TOKEN=' + fakeCsrfToken);
            }
            document._cookies = document._cookies ? document._cookies + '; ' + value : value;
        }
    });
    
    // Устанавливаем cookie с фейковым CSRF-токеном
    document.cookie = 'XSRF-TOKEN=' + fakeCsrfToken + '; path=/';
    
    console.log('CSRF protection disabled');
})(); 