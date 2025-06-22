<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandleRequests
{
    /**
     * Обрабатывает входящий запрос.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Для AJAX-запросов автоматически устанавливаем заголовок Accept в application/json
        if ($request->ajax()) {
            $request->headers->set('Accept', 'application/json');
        }

        return $next($request);
    }
} 