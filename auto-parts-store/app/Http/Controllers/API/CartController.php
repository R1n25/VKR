<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\SparePart;
use App\Models\Order;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    
    {
        $this->cartService = $cartService;
    }

    /**
     * Получить текущую корзину пользователя
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCart()
    {
        $cartData = $this->cartService->getCartWithItems();
        
        return response()->json([
            'success' => true,
            'data' => [
                'cart' => $cartData['cart'],
                'items' => $cartData['items'],
                'count' => $this->cartService->getCartItemsCount()
            ]
        ]);
    }

    /**
     * Добавить товар в корзину
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'spare_part_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
        ]);

        try {
            $cartItem = $this->cartService->addToCart(
                $request->spare_part_id,
                $request->quantity
            );

            return response()->json([
                'success' => true,
                'message' => 'Товар добавлен в корзину',
                'data' => [
                    'cart_item' => $cartItem,
                    'cart_count' => $this->cartService->getCartItemsCount()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при добавлении товара в корзину: ' . $e->getMessage(), [
                'spare_part_id' => $request->spare_part_id,
                'quantity' => $request->quantity
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось добавить товар в корзину: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Синхронизировать корзину из localStorage с базой данных
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function syncCart(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Очищаем текущую корзину пользователя
        $this->cartService->clearCart();
        
        // Добавляем все товары из localStorage
        foreach ($request->items as $item) {
            try {
                $this->cartService->addToCart($item['id'], $item['quantity']);
            } catch (\Exception $e) {
                Log::error('Ошибка при добавлении товара в корзину: ' . $e->getMessage(), [
                    'spare_part_id' => $item['id'],
                    'quantity' => $item['quantity']
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Корзина успешно синхронизирована',
            'data' => [
                'cart_count' => $this->cartService->getCartItemsCount()
            ]
        ]);
    }

    /**
     * Удалить товар из корзины
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeFromCart(Request $request)
    {
        $request->validate([
            'cart_item_id' => 'required|integer|exists:cart_items,id',
        ]);

        $result = $this->cartService->removeFromCart($request->cart_item_id);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Товар удален из корзины' : 'Не удалось удалить товар',
            'data' => [
                'cart_count' => $this->cartService->getCartItemsCount()
            ]
        ]);
    }

    /**
     * Обновить количество товара в корзине
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateQuantity(Request $request)
    {
        $request->validate([
            'cart_item_id' => 'required|integer|exists:cart_items,id',
            'quantity' => 'required|integer|min:0',
        ]);

        $cartItem = $this->cartService->updateCartItemQuantity(
            $request->cart_item_id,
            $request->quantity
        );

        return response()->json([
            'success' => true,
            'data' => [
                'cart_item' => $cartItem,
                'cart_count' => $this->cartService->getCartItemsCount()
            ]
        ]);
    }

    /**
     * Очистить корзину
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCart()
    {
        $result = $this->cartService->clearCart();

        return response()->json([
            'success' => $result,
            'message' => 'Корзина очищена',
            'data' => [
                'cart_count' => 0
            ]
        ]);
    }

    /**
     * Добавить товары из заказа в корзину
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addOrderToCart(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        try {
            // Получаем заказ и его товары
            $order = Order::with('orderItems.part')->findOrFail($request->order_id);
            
            // Проверяем, что заказ принадлежит текущему пользователю
            if (Auth::check() && Auth::id() !== $order->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'У вас нет доступа к этому заказу'
                ], 403);
            }
            
            // Добавляем товары из заказа в корзину
            foreach ($order->orderItems as $item) {
                if ($item->part) {
                    $this->cartService->addToCart(
                        $item->part_id,
                        $item->quantity
                    );
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Товары из заказа добавлены в корзину',
                'data' => [
                    'cart_count' => $this->cartService->getCartItemsCount()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при добавлении заказа в корзину: ' . $e->getMessage(), [
                'order_id' => $request->order_id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось добавить товары из заказа в корзину: ' . $e->getMessage()
            ], 500);
        }
    }
} 