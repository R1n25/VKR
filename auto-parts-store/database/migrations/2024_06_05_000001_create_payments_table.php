<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Проверяем существование таблицы payments
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('payment_method_id')->constrained()->onDelete('cascade');
                $table->string('transaction_id')->nullable();
                $table->decimal('amount', 10, 2);
                $table->string('currency')->default('RUB');
                $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
                $table->text('notes')->nullable();
                $table->json('payment_data')->nullable();
                $table->timestamp('payment_date')->nullable();
                $table->timestamp('refund_date')->nullable();
                $table->timestamps();
            });
        } else {
            // Если таблица уже существует и в ней есть поле payment_method, но нет payment_method_id
            if (Schema::hasColumn('payments', 'payment_method') && !Schema::hasColumn('payments', 'payment_method_id')) {
                // Добавляем поле payment_method_id
                Schema::table('payments', function (Blueprint $table) {
                    // Сначала добавляем поле без ограничений внешнего ключа
                    $table->unsignedBigInteger('payment_method_id')->nullable();
                });
                
                // Обновляем данные - связываем payment_method с payment_method_id
                $paymentMethods = DB::table('payment_methods')->get();
                
                // Создаем массив для маппинга payment_method -> payment_method_id
                $methodMap = [];
                foreach ($paymentMethods as $method) {
                    $methodMap[$method->code] = $method->id;
                }
                
                // Обновляем записи в таблице payments
                $payments = DB::table('payments')->whereNotNull('payment_method')->get();
                foreach ($payments as $payment) {
                    $code = $payment->payment_method;
                    
                    // Если есть соответствующий код в методах оплаты
                    if (isset($methodMap[$code])) {
                        DB::table('payments')
                            ->where('id', $payment->id)
                            ->update(['payment_method_id' => $methodMap[$code]]);
                    } else {
                        // Если нет соответствия, используем первый метод оплаты
                        $firstMethodId = !empty($paymentMethods) ? $paymentMethods[0]->id : null;
                        
                        DB::table('payments')
                            ->where('id', $payment->id)
                            ->update(['payment_method_id' => $firstMethodId]);
                    }
                }
                
                // Добавляем внешний ключ
                Schema::table('payments', function (Blueprint $table) {
                    // Делаем поле обязательным после обновления данных
                    $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
                    
                    // Удаляем старое поле payment_method
                    $table->dropColumn('payment_method');
                });
                
                // Добавляем недостающие поля, если их нет
                if (!Schema::hasColumn('payments', 'transaction_id')) {
                    Schema::table('payments', function (Blueprint $table) {
                        $table->string('transaction_id')->nullable();
                    });
                }
                
                if (!Schema::hasColumn('payments', 'currency')) {
                    Schema::table('payments', function (Blueprint $table) {
                        $table->string('currency')->default('RUB');
                    });
                }
                
                if (!Schema::hasColumn('payments', 'status')) {
                    Schema::table('payments', function (Blueprint $table) {
                        $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
                    });
                }
                
                if (!Schema::hasColumn('payments', 'notes')) {
                    Schema::table('payments', function (Blueprint $table) {
                        $table->text('notes')->nullable();
                    });
                }
                
                if (!Schema::hasColumn('payments', 'payment_data')) {
                    Schema::table('payments', function (Blueprint $table) {
                        $table->json('payment_data')->nullable();
                    });
                }
                
                if (!Schema::hasColumn('payments', 'payment_date')) {
                    Schema::table('payments', function (Blueprint $table) {
                        $table->timestamp('payment_date')->nullable();
                    });
                }
                
                if (!Schema::hasColumn('payments', 'refund_date')) {
                    Schema::table('payments', function (Blueprint $table) {
                        $table->timestamp('refund_date')->nullable();
                    });
                }
            }
        }

        // Проверяем наличие колонки payment_id в таблице orders
        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'payment_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->foreignId('payment_id')->nullable()->after('id')->constrained()->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Проверяем существование колонки payment_id в таблице orders
        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'payment_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropForeign(['payment_id']);
                $table->dropColumn('payment_id');
            });
        }
        
        // В случае отката, если в payments нет поля payment_method, но есть payment_method_id
        if (Schema::hasTable('payments') && Schema::hasColumn('payments', 'payment_method_id') && !Schema::hasColumn('payments', 'payment_method')) {
            Schema::table('payments', function (Blueprint $table) {
                // Сначала снимаем ограничение внешнего ключа
                $table->dropForeign(['payment_method_id']);
                
                // Добавляем поле payment_method
                $table->string('payment_method')->nullable();
            });
            
            // Обновляем данные - копируем данные из payment_methods
            $paymentMethods = DB::table('payment_methods')->get();
            
            // Создаем массив для маппинга payment_method_id -> payment_method.code
            $methodCodeMap = [];
            foreach ($paymentMethods as $method) {
                $methodCodeMap[$method->id] = $method->code;
            }
            
            // Обновляем записи в таблице payments
            $payments = DB::table('payments')->whereNotNull('payment_method_id')->get();
            foreach ($payments as $payment) {
                $methodId = $payment->payment_method_id;
                
                // Если есть соответствующий ID в методах оплаты
                if (isset($methodCodeMap[$methodId])) {
                    DB::table('payments')
                        ->where('id', $payment->id)
                        ->update(['payment_method' => $methodCodeMap[$methodId]]);
                }
            }
            
            // Удаляем поле payment_method_id
            Schema::table('payments', function (Blueprint $table) {
                $table->dropColumn('payment_method_id');
            });
        }
        
        // Удаляем таблицу payments только если она существует и была создана этой миграцией
        if (Schema::hasTable('payments') && !Schema::hasColumn('payments', 'payment_method') && !Schema::hasColumn('payments', 'payment_method_id')) {
            Schema::dropIfExists('payments');
        }
    }
}; 