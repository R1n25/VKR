<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SparePart;
use App\Models\User;
use Illuminate\Console\Command;

class CreateTestOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-test-order {user_id? : ID пользователя} {--items=3 : Количество товаров в заказе}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Создает тестовый заказ для указанного пользователя';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Получаем ID пользователя из аргументов команды или выбираем первого пользователя
        $userId = $this->argument('user_id');
        
        if (!$userId) {
            // Если ID не указан, берем первого пользователя или создаем нового
            $user = User::first();
            
            if (!$user) {
                $this->error('Пользователи не найдены. Сначала создайте пользователя.');
                return 1;
            }
            
            $userId = $user->id;
        } else {
            $user = User::find($userId);
            
            if (!$user) {
                $this->error("Пользователь с ID {$userId} не найден.");
                return 1;
            }
        }
        
        $this->info("Создание тестового заказа для пользователя: {$user->name} (ID: {$user->id})");
        
        // Получаем случайные запчасти для заказа
        $itemsCount = (int) $this->option('items');
        $spareParts = SparePart::where('stock_quantity', '>', 0)->inRandomOrder()->limit($itemsCount)->get();
        
        if ($spareParts->isEmpty()) {
            $this->error('Нет доступных запчастей в наличии.');
            return 1;
        }
        
        $this->info("Выбрано {$spareParts->count()} запчастей для заказа.");
        
        // Создаем заказ
        $total = 0;
        
        // Начинаем транзакцию
        \DB::beginTransaction();
        
        try {
            // Создаем заказ
            $order = new Order();
            $order->user_id = $userId;
            $order->status = 'pending';
            $order->payment_status = 'pending';
            $order->payment_method = 'cash';
            $order->customer_name = $user->name;
            $order->email = $user->email;
            $order->phone = '7' . rand(9000000000, 9999999999);
            $order->address = 'ул. Тестовая, д. ' . rand(1, 100) . ', Москва, 145892';
            $order->shipping_name = $user->name;
            $order->shipping_phone = '7' . rand(9000000000, 9999999999);
            $order->shipping_address = 'ул. Тестовая, д. ' . rand(1, 100);
            $order->shipping_city = 'Москва';
            $order->shipping_zip = '145892';
            $order->notes = 'Тестовый заказ, создан через команду artisan';
            $order->save();
            
            // Добавляем товары в заказ
            foreach ($spareParts as $part) {
                $quantity = rand(1, 3);
                $price = $part->price;
                $total += $price * $quantity;
                
                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->spare_part_id = $part->id;
                $orderItem->quantity = $quantity;
                $orderItem->price = $price;
                $orderItem->part_name = $part->name;
                $orderItem->part_number = $part->part_number;
                $orderItem->save();
                
                // Уменьшаем количество на складе
                $part->stock_quantity -= $quantity;
                $part->save();
            }
            
            // Обновляем общую сумму заказа
            $order->total = $total;
            $order->save();
            
            \DB::commit();
            
            $this->info("Заказ #{$order->order_number} успешно создан!");
            $this->info("Общая сумма заказа: {$total} руб.");
            
            return 0;
        } catch (\Exception $e) {
            \DB::rollBack();
            $this->error("Ошибка при создании заказа: {$e->getMessage()}");
            return 1;
        }
    }
} 