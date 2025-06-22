<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserSuggestion;
use App\Models\SparePartAnalog;
use App\Models\SparePartCompatibility;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use App\Models\CarModel;
use App\Models\CarEngine;

class SuggestionController extends Controller
{
    public function approve(UserSuggestion $suggestion)
    {
        // Добавляем отладочную информацию
        \Log::info('Запрос на одобрение предложения получен', [
            'id' => $suggestion->id,
            'type' => $suggestion->suggestion_type,
            'spare_part_id' => $suggestion->spare_part_id,
            'car_model_id' => $suggestion->car_model_id,
            'data' => $suggestion->data,
            'request_method' => request()->method(),
            'request_headers' => request()->headers->all(),
            'request_url' => request()->url(),
            'request_path' => request()->path(),
        ]);
        
        \Log::info('Approving suggestion', [
            'id' => $suggestion->id,
            'type' => $suggestion->suggestion_type,
            'spare_part_id' => $suggestion->spare_part_id,
            'car_model_id' => $suggestion->car_model_id,
            'data' => $suggestion->data
        ]);
        
        DB::beginTransaction();
        
        try {
            if ($suggestion->suggestion_type === 'analog') {
                // Получаем данные об аналоге
                $suggestionData = is_array($suggestion->data) ? $suggestion->data : [];
                $isDirectAnalog = isset($suggestionData['is_direct']) ? (bool)$suggestionData['is_direct'] : true;
                $notes = $suggestion->comment ?? '';
                
                \Log::info('Processing analog suggestion', [
                    'suggestion_data' => $suggestionData,
                    'is_direct_analog' => $isDirectAnalog,
                    'notes' => $notes
                ]);
                
                // Проверяем, нужно ли создать новую запчасть
                if (!$suggestion->analog_spare_part_id && 
                    isset($suggestionData['analog_article']) && 
                    isset($suggestionData['analog_brand']) &&
                    !empty($suggestionData['analog_article']) && 
                    !empty($suggestionData['analog_brand'])) {
                    
                    // Проверяем, существует ли уже такая запчасть
                    $existingPart = \App\Models\SparePart::where('part_number', $suggestionData['analog_article'])
                        ->where('manufacturer', $suggestionData['analog_brand'])
                        ->first();
                    
                    if ($existingPart) {
                        // Если запчасть уже существует, используем ее
                        $suggestion->analog_spare_part_id = $existingPart->id;
                        $suggestion->save();
                        \Log::info('Using existing spare part', ['id' => $existingPart->id]);
                    } else {
                        // Создаем новую запчасть
                        $newPart = new \App\Models\SparePart();
                        $newPart->name = $suggestionData['analog_description'] ?? $suggestionData['analog_article'];
                        $newPart->part_number = $suggestionData['analog_article'];
                        $newPart->manufacturer = $suggestionData['analog_brand'];
                        $newPart->description = $suggestionData['analog_description'] ?? '';
                        $newPart->price = 0; // Цена будет установлена позже
                        $newPart->stock_quantity = 0; // Количество будет установлено позже
                        $newPart->category_id = $suggestion->sparePart ? $suggestion->sparePart->category_id : 1;
                        $newPart->is_available = true;
                        $newPart->save();
                        
                        // Обновляем suggestion с новым ID запчасти
                        $suggestion->analog_spare_part_id = $newPart->id;
                        $suggestion->save();
                        \Log::info('Created new spare part', ['id' => $newPart->id]);
                    }
                }
                
                // Создаем запись об аналоге
                if ($suggestion->analog_spare_part_id && $suggestion->spare_part_id) {
                    $analogRelation = \App\Models\SparePartAnalog::updateOrCreate(
                        [
                            'spare_part_id' => $suggestion->spare_part_id,
                            'analog_spare_part_id' => $suggestion->analog_spare_part_id,
                        ],
                        [
                            'is_direct' => $isDirectAnalog,
                            'notes' => $notes,
                            'is_verified' => true,
                        ]
                    );
                    
                    \Log::info('Created analog relation', [
                        'spare_part_id' => $suggestion->spare_part_id,
                        'analog_spare_part_id' => $suggestion->analog_spare_part_id
                    ]);
                    
                    // Также добавляем обратную связь (другая запчасть тоже аналог для текущей)
                    // Это нужно только для прямых аналогов
                    if ($isDirectAnalog) {
                        \App\Models\SparePartAnalog::updateOrCreate(
                            [
                                'spare_part_id' => $suggestion->analog_spare_part_id,
                                'analog_spare_part_id' => $suggestion->spare_part_id,
                            ],
                            [
                                'is_direct' => true,
                                'notes' => $notes,
                                'is_verified' => true,
                            ]
                        );
                        \Log::info('Created reverse analog relation');
                    }
                } else {
                    \Log::warning('Missing required IDs for analog relation', [
                        'spare_part_id' => $suggestion->spare_part_id,
                        'analog_spare_part_id' => $suggestion->analog_spare_part_id
                    ]);
                }
            } elseif ($suggestion->suggestion_type === 'compatibility') {
                // Создаем запись о совместимости
                if ($suggestion->spare_part_id && $suggestion->car_model_id) {
                    $compatibilityData = [
                        'spare_part_id' => $suggestion->spare_part_id,
                        'car_model_id' => $suggestion->car_model_id,
                        'notes' => $suggestion->comment ?? '',
                        'is_verified' => true,
                    ];
                    
                    \Log::info('Processing compatibility suggestion', [
                        'spare_part_id' => $suggestion->spare_part_id,
                        'car_model_id' => $suggestion->car_model_id,
                        'data' => $suggestion->data
                    ]);
                    
                    // Проверяем и конвертируем data в массив, если это не массив
                    $data = is_array($suggestion->data) ? $suggestion->data : [];
                    
                    // Если есть данные о двигателе, добавляем в таблицу car_engine_spare_part
                    if (!empty($data['car_engine_id'])) {
                        $compatibilityData['car_engine_id'] = $data['car_engine_id'];
                        \Log::info('Adding engine data', ['car_engine_id' => $data['car_engine_id']]);
                        
                        // Проверяем существование двигателя
                        $engine = \App\Models\CarEngine::find($data['car_engine_id']);
                        \Log::info('Engine exists check:', [
                            'engine_id' => $data['car_engine_id'],
                            'exists' => $engine ? true : false,
                            'engine_data' => $engine ? $engine->toArray() : null
                        ]);
                        
                        // Добавляем запись в таблицу car_engine_spare_part
                        if ($engine) {
                            $sparePart = \App\Models\SparePart::find($suggestion->spare_part_id);
                            if ($sparePart) {
                                // Используем syncWithoutDetaching для добавления связи без удаления существующих
                                $sparePart->carEngines()->syncWithoutDetaching([
                                    $data['car_engine_id'] => [
                                        'notes' => $suggestion->comment ?? null
                                    ]
                                ]);
                                \Log::info('Added record to car_engine_spare_part table', [
                                    'spare_part_id' => $suggestion->spare_part_id,
                                    'car_engine_id' => $data['car_engine_id']
                                ]);
                            } else {
                                \Log::error('Spare part not found for engine compatibility', [
                                    'spare_part_id' => $suggestion->spare_part_id
                                ]);
                            }
                        } else {
                            \Log::error('Engine not found for compatibility', [
                                'car_engine_id' => $data['car_engine_id']
                            ]);
                        }
                    }
                    
                    // Всегда добавляем запись в таблицу spare_part_compatibilities для модели автомобиля
                    // Если есть данные о годах выпуска, добавляем их
                    if (!empty($data['start_year'])) {
                        $compatibilityData['start_year'] = $data['start_year'];
                    }
                    if (!empty($data['end_year'])) {
                        $compatibilityData['end_year'] = $data['end_year'];
                    }
                    
                    // Проверяем существование запчасти и модели автомобиля
                    $sparePart = \App\Models\SparePart::find($suggestion->spare_part_id);
                    $carModel = \App\Models\CarModel::find($suggestion->car_model_id);
                    
                    if (!$sparePart || !$carModel) {
                        \Log::error('Required entities not found:', [
                            'spare_part_exists' => $sparePart ? true : false,
                            'car_model_exists' => $carModel ? true : false,
                            'spare_part_id' => $suggestion->spare_part_id,
                            'car_model_id' => $suggestion->car_model_id
                        ]);
                        
                        throw new \Exception('Не найдена запчасть или модель автомобиля');
                    }
                    
                    \Log::info('Checking entities existence:', [
                        'spare_part_exists' => $sparePart ? true : false,
                        'car_model_exists' => $carModel ? true : false,
                        'spare_part_data' => $sparePart ? [
                            'id' => $sparePart->id,
                            'name' => $sparePart->name,
                            'part_number' => $sparePart->part_number
                        ] : null,
                        'car_model_data' => $carModel ? [
                            'id' => $carModel->id,
                            'name' => $carModel->name,
                            'brand_id' => $carModel->brand_id
                        ] : null
                    ]);
                    
                    // Проверяем структуру таблицы совместимостей
                    $columns = \Schema::getColumnListing('spare_part_compatibilities');
                    \Log::info('Spare part compatibilities table columns:', $columns);
                    
                    try {
                        // Проверим, существует ли уже такая совместимость 
                        // и явно удалим ее, если она существует с другим набором данных (проблема с уникальным индексом)
                        $existing = \App\Models\SparePartCompatibility::where('spare_part_id', $suggestion->spare_part_id)
                            ->where('car_model_id', $suggestion->car_model_id)
                            ->where(function($query) use ($compatibilityData) {
                                if (isset($compatibilityData['car_engine_id'])) {
                                    $query->where('car_engine_id', $compatibilityData['car_engine_id']);
                                } else {
                                    $query->whereNull('car_engine_id');
                                }
                            })
                            ->first();
                            
                        if ($existing) {
                            \Log::info('Found existing compatibility, updating it', [
                                'id' => $existing->id,
                                'existing_data' => $existing->toArray(),
                                'new_data' => $compatibilityData
                            ]);
                            
                            $existing->fill($compatibilityData);
                            $existing->save();
                            $compatibility = $existing;
                        } else {
                            // Создаем новую запись о совместимости
                            $compatibility = \App\Models\SparePartCompatibility::create($compatibilityData);
                            \Log::info('Created new compatibility relation', [
                                'id' => $compatibility->id,
                                'data' => $compatibilityData
                            ]);
                        }
                    } catch (\Exception $e) {
                        \Log::error('Error creating compatibility relation', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                            'compatibility_data' => $compatibilityData
                        ]);
                        throw new \Exception('Ошибка при создании совместимости: ' . $e->getMessage());
                    }
                } else {
                    \Log::error('Missing required IDs for compatibility relation', [
                        'spare_part_id' => $suggestion->spare_part_id,
                        'car_model_id' => $suggestion->car_model_id
                    ]);
                    throw new \Exception('Не указаны обязательные данные: ID запчасти или модели автомобиля');
                }
            } else {
                \Log::error('Unknown suggestion type', [
                    'type' => $suggestion->suggestion_type
                ]);
                throw new \Exception('Неизвестный тип предложения: ' . $suggestion->suggestion_type);
            }
            
            // Обновляем статус предложения
            $suggestion->status = 'approved';
            $suggestion->approved_by = \Illuminate\Support\Facades\Auth::id();
            $suggestion->approved_at = now();
            $suggestion->save();
            
            \Log::info('Suggestion approved successfully', [
                'id' => $suggestion->id,
                'approved_by' => $suggestion->approved_by
            ]);
            
            // Добавляем небольшую задержку перед перенаправлением
            // Убираем задержку для AJAX запросов
            if (!request()->expectsJson()) {
                sleep(1);
            }
            
            DB::commit();
            
            // Возвращаем JSON-ответ для AJAX-запроса
            if (request()->expectsJson() || request()->header('Accept') === 'application/json') {
                return response()->json([
                    'success' => true,
                    'message' => 'Предложение успешно одобрено'
                ]);
            }
            
            return redirect()->route('admin.suggestions.index')
                ->with('success', 'Предложение успешно одобрено');
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error approving suggestion', [
                'id' => $suggestion->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'suggestion_data' => [
                    'id' => $suggestion->id,
                    'type' => $suggestion->suggestion_type,
                    'spare_part_id' => $suggestion->spare_part_id,
                    'car_model_id' => $suggestion->car_model_id,
                    'data' => $suggestion->data
                ]
            ]);
            
            // Возвращаем JSON-ответ с ошибкой для AJAX-запроса
            if (request()->expectsJson() || request()->header('Accept') === 'application/json') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при одобрении предложения: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->route('admin.suggestions.index')
                ->with('error', 'Ошибка при одобрении предложения: ' . $e->getMessage());
        }
    }

    /**
     * Отображение списка предложений пользователей
     */
    public function indexInertia()
    {
        // Получаем все предложения с загрузкой отношений
        $suggestions = UserSuggestion::query()
            ->with([
                'user', 
                'approvedBy'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Загружаем запчасти для каждого предложения напрямую
        foreach ($suggestions as $suggestion) {
            if ($suggestion->spare_part_id) {
                $sparePart = SparePart::find($suggestion->spare_part_id);
                if ($sparePart) {
                    $suggestion->setRelation('sparePart', $sparePart);
                }
            }
            
            if ($suggestion->analog_spare_part_id) {
                $analogPart = SparePart::find($suggestion->analog_spare_part_id);
                if ($analogPart) {
                    $suggestion->setRelation('analogSparePart', $analogPart);
                }
            }
            
            if ($suggestion->car_model_id) {
                $suggestion->load(['carModel.brand']);
            }
        }

        // Добавляем дополнительную информацию для предложений совместимости
        foreach ($suggestions as $suggestion) {
            if ($suggestion->suggestion_type === 'compatibility') {
                // Загружаем информацию о двигателе, если он указан
                if (!empty($suggestion->data['car_engine_id'])) {
                    $engine = DB::table('car_engines')
                        ->where('id', $suggestion->data['car_engine_id'])
                        ->first();
                    
                    if ($engine) {
                        $suggestion->engine = $engine;
                    }
                }
                
                // Загружаем информацию о бренде, если он указан
                if (!empty($suggestion->data['car_brand_id'])) {
                    $brand = DB::table('car_brands')
                        ->where('id', $suggestion->data['car_brand_id'])
                        ->first();
                    
                    if ($brand) {
                        $suggestion->brand = $brand;
                    }
                }
            }
        }

        return Inertia::render('Admin/Suggestions/Index', [
            'suggestions' => $suggestions,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    /**
     * Отображение детальной информации о предложении
     */
    public function showInertia(UserSuggestion $suggestion)
    {
        try {
            // Предварительно загружаем базовую информацию о предложении
            $suggestion->load(['user', 'approvedBy']);
            
            // Проверка существования отношений в модели
            $relations = get_class_methods($suggestion);
            Log::debug('Доступные методы в модели UserSuggestion:', $relations);
            
            // Проверка существования запчастей в базе данных
            $sparePart = null;
            $analogPart = null;
            
            if ($suggestion->spare_part_id) {
                $sparePart = SparePart::with('category')->find($suggestion->spare_part_id);
                Log::debug('Загружена основная запчасть:', [
                    'id' => $suggestion->spare_part_id,
                    'exists' => $sparePart ? true : false,
                    'name' => $sparePart ? $sparePart->name : null,
                ]);
            }
            
            if ($suggestion->analog_spare_part_id) {
                $analogPart = SparePart::with('category')->find($suggestion->analog_spare_part_id);
                Log::debug('Загружена запчасть-аналог:', [
                    'id' => $suggestion->analog_spare_part_id,
                    'exists' => $analogPart ? true : false,
                    'name' => $analogPart ? $analogPart->name : null,
                ]);
            }
            
            // Принудительно устанавливаем отношения
            if ($sparePart) {
                $suggestion->setRelation('sparePart', $sparePart);
            }
            
            if ($analogPart) {
                $suggestion->setRelation('analogSparePart', $analogPart);
            }
            
            // Загружаем дополнительные отношения для совместимости
            if ($suggestion->suggestion_type === 'compatibility') {
                // Загружаем модель автомобиля
                if ($suggestion->car_model_id) {
                    $carModel = CarModel::with('brand')->find($suggestion->car_model_id);
                    if ($carModel) {
                        $suggestion->setRelation('carModel', $carModel);
                        Log::info("Загружена модель автомобиля: {$carModel->brand->name} {$carModel->name}");
                    } else {
                        Log::warning("Модель автомобиля с ID: {$suggestion->car_model_id} не найдена");
                    }
                }
                
                // Если в данных есть ID двигателя, загружаем информацию о нем
                if (!empty($suggestion->data['car_engine_id'])) {
                    $engineId = $suggestion->data['car_engine_id'];
                    $engine = CarEngine::find($engineId);
                    
                    if ($engine) {
                        $suggestion->engine = $engine;
                        Log::info("Загружен двигатель: {$engine->name}");
                    } else {
                        Log::warning("Двигатель с ID: {$engineId} не найден");
                    }
                }
            }

            // Определяем тип аналога
            $analogTypeText = '';
            if ($suggestion->suggestion_type === 'analog') {
                if (isset($suggestion->data['analog_type'])) {
                    $analogTypes = [
                        'direct' => 'Прямой аналог',
                        'indirect' => 'Неполный аналог',
                        'universal' => 'Универсальный аналог',
                        'original' => 'Оригинал',
                        'analog' => 'Аналог',
                        'substitute' => 'Заменитель'
                    ];
                    $analogTypeText = $analogTypes[$suggestion->data['analog_type']] ?? 'Неизвестный тип';
                }
            }

            return Inertia::render('Admin/Suggestions/Show', [
                'suggestion' => $suggestion,
                'analogTypeText' => $analogTypeText,
                'can' => [
                    'approve' => Auth::user()->can('approve', $suggestion),
                    'reject' => Auth::user()->can('reject', $suggestion),
                ],
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при отображении предложения:', [
                'suggestion_id' => $suggestion->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('admin.suggestions.index')
                ->with('error', 'Ошибка при загрузке предложения: ' . $e->getMessage());
        }
    }

    /**
     * Отклонение предложения пользователя
     */
    public function reject(Request $request, UserSuggestion $suggestion)
    {
        \Log::info('Запрос на отклонение предложения получен', [
            'id' => $suggestion->id,
            'type' => $suggestion->suggestion_type,
            'request_method' => request()->method(),
            'request_headers' => request()->headers->all(),
            'request_data' => $request->all(),
        ]);
        
        try {
            DB::beginTransaction();
            
            // Получаем комментарий администратора
            $adminComment = $request->input('admin_comment', 'Отклонено администратором');
            
            // Обновляем статус предложения
            $suggestion->status = 'rejected';
            $suggestion->admin_comment = $adminComment;
            $suggestion->approved_by = Auth::id();
            $suggestion->approved_at = now();
            $suggestion->save();
            
            \Log::info('Suggestion rejected successfully', [
                'id' => $suggestion->id,
                'admin_comment' => $adminComment
            ]);
            
            DB::commit();
            
            // Возвращаем JSON-ответ для AJAX-запроса
            if (request()->expectsJson() || request()->header('Accept') === 'application/json') {
                return response()->json([
                    'success' => true,
                    'message' => 'Предложение успешно отклонено'
                ]);
            }
            
            return redirect()->route('admin.suggestions.index')
                ->with('success', 'Предложение успешно отклонено');
        } catch (\Exception $e) {
            Log::error('Ошибка при отклонении предложения:', [
                'suggestion_id' => $suggestion->id,
                'error' => $e->getMessage()
            ]);
            
            // Возвращаем JSON-ответ с ошибкой для AJAX-запроса
            if (request()->expectsJson() || request()->header('Accept') === 'application/json') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при отклонении предложения: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->route('admin.suggestions.index')
                ->with('error', 'Ошибка при отклонении предложения: ' . $e->getMessage());
        }
    }

    /**
     * Удаление предложения
     */
    public function destroy(UserSuggestion $suggestion)
    {
        try {
            $suggestion->delete();
            
            // Возвращаем JSON-ответ для AJAX-запроса
            if (request()->expectsJson() || request()->header('Accept') === 'application/json') {
                return response()->json([
                    'success' => true,
                    'message' => 'Предложение успешно удалено'
                ]);
            }
            
            return redirect()->route('admin.suggestions.index')
                ->with('success', 'Предложение успешно удалено');
        } catch (\Exception $e) {
            Log::error('Ошибка при удалении предложения:', [
                'suggestion_id' => $suggestion->id,
                'error' => $e->getMessage()
            ]);
            
            // Возвращаем JSON-ответ с ошибкой для AJAX-запроса
            if (request()->expectsJson() || request()->header('Accept') === 'application/json') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при удалении предложения: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->route('admin.suggestions.index')
                ->with('error', 'Ошибка при удалении предложения: ' . $e->getMessage());
        }
    }
} 