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
        // Проверяем авторизованного пользователя
        if (Auth::check()) {
            $user = Auth::user();
            $cart = $this->getUserCart($user);
        } else {
            $cart = $this->getSessionCart();
        }

        return $cart;
    }

    /**
     * Получить корзину авторизованного пользователя
     *
     * @param User $user
     * @return Cart
     */
    private function getUserCart(User $user)
    {
        $cart = Cart::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if (!$cart) {
            $cart = Cart::create([
                'user_id' => $user->id,
                'session_id' => Session::getId(),
                'is_active' => true
            ]);
        }

        return $cart;
    }

    /**
     * Получить корзину для гостя по session_id
     *
     * @return Cart
     */
    private function getSessionCart()
    {
        $sessionId = Session::getId();
        $cart = Cart::where('session_id', $sessionId)
            ->where('is_active', true)
            ->first();

        if (!$cart) {
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
                'price' => $sparePart->price
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
        $cart = $this->getCart();
        $cartItems = CartItem::with('sparePart')
            ->where('cart_id', $cart->id)
            ->get();

        return [
            'cart' => $cart,
            'items' => $cartItems
        ];
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
        $guestCart = Cart::where('session_id', $sessionId)
            ->where('user_id', null)
            ->where('is_active', true)
            ->first();

        // Если корзина гостя не найдена, просто возвращаем корзину пользователя
        if (!$guestCart) {
            return $this->getUserCart($user);
        }

        // Получаем или создаем корзину пользователя
        $userCart = $this->getUserCart($user);

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

        // Удаляем пустую корзину гостя
        $guestCart->delete();

        // Пересчитываем общую стоимость корзины пользователя
        $userCart->calculateTotalPrice();

        return $userCart;
    }
} 