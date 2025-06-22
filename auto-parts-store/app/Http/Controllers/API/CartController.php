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
        try {
            $cartData = $this->cartService->getCartWithItems();
            $cart = $cartData['cart'];
            $items = $cartData['items'];
            
            // Проверяем, что корзина принадлежит текущему пользователю
            if (Auth::check() && $cart->user_id && $cart->user_id !== Auth::id()) {
                // Если корзина не принадлежит пользователю, создаем новую
                $cart = $this->cartService->getCartByUserId(Auth::id());
                $items = CartItem::with('sparePart')->where('cart_id', $cart->id)->get();
            }
            
            // Преобразуем данные в формат, совместимый с localStorage
            $cartItems = [];
            foreach ($items as $item) {
                if (!$item->sparePart) {
                    Log::warning('Элемент корзины без связанной запчасти:', [
                        'cart_item_id' => $item->id,
                        'spare_part_id' => $item->spare_part_id
                    ]);
                    continue; // Пропускаем элементы без связанной запчасти
                }
                
                $cartItems[] = [
                    'id' => $item->spare_part_id,
                    'name' => $item->sparePart->name,
                    'price' => floatval($item->sparePart->price),
                    'image_url' => $item->sparePart->image_url,
                    'quantity' => $item->quantity,
                    'stock' => $item->sparePart->stock_quantity,
                    'part_number' => $item->sparePart->part_number
                ];
            }
            
            Log::info('Получены данные корзины', [
                'cart_id' => $cart->id,
                'user_id' => $cart->user_id,
                'items_count' => count($cartItems)
            ]);
            
            return response()->json([
                'success' => true,
                'cart' => $cartItems,
                'data' => [
                    'cart_count' => $this->cartService->getCartItemsCount(),
                    'cart_id' => $cart->id,
                    'user_id' => $cart->user_id
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при получении корзины: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => Auth::id(),
                'session_id' => session()->getId()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось получить корзину: ' . $e->getMessage(),
                'cart' => [],
                'data' => [
                    'cart_count' => 0
                ]
            ], 500);
        }
    }

    /**
     * Добавить товар в корзину
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToCart(Request $request)
    {
        try {
            $request->validate([
                'spare_part_id' => 'required|integer',
                'quantity' => 'required|integer|min:1',
            ]);

            // Проверяем существование запчасти
            $sparePart = SparePart::find($request->spare_part_id);
            if (!$sparePart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Запчасть не найдена',
                ], 404);
            }

            // Добавляем товар в корзину
            $cartItem = $this->cartService->addToCart(
                $request->spare_part_id,
                $request->quantity
            );

            // Получаем обновленные данные корзины
            $cartData = $this->cartService->getCartWithItems();
            
            // Преобразуем данные в формат, совместимый с localStorage
            $cartItems = [];
            foreach ($cartData['items'] as $item) {
                if (!$item->sparePart) continue;
                
                $cartItems[] = [
                    'id' => $item->spare_part_id,
                    'name' => $item->sparePart->name,
                    'price' => floatval($item->sparePart->price),
                    'image_url' => $item->sparePart->image_url,
                    'quantity' => $item->quantity,
                    'stock' => $item->sparePart->stock_quantity,
                    'part_number' => $item->sparePart->part_number
                ];
            }

            Log::info('Товар добавлен в корзину', [
                'spare_part_id' => $request->spare_part_id,
                'quantity' => $request->quantity,
                'user_id' => Auth::id(),
                'cart_count' => $this->cartService->getCartItemsCount()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Товар добавлен в корзину',
                'cart' => $cartItems,
                'data' => [
                    'cart_item' => $cartItem,
                    'cart_count' => $this->cartService->getCartItemsCount()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при добавлении товара в корзину: ' . $e->getMessage(), [
                'spare_part_id' => $request->spare_part_id,
                'quantity' => $request->quantity,
                'exception' => $e
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
        try {
            $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|integer',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            // Сначала получаем текущую корзину
            $cart = $this->cartService->getCart();
            
            // Очищаем текущую корзину пользователя
            $this->cartService->clearCart();
            
            // Добавляем все товары из localStorage
            $addedItems = [];
            foreach ($request->items as $item) {
                try {
                    $cartItem = $this->cartService->addToCart($item['id'], $item['quantity']);
                    if ($cartItem) {
                        $addedItems[] = $cartItem;
                    }
                } catch (\Exception $e) {
                    Log::error('Ошибка при добавлении товара в корзину: ' . $e->getMessage(), [
                        'spare_part_id' => $item['id'],
                        'quantity' => $item['quantity'],
                        'cart_id' => $cart->id,
                        'session_id' => $cart->session_id,
                        'user_id' => $cart->user_id
                    ]);
                }
            }
            
            // Получаем обновленные данные корзины
            $cartData = $this->cartService->getCartWithItems();
            
            // Преобразуем данные в формат, совместимый с localStorage
            $cartItems = [];
            foreach ($cartData['items'] as $item) {
                if (!$item->sparePart) {
                    continue; // Пропускаем элементы без связанной запчасти
                }
                
                $cartItems[] = [
                    'id' => $item->spare_part_id,
                    'name' => $item->sparePart->name,
                    'price' => floatval($item->sparePart->price),
                    'image_url' => $item->sparePart->image_url,
                    'quantity' => $item->quantity,
                    'stock' => $item->sparePart->stock_quantity,
                    'part_number' => $item->sparePart->part_number
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Корзина успешно синхронизирована',
                'cart' => $cartItems,
                'data' => [
                    'cart_count' => $this->cartService->getCartItemsCount(),
                    'cart_id' => $cart->id,
                    'session_id' => $cart->session_id,
                    'user_id' => $cart->user_id
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при синхронизации корзины: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при синхронизации корзины: ' . $e->getMessage(),
                'cart' => [],
                'data' => [
                    'cart_count' => 0
                ]
            ], 500);
        }
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