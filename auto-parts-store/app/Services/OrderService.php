<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    /**
     * Создать заказ на основе корзины
     *
     * @param Cart $cart
     * @param array $orderData
     * @return Order
     */
    public function createOrderFromCart(Cart $cart, array $orderData)
    {
        // Начинаем транзакцию
        return DB::transaction(function () use ($cart, $orderData) {
            // Создаем заказ
            $order = Order::create([
                'user_id' => $cart->user_id,
                'order_number' => $this->generateOrderNumber(),
                'total_price' => $cart->total_price,
                'status' => 'pending',
                'payment_method' => $orderData['payment_method'] ?? 'cash',
                'shipping_address' => $orderData['shipping_address'] ?? null,
                'shipping_city' => $orderData['shipping_city'] ?? null,
                'shipping_zip' => $orderData['shipping_zip'] ?? null,
                'shipping_phone' => $orderData['shipping_phone'] ?? null,
                'shipping_name' => $orderData['shipping_name'] ?? null,
                'notes' => $orderData['notes'] ?? null,
            ]);

            // Добавляем товары к заказу
            $cartItems = CartItem::with('sparePart')->where('cart_id', $cart->id)->get();

            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'spare_part_id' => $cartItem->spare_part_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'part_number' => $cartItem->sparePart->part_number,
                    'part_name' => $cartItem->sparePart->name,
                ]);
            }

            // Очищаем корзину
            CartItem::where('cart_id', $cart->id)->delete();
            $cart->total_price = 0;
            $cart->save();

            return $order;
        });
    }

    /**
     * Сгенерировать уникальный номер заказа
     *
     * @return string
     */
    private function generateOrderNumber()
    {
        // Получаем последний номер заказа
        $lastOrder = Order::orderBy('id', 'desc')->first();
        
        if ($lastOrder && is_numeric($lastOrder->order_number)) {
            // Если есть последний заказ и его номер - число, увеличиваем на 1
            $nextOrderNumber = intval($lastOrder->order_number) + 1;
        } else {
            // Если заказов еще нет или формат номера был другой, начинаем с 100000001
            $nextOrderNumber = 100000001;
        }
        
        // Убеждаемся, что номер заказа уникален
        while (Order::where('order_number', (string)$nextOrderNumber)->exists()) {
            $nextOrderNumber++;
        }
        
        return (string)$nextOrderNumber;
    }

    /**
     * Получить все заказы пользователя
     *
     * @param User $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserOrders(User $user)
    {
        return Order::with('orderItems')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Получить заказ по номеру
     *
     * @param string $orderNumber
     * @return Order|null
     */
    public function getOrderByNumber($orderNumber)
    {
        return Order::with('orderItems.sparePart')
            ->where('order_number', $orderNumber)
            ->first();
    }

    /**
     * Получить заказ по ID
     *
     * @param int $orderId
     * @return Order|null
     */
    public function getOrderById($orderId)
    {
        return Order::with('orderItems.sparePart')
            ->where('id', $orderId)
            ->first();
    }

    /**
     * Обновить статус заказа
     *
     * @param int $orderId
     * @param string $status
     * @return Order|null
     */
    public function updateOrderStatus($orderId, $status)
    {
        $order = Order::find($orderId);
        
        if ($order) {
            $order->status = $status;
            $order->save();
            return $order;
        }
        
        return null;
    }

    /**
     * Получить все заказы (для администратора)
     *
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getAllOrders()
    {
        return Order::with('user', 'orderItems')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    /**
     * Поиск заказов по параметрам
     *
     * @param array $params
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function searchOrders($params)
    {
        $query = Order::with('user', 'orderItems');

        if (isset($params['order_number'])) {
            $query->where('order_number', 'like', '%' . $params['order_number'] . '%');
        }

        if (isset($params['status'])) {
            $query->where('status', $params['status']);
        }

        if (isset($params['date_from'])) {
            $query->whereDate('created_at', '>=', $params['date_from']);
        }

        if (isset($params['date_to'])) {
            $query->whereDate('created_at', '<=', $params['date_to']);
        }

        if (isset($params['user_id'])) {
            $query->where('user_id', $params['user_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
} 