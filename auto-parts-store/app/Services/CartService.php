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
            // Проверяем авторизованного пользователя
            if (Auth::check()) {
                $user = Auth::user();
                
                // Ищем ТОЛЬКО активную корзину пользователя по user_id
                $cart = Cart::where('user_id', $user->id)
                    ->where('is_active', true)
                    ->first();
                    
                // Если корзины нет, создаем новую
                if (!$cart) {
                    // Создаем новую корзину для пользователя
                    $cart = Cart::create([
                        'user_id' => $user->id,
                        'session_id' => null,
                        'is_active' => true,
                        'total_price' => 0
                    ]);
                }
                
                return $cart;
            } else {
                // Для неавторизованных пользователей возвращаем пустую корзину
                // Это не сохраняется в БД, а просто используется для отображения
                return new Cart([
                    'user_id' => null,
                    'session_id' => null,
                    'is_active' => true,
                    'total_price' => 0
                ]);
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
                'session_id' => null,
                'is_active' => true,
                'total_price' => 0
            ]);
        }
    }

    /**
     * Добавить товар в корзину
     *
     * @param int $sparePartId
     * @param int $quantity
     * @return CartItem|null
     */
    public function addToCart($sparePartId, $quantity = 1)
    {
        // Проверяем, авторизован ли пользователь
        if (!Auth::check()) {
            // Для неавторизованных пользователей ничего не делаем
            return null;
        }
        
        // Получаем корзину авторизованного пользователя
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

    /**
     * Очистить неактивные корзины старше определенного срока
     *
     * @param int $days Количество дней, после которых корзина считается устаревшей
     * @return int Количество удаленных корзин
     */
    public function cleanupInactiveCarts($days = 7)
    {
        // Находим все неактивные корзины старше указанного срока
        $date = now()->subDays($days);
        
        // Сначала удаляем элементы корзин
        $oldCartIds = Cart::where('is_active', false)
            ->where('updated_at', '<', $date)
            ->pluck('id');
            
        $itemsDeleted = CartItem::whereIn('cart_id', $oldCartIds)->delete();
        
        // Затем удаляем сами корзины
        $cartsDeleted = Cart::where('is_active', false)
            ->where('updated_at', '<', $date)
            ->delete();
            
        return $cartsDeleted;
    }
} 