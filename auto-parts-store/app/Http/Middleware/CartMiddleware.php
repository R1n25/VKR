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
        // Если пользователь вошел в систему
        if (Auth::check()) {
            $user = Auth::user();
            
            // Проверяем наличие активной корзины для пользователя
            $userCart = \App\Models\Cart::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();
            
            // Если у пользователя нет активной корзины, создаем новую
            if (!$userCart) {
                \App\Models\Cart::create([
                    'user_id' => $user->id,
                    'session_id' => null,
                    'is_active' => true,
                    'total_price' => 0
                ]);
            }
        }
        // Для неавторизованных пользователей ничего не делаем

        return $next($request);
    }
} 