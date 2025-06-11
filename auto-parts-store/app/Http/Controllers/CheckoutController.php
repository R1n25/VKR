<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SparePart;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    /**
     * Показать форму оформления заказа
     */
    public function index()
    {
        // Логируем посещение страницы оформления заказа
        $checkoutLog = storage_path('logs/checkout.log');
        file_put_contents($checkoutLog, "\n\n" . date('Y-m-d H:i:s') . " === ПОСЕЩЕНИЕ СТРАНИЦЫ ОФОРМЛЕНИЯ ЗАКАЗА ===\n", FILE_APPEND);
        
        return Inertia::render('Checkout', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Обработать отправку формы заказа
     */
    public function store(Request $request)
    {
        // Логируем запрос
        $checkoutLog = storage_path('logs/checkout.log');
        file_put_contents($checkoutLog, "\n\n" . date('Y-m-d H:i:s') . " === ЗАПРОС ОФОРМЛЕНИЯ ЗАКАЗА ===\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request method: " . $request->method() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request URL: " . $request->fullUrl() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request content: " . $request->getContent() . "\n", FILE_APPEND);
        
        // Логируем информацию об авторизации
        $userId = Auth::id();
        file_put_contents($checkoutLog, "Авторизованный пользователь: " . ($userId ? "ID: {$userId}" : "Нет") . "\n", FILE_APPEND);
        
        try {
            // Минимальная проверка данных
            $validator = Validator::make($request->all(), [
                'customer_name' => 'required|string',
                'email' => 'required|email',
                'phone' => 'required|string',
                'address' => 'required|string',
                'cart_items' => 'required|array',
                'cart_items.*.id' => 'required|integer',
                'cart_items.*.quantity' => 'required|integer|min:1',
                'cart_items.*.price' => 'required|numeric|min:0'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации данных',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Начинаем транзакцию
            DB::beginTransaction();
            
            try {
                // Проверяем наличие товаров
                $unavailableItems = [];
                foreach ($request->cart_items as $item) {
                    $sparePart = SparePart::find($item['id']);
                    if (!$sparePart) {
                        $unavailableItems[] = [
                            'id' => $item['id'],
                            'reason' => 'Товар не найден'
                        ];
                        continue;
                    }
                    
                    // Проверяем, достаточно ли товара в наличии
                    if ($sparePart->stock_quantity < $item['quantity']) {
                        $unavailableItems[] = [
                            'id' => $item['id'],
                            'name' => $sparePart->name,
                            'available' => $sparePart->stock_quantity,
                            'requested' => $item['quantity'],
                            'reason' => 'Недостаточно товара в наличии'
                        ];
                    }
                }
                
                // Если есть недоступные товары, возвращаем ошибку
                if (!empty($unavailableItems)) {
                    file_put_contents($checkoutLog, "Ошибка: недостаточно товара в наличии: " . json_encode($unavailableItems, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                    return response()->json([
                        'success' => false,
                        'message' => 'Некоторые товары недоступны или их недостаточно в наличии',
                        'unavailable_items' => $unavailableItems
                    ], 422);
                }
                
                // Создаем заказ
                $order = new Order();
                
                // Получаем ID пользователя или находим пользователя по email
                if ($userId) {
                    $order->user_id = $userId;
                    file_put_contents($checkoutLog, "Заказ привязан к авторизованному пользователю ID: {$userId}\n", FILE_APPEND);
                } else {
                    // Ищем пользователя по email
                    $user = \App\Models\User::where('email', $request->email)->first();
                    if ($user) {
                        $order->user_id = $user->id;
                        file_put_contents($checkoutLog, "Заказ привязан к существующему пользователю по email: ID: {$user->id}\n", FILE_APPEND);
                    } else {
                        file_put_contents($checkoutLog, "Пользователь не найден, заказ будет без привязки\n", FILE_APPEND);
                    }
                }
                
                $order->customer_name = $request->customer_name;
                $order->email = $request->email;
                $order->phone = $request->phone;
                $order->address = $request->address;
                $order->notes = $request->notes ?? '';
                $order->status = 'pending';
                $order->order_number = $this->generateOrderNumber();
                
                // Рассчитываем общую сумму заказа
                $total = 0;
                foreach ($request->cart_items as $item) {
                    $total += $item['price'] * $item['quantity'];
                }
                
                $order->total = $total;
                $order->save();
                
                // Логируем создание заказа
                file_put_contents($checkoutLog, "Создан заказ ID: {$order->id}, номер: {$order->order_number}, привязка к пользователю: " . ($order->user_id ?: "Нет") . "\n", FILE_APPEND);
                
                // Создаем элементы заказа
                foreach ($request->cart_items as $item) {
                    $sparePart = SparePart::find($item['id']);
                    if (!$sparePart) {
                        file_put_contents($checkoutLog, "Товар не найден ID: {$item['id']}\n", FILE_APPEND);
                        continue; // Пропускаем несуществующие товары
                    }
                    
                    $orderItem = new OrderItem();
                    $orderItem->order_id = $order->id;
                    $orderItem->spare_part_id = $item['id'];
                    $orderItem->name = $sparePart->name . ' ' . $sparePart->manufacturer; // Добавляем имя товара и бренд
                    $orderItem->part_number = $sparePart->part_number; // Добавляем артикул запчасти
                    $orderItem->quantity = $item['quantity'];
                    $orderItem->price = $item['price'];
                    $orderItem->total = $item['price'] * $item['quantity']; // Рассчитываем общую стоимость позиции
                    $orderItem->save();
                    
                    // Уменьшаем количество товара в наличии
                    $sparePart->updateAvailability(-$item['quantity']);
                    file_put_contents($checkoutLog, "Обновлено количество товара ID: {$item['id']}, новое количество: {$sparePart->stock_quantity}\n", FILE_APPEND);
                }
                
                // Фиксируем транзакцию
                DB::commit();
                
                // Логируем успех
                file_put_contents($checkoutLog, "SUCCESS: Order created with ID " . $order->id . "\n", FILE_APPEND);
                
                // Возвращаем успешный ответ с перенаправлением
                return response()->json([
                    'success' => true,
                    'message' => 'Заказ успешно оформлен',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'redirect' => '/order-success'
                ]);
            } catch (\Exception $e) {
                // Отменяем транзакцию в случае ошибки
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            // Логируем ошибку
            file_put_contents($checkoutLog, "ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
            file_put_contents($checkoutLog, "STACK TRACE: " . $e->getTraceAsString() . "\n", FILE_APPEND);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при оформлении заказа: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Обработать тестовый запрос оформления заказа через API
     * (маршрут /api/test-checkout)
     */
    public function testCheckout(Request $request)
    {
        // Логируем запрос
        $checkoutLog = storage_path('logs/checkout.log');
        file_put_contents($checkoutLog, "\n\n" . date('Y-m-d H:i:s') . " === ТЕСТОВЫЙ ЗАПРОС ОФОРМЛЕНИЯ ЗАКАЗА ===\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request method: " . $request->method() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request URL: " . $request->fullUrl() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request content: " . $request->getContent() . "\n", FILE_APPEND);
        
        // Возвращаем успешный ответ
        return response()->json([
            'success' => true,
            'message' => 'Тестовый заказ успешно оформлен',
            'data' => $request->all()
        ]);
    }
    
    /**
     * Обработать запрос оформления тестового заказа
     * (маршрут /test-checkout)
     */
    public function processTestCheckout(Request $request)
    {
        // Логируем запрос
        $checkoutLog = storage_path('logs/checkout.log');
        file_put_contents($checkoutLog, "\n\n" . date('Y-m-d H:i:s') . " === ЗАПРОС ТЕСТОВОГО ЗАКАЗА ===\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request method: " . $request->method() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request URL: " . $request->fullUrl() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request content: " . $request->getContent() . "\n", FILE_APPEND);
        
        // Логируем информацию об авторизации
        $userId = Auth::id();
        file_put_contents($checkoutLog, "Авторизованный пользователь: " . ($userId ? "ID: {$userId}" : "Нет") . "\n", FILE_APPEND);
        
        try {
            // Минимальная проверка данных
            $validator = Validator::make($request->all(), [
                'customer_name' => 'required|string',
                'email' => 'required|email',
                'phone' => 'required|string',
                'address' => 'required|string',
                'cart_items' => 'required|array',
                'cart_items.*.id' => 'required|integer',
                'cart_items.*.quantity' => 'required|integer|min:1',
                'cart_items.*.price' => 'required|numeric|min:0'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации данных',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Начинаем транзакцию
            DB::beginTransaction();
            
            try {
                // Создаем заказ
                $order = new Order();
                
                // Получаем ID пользователя или находим пользователя по email
                if ($userId) {
                    $order->user_id = $userId;
                    file_put_contents($checkoutLog, "Заказ привязан к авторизованному пользователю ID: {$userId}\n", FILE_APPEND);
                } else {
                    // Ищем пользователя по email
                    $user = \App\Models\User::where('email', $request->email)->first();
                    if ($user) {
                        $order->user_id = $user->id;
                        file_put_contents($checkoutLog, "Заказ привязан к существующему пользователю по email: ID: {$user->id}\n", FILE_APPEND);
                    } else {
                        file_put_contents($checkoutLog, "Пользователь не найден, заказ будет без привязки\n", FILE_APPEND);
                    }
                }
                
                $order->customer_name = $request->customer_name;
                $order->email = $request->email;
                $order->phone = $request->phone;
                $order->address = $request->address;
                $order->notes = $request->notes ?? '';
                $order->status = 'pending';
                $order->order_number = $this->generateOrderNumber();
                
                // Рассчитываем общую сумму заказа
                $total = 0;
                foreach ($request->cart_items as $item) {
                    $total += $item['price'] * $item['quantity'];
                }
                
                $order->total = $total;
                $order->save();
                
                // Логируем создание заказа
                file_put_contents($checkoutLog, "Создан заказ ID: {$order->id}, номер: {$order->order_number}, привязка к пользователю: " . ($order->user_id ?: "Нет") . "\n", FILE_APPEND);
                
                // Создаем элементы заказа
                foreach ($request->cart_items as $item) {
                    $sparePart = \App\Models\SparePart::find($item['id']);
                    if (!$sparePart) {
                        file_put_contents($checkoutLog, "Товар не найден ID: {$item['id']}\n", FILE_APPEND);
                        continue; // Пропускаем несуществующие товары
                    }
                    
                    $orderItem = new OrderItem();
                    $orderItem->order_id = $order->id;
                    $orderItem->spare_part_id = $item['id'];
                    $orderItem->name = $sparePart->name . ' ' . $sparePart->manufacturer; // Добавляем имя товара и бренд
                    $orderItem->part_number = $sparePart->part_number; // Добавляем артикул запчасти
                    $orderItem->quantity = $item['quantity'];
                    $orderItem->price = $item['price'];
                    $orderItem->total = $item['price'] * $item['quantity']; // Рассчитываем общую стоимость позиции
                    $orderItem->save();
                    
                    // Уменьшаем количество товара в наличии
                    $sparePart->updateAvailability(-$item['quantity']);
                    file_put_contents($checkoutLog, "Обновлено количество товара ID: {$item['id']}, новое количество: {$sparePart->stock_quantity}\n", FILE_APPEND);
                }
                
                // Фиксируем транзакцию
                DB::commit();
                
                // Логируем успех
                file_put_contents($checkoutLog, "SUCCESS: Test order created with ID " . $order->id . "\n", FILE_APPEND);
                
                // Возвращаем успешный ответ
                return response()->json([
                    'success' => true,
                    'message' => 'Заказ успешно оформлен через тестовый API',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total' => $total
                ]);
            } catch (\Exception $e) {
                // Отменяем транзакцию в случае ошибки
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            // Логируем ошибку
            file_put_contents($checkoutLog, "ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
            file_put_contents($checkoutLog, "TRACE: " . $e->getTraceAsString() . "\n", FILE_APPEND);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при оформлении заказа: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обработать запрос оформления заказа без CSRF-защиты
     * (маршрут /api/process-order)
     */
    public function processOrder(Request $request)
    {
        // Логируем запрос
        $checkoutLog = storage_path('logs/checkout.log');
        file_put_contents($checkoutLog, "\n\n" . date('Y-m-d H:i:s') . " === ЗАПРОС ОФОРМЛЕНИЯ ЗАКАЗА БЕЗ CSRF ===\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request method: " . $request->method() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request URL: " . $request->fullUrl() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request content: " . $request->getContent() . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request all: " . json_encode($request->all()) . "\n", FILE_APPEND);
        file_put_contents($checkoutLog, "Request headers: " . json_encode($request->header()) . "\n", FILE_APPEND);
        
        // Логируем информацию об авторизации
        $userId = Auth::id();
        file_put_contents($checkoutLog, "Авторизованный пользователь: " . ($userId ? "ID: {$userId}" : "Нет") . "\n", FILE_APPEND);
        
        try {
            // Минимальная проверка данных
            $validator = Validator::make($request->all(), [
                'customer_name' => 'required|string',
                'email' => 'required|email',
                'phone' => 'required|string',
                'address' => 'required|string',
                'cart_items' => 'required|array',
                'cart_items.*.id' => 'required|integer',
                'cart_items.*.quantity' => 'required|integer|min:1',
                'cart_items.*.price' => 'required|numeric|min:0'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации данных',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Начинаем транзакцию
            DB::beginTransaction();
            
            try {
                // Проверяем наличие товаров
                $unavailableItems = [];
                foreach ($request->cart_items as $item) {
                    $sparePart = SparePart::find($item['id']);
                    if (!$sparePart) {
                        $unavailableItems[] = [
                            'id' => $item['id'],
                            'reason' => 'Товар не найден'
                        ];
                        continue;
                    }
                    
                    // Проверяем, достаточно ли товара в наличии
                    if ($sparePart->stock_quantity < $item['quantity']) {
                        $unavailableItems[] = [
                            'id' => $item['id'],
                            'name' => $sparePart->name,
                            'available' => $sparePart->stock_quantity,
                            'requested' => $item['quantity'],
                            'reason' => 'Недостаточно товара в наличии'
                        ];
                    }
                }
                
                // Если есть недоступные товары, возвращаем ошибку
                if (!empty($unavailableItems)) {
                    file_put_contents($checkoutLog, "Ошибка: недостаточно товара в наличии: " . json_encode($unavailableItems, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                    return response()->json([
                        'success' => false,
                        'message' => 'Некоторые товары недоступны или их недостаточно в наличии',
                        'unavailable_items' => $unavailableItems
                    ], 422);
                }
                
                // Создаем заказ
                $order = new Order();
                
                // Получаем ID пользователя или находим пользователя по email
                if ($userId) {
                    $order->user_id = $userId;
                    file_put_contents($checkoutLog, "Заказ привязан к авторизованному пользователю ID: {$userId}\n", FILE_APPEND);
                } else {
                    // Ищем пользователя по email
                    $user = \App\Models\User::where('email', $request->email)->first();
                    if ($user) {
                        $order->user_id = $user->id;
                        file_put_contents($checkoutLog, "Заказ привязан к существующему пользователю по email: ID: {$user->id}\n", FILE_APPEND);
                    } else {
                        file_put_contents($checkoutLog, "Пользователь не найден, заказ будет без привязки\n", FILE_APPEND);
                    }
                }
                
                $order->customer_name = $request->customer_name;
                $order->email = $request->email;
                $order->phone = $request->phone;
                $order->address = $request->address;
                $order->notes = $request->notes ?? '';
                $order->status = 'pending';
                $order->order_number = $this->generateOrderNumber();
                
                // Рассчитываем общую сумму заказа
                $total = 0;
                foreach ($request->cart_items as $item) {
                    $total += $item['price'] * $item['quantity'];
                }
                
                $order->total = $total;
                $order->save();
                
                // Логируем создание заказа
                file_put_contents($checkoutLog, "Создан заказ ID: {$order->id}, номер: {$order->order_number}, привязка к пользователю: " . ($order->user_id ?: "Нет") . "\n", FILE_APPEND);
                
                // Создаем элементы заказа
                foreach ($request->cart_items as $item) {
                    $sparePart = SparePart::find($item['id']);
                    if (!$sparePart) {
                        file_put_contents($checkoutLog, "Товар не найден ID: {$item['id']}\n", FILE_APPEND);
                        continue; // Пропускаем несуществующие товары
                    }
                    
                    $orderItem = new OrderItem();
                    $orderItem->order_id = $order->id;
                    $orderItem->spare_part_id = $item['id'];
                    $orderItem->name = $sparePart->name . ' ' . $sparePart->manufacturer; // Добавляем имя товара и бренд
                    $orderItem->part_number = $sparePart->part_number; // Добавляем артикул запчасти
                    $orderItem->quantity = $item['quantity'];
                    $orderItem->price = $item['price'];
                    $orderItem->total = $item['price'] * $item['quantity']; // Рассчитываем общую стоимость позиции
                    $orderItem->save();
                    
                    // Уменьшаем количество товара в наличии
                    $sparePart->updateAvailability(-$item['quantity']);
                    file_put_contents($checkoutLog, "Обновлено количество товара ID: {$item['id']}, новое количество: {$sparePart->stock_quantity}\n", FILE_APPEND);
                }
                
                // Фиксируем транзакцию
                DB::commit();
                
                // Логируем успех
                file_put_contents($checkoutLog, "SUCCESS: Order created with ID " . $order->id . "\n", FILE_APPEND);
                
                // Возвращаем успешный ответ
                return response()->json([
                    'success' => true,
                    'message' => 'Заказ успешно оформлен',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total' => $total
                ]);
            } catch (\Exception $e) {
                // Отменяем транзакцию в случае ошибки
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            // Логируем ошибку
            file_put_contents($checkoutLog, "ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
            file_put_contents($checkoutLog, "TRACE: " . $e->getTraceAsString() . "\n", FILE_APPEND);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при оформлении заказа: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Генерирует уникальный 9-значный номер заказа
     *
     * @return string
     */
    private function generateOrderNumber()
    {
        // Получаем последний заказ
        $lastOrder = Order::orderBy('id', 'desc')->first();
        
        if ($lastOrder && is_numeric($lastOrder->order_number) && strlen($lastOrder->order_number) == 9) {
            // Если есть последний заказ и его номер - 9-значное число, увеличиваем на 1
            $nextOrderNumber = intval($lastOrder->order_number) + 1;
        } else {
            // Если заказов еще нет или формат номера был другой, начинаем с 100000001
            $nextOrderNumber = 100000001;
        }
        
        // Убеждаемся, что номер заказа уникален
        while (Order::where('order_number', (string)$nextOrderNumber)->exists()) {
            $nextOrderNumber++;
        }
        
        // Форматируем номер заказа до 9 цифр с ведущими нулями при необходимости
        return str_pad($nextOrderNumber, 9, '0', STR_PAD_LEFT);
    }
} 