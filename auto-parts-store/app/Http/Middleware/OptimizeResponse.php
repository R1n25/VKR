<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class OptimizeResponse
{
    /**
     * Обрабатывает запрос и оптимизирует ответ.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Пропускаем оптимизацию для авторизованных пользователей
        if (Auth::check()) {
            return $next($request);
        }
        
        // Проверяем, не POST/PUT/DELETE запросы
        if (!$request->isMethod('GET')) {
            return $next($request);
        }
        
        // Определяем ключ кеша на основе URL
        $cacheKey = 'page_cache_' . sha1($request->fullUrl());
        
        // Проверяем кеш (только для страниц без динамического контента)
        if (!$request->ajax() && !$request->wantsJson() && !strpos($request->path(), 'api/')) {
            if (Cache::has($cacheKey)) {
                return response(Cache::get($cacheKey));
            }
        }

        $response = $next($request);
        
        // Не кешируем ответы с ошибками
        if ($response->isSuccessful()) {
            // Кешируем ответ на 5 минут (только для страниц без динамического контента)
            if (!$request->ajax() && !$request->wantsJson() && !strpos($request->path(), 'api/')) {
                Cache::put($cacheKey, $response->getContent(), 300);
            }
            
            // Оптимизируем ответ
            $this->optimizeResponse($response);
        }
        
        return $response;
    }
    
    /**
     * Оптимизирует ответ, удаляя лишние пробелы и комментарии из HTML.
     *
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @return void
     */
    protected function optimizeResponse(Response $response): void
    {
        if (!$response->headers->has('Content-Type') || 
            strpos($response->headers->get('Content-Type'), 'text/html') === false) {
            return;
        }

        $content = $response->getContent();
        
        // Не оптимизируем, если содержимое не HTML
        if (!$content || strpos($content, '<html') === false) {
            return;
        }
        
        // Простая минификация HTML
        $replace = [
            '/\>[^\S ]+/s'  => '>',     // удаляем пробелы после тегов
            '/[^\S ]+\</s'  => '<',     // удаляем пробелы перед тегами
            '/(\s)+/s'      => '\\1',   // сжимаем пробелы
            '/<!--(.|\s)*?-->/' => ''   // удаляем HTML комментарии
        ];
        
        $content = preg_replace(array_keys($replace), array_values($replace), $content);
        $response->setContent($content);
    }
} 