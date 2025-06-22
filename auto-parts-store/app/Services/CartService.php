<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\SparePart;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CartService
{
    /**
     * Получить текущую корзину пользователя
     *
     * @return Cart
     */
    public function getCart()
    {
        try {
            // Получаем текущий идентификатор сессии
            $sessionId = Session::getId();
            
            // Проверяем авторизованного пользователя
            if (Auth::check()) {
                $user = Auth::user();
                
                // Ищем активную корзину пользователя
                $cart = Cart::where('user_id', $user->id)
                    ->where('is_active', true)
                    ->first();
                    
                // Если корзины нет, создаем новую
                if (!$cart) {
                    $cart = Cart::create([
                        'user_id' => $user->id,
                        'session_id' => null,
                        'is_active' => true,
                        'total_price' => 0
                    ]);
                }
                
                return $cart;
            } else {
                // Для гостя используем корзину, привязанную к сессии
                $cart = $this->getSessionCart($sessionId);
                return $cart;
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Ошибка при получении корзины: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => auth()->id(),
                'session_id' => Session::getId()
            ]);
            
            // Возвращаем новую пустую корзину в случае ошибки
            return new Cart([
                'user_id' => auth()->id(),
                'session_id' => Session::getId(),
                'is_active' => true,
                'total_price' => 0
            ]);
        }
    }

    /**
     * Получить корзину авторизованного пользователя
     *
     * @param User $user
     * @param string $sessionId
     * @return Cart
     */
    private function getUserCart(User $user, $sessionId)
    {
        // Ищем активную корзину пользователя только по user_id
        $cart = Cart::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if (!$cart) {
            // Если корзины пользователя нет, пытаемся найти корзину по текущей сессии
            $sessionCart = Cart::where('session_id', $sessionId)
                ->where('is_active', true)
                ->whereNull('user_id')
                ->first();
            
            if ($sessionCart) {
                // Если корзина сессии существует, привязываем её к пользователю и отвязываем от сессии
                $sessionCart->user_id = $user->id;
                $sessionCart->session_id = null;
                $sessionCart->save();
                return $sessionCart;
            }
            
            // Если ни корзины пользователя, ни корзины сессии нет, создаем новую
            $cart = Cart::create([
                'user_id' => $user->id,
                'session_id' => null, // Не привязываем к сессии, только к пользователю
                'is_active' => true
            ]);
        }

        return $cart;
    }

    /**
     * Получить корзину для гостя по session_id
     *
     * @param string $sessionId
     * @return Cart
     */
    private function getSessionCart($sessionId)
    {
        // Ищем корзину по текущей сессии
        $cart = Cart::where('session_id', $sessionId)
            ->where('is_active', true)
            ->whereNull('user_id')
            ->first();

        if (!$cart) {
            // Если корзины нет, создаем новую
            $cart = Cart::create([
                'session_id' => $sessionId,
                'is_active' => true
            ]);
        }

        return $cart;
    }

    /**
     * Добавить товар в корзину
     *
     * @param int $sparePartId
     * @param int $quantity
     * @return CartItem
     */
    public function addToCart($sparePartId, $quantity = 1)
    {
        $cart = $this->getCart();
        $sparePart = SparePart::findOrFail($sparePartId);
        
        // Проверяем, есть ли уже такой товар в корзине
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('spare_part_id', $sparePartId)
            ->first();

        // Если товар в корзине есть, увеличиваем количество
        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            // Если товара нет, создаем новый элемент корзины
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'spare_part_id' => $sparePartId,
                'quantity' => $quantity,
                'price' => $sparePart->price // Используем обычную цену без наценки
            ]);
        }

        // Пересчитываем общую стоимость корзины
        $cart->calculateTotalPrice();

        return $cartItem;
    }

    /**
     * Удалить товар из корзины
     *
     * @param int $cartItemId
     * @return bool
     */
    public function removeFromCart($cartItemId)
    {
        $cart = $this->getCart();
        $cartItem = CartItem::where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->first();

        if ($cartItem) {
            $cartItem->delete();
            $cart->calculateTotalPrice();
            return true;
        }

        return false;
    }

    /**
     * Обновить количество товара в корзине
     *
     * @param int $cartItemId
     * @param int $quantity
     * @return CartItem|null
     */
    public function updateCartItemQuantity($cartItemId, $quantity)
    {
        $cart = $this->getCart();
        $cartItem = CartItem::where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->first();

        if ($cartItem) {
            if ($quantity <= 0) {
                $cartItem->delete();
                $cart->calculateTotalPrice();
                return null;
            }
            
            $cartItem->quantity = $quantity;
            $cartItem->save();
            $cart->calculateTotalPrice();
            return $cartItem;
        }

        return null;
    }

    /**
     * Очистить корзину
     *
     * @return bool
     */
    public function clearCart()
    {
        $cart = $this->getCart();
        CartItem::where('cart_id', $cart->id)->delete();
        $cart->total_price = 0;
        $cart->save();
        
        return true;
    }

    /**
     * Получить количество товаров в корзине
     *
     * @return int
     */
    public function getCartItemsCount()
    {
        $cart = $this->getCart();
        return CartItem::where('cart_id', $cart->id)->sum('quantity');
    }

    /**
     * Получить товары в корзине с данными о запчастях
     *
     * @return array
     */
    public function getCartWithItems()
    {
        try {
            $cart = $this->getCart();
            $cartItems = CartItem::with('sparePart')
                ->where('cart_id', $cart->id)
                ->get();

            return [
                'cart' => $cart,
                'items' => $cartItems
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Ошибка при получении данных корзины: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => auth()->id(),
                'session_id' => session()->getId()
            ]);
            
            // Возвращаем пустую корзину в случае ошибки
            return [
                'cart' => new Cart(),
                'items' => collect([])
            ];
        }
    }

    /**
     * Перенести корзину от неавторизованного пользователя к авторизованному
     *
     * @param User $user
     * @return Cart
     */
    public function mergeGuestCartWithUserCart(User $user)
    {
        $sessionId = Session::getId();
        
        // Деактивируем все старые корзины пользователя
        Cart::where('user_id', $user->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);
        
        // Ищем корзину гостя по текущему ID сессии
        $guestCart = Cart::where('session_id', $sessionId)
            ->where('user_id', null)
            ->where('is_active', true)
            ->first();

        // Создаем новую корзину для пользователя
        $userCart = Cart::create([
            'user_id' => $user->id,
            'session_id' => null,
            'is_active' => true,
            'total_price' => 0
        ]);

        // Если корзина гостя найдена, перемещаем товары из неё
        if ($guestCart) {
            // Перемещаем товары из корзины гостя в корзину пользователя
            $guestCartItems = CartItem::where('cart_id', $guestCart->id)->get();

            foreach ($guestCartItems as $guestItem) {
                // Проверяем, есть ли такой товар уже в корзине пользователя
                $userItem = CartItem::where('cart_id', $userCart->id)
                    ->where('spare_part_id', $guestItem->spare_part_id)
                    ->first();

                if ($userItem) {
                    // Если товар уже есть, увеличиваем количество
                    $userItem->quantity += $guestItem->quantity;
                    $userItem->save();
                    // Удаляем товар из корзины гостя
                    $guestItem->delete();
                } else {
                    // Если товара нет, просто перемещаем его в корзину пользователя
                    $guestItem->cart_id = $userCart->id;
                    $guestItem->save();
                }
            }

            // Пересчитываем общую стоимость корзины пользователя
            $userCart->calculateTotalPrice();

            // Деактивируем корзину гостя, чтобы она не использовалась в дальнейшем
            $guestCart->is_active = false;
            $guestCart->save();
        }

        return $userCart;
    }

    /**
     * Получить корзину по ID пользователя
     *
     * @param int $userId
     * @return Cart
     */
    public function getCartByUserId($userId)
    {
        // Проверяем, существует ли активная корзина для этого пользователя
        $cart = Cart::where('user_id', $userId)
            ->where('is_active', true)
            ->first();
        
        // Если корзины нет, создаем новую
        if (!$cart) {
            $cart = Cart::create([
                'user_id' => $userId,
                'session_id' => null,
                'is_active' => true
            ]);
        }
        
        return $cart;
    }
} 