/**
 * Service Worker для блокировки нежелательных сетевых запросов
 */

// Список паттернов для блокировки
const BLOCKED_PATTERNS = [
  /ca\.onHtml/i,
  /from\?get/i,
  /pageHide/i,
  /\?tm=202[0-9]/i,
  /googletagmanager\.com/i,
  /google-analytics\.com/i
];

// Устанавливаем service worker
self.addEventListener('install', (event) => {
  // Принудительно активируем текущую версию service worker
  event.waitUntil(self.skipWaiting());
});

// Активируем service worker
self.addEventListener('activate', (event) => {
  // Захватываем управление страницей сразу после активации
  event.waitUntil(self.clients.claim());
});

// Обрабатываем сетевые запросы
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Проверяем, соответствует ли URL одному из заблокированных паттернов
  const shouldBlock = BLOCKED_PATTERNS.some(pattern => pattern.test(url));
  
  if (shouldBlock) {
    // Логируем заблокированный запрос (в реальном проекте можно убрать)
    console.debug('[Service Worker] Заблокирован запрос:', url);
    
    // Возвращаем пустой ответ вместо выполнения запроса
    event.respondWith(new Response('', { 
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/plain' }
    }));
  }
}); 