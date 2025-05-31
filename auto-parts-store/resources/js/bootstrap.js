import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Настройка CSRF-защиты для всех AJAX-запросов
const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// В дев режиме, добавляем удобную отладку запросов
if (process.env.NODE_ENV === 'development') {
    window.axios.interceptors.request.use(config => {
        console.log('Request:', config);
        return config;
    }, error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    });

    window.axios.interceptors.response.use(response => {
        console.log('Response:', response);
        return response;
    }, error => {
        console.error('Response error:', error.response || error);
        return Promise.reject(error);
    });
}
