<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\CartService;

class CartMiddleware
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Если пользователь вошел в систему, выполняем объединение корзин
        if (Auth::check()) {
            // Получаем текущего пользователя
            $user = Auth::user();
            
            // Объединяем корзину гостя с корзиной пользователя
            // и получаем персональную корзину пользователя
            $this->cartService->mergeGuestCartWithUserCart($user);
        }

        return $next($request);
    }
} 