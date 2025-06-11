import _ from 'lodash';
import axios from 'axios';

window._ = _;

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end.
 */

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Глобальные флаги
window.isLoggingOut = false;

// Добавляем перехватчик ответов для обработки ошибок авторизации
axios.interceptors.response.use(
    response => response,
    error => {
        // Проверяем, не является ли ошибка истекшей сессией (401)
        if (error.response && error.response.status === 401) {
            // Если мы уже в процессе выхода, не делаем ничего
            if (window.isLoggingOut) {
                return Promise.reject(error);
            }
            
            // Устанавливаем флаг, что выполняется выход
            window.isLoggingOut = true;
            
            // Перенаправляем сразу на страницу входа
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     forceTLS: true
// });
