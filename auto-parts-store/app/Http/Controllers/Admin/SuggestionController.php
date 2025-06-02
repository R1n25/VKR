<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePartAnalog;
use App\Models\SparePartCompatibility;
use App\Models\UserSuggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SuggestionController extends Controller
{
    public function approve(UserSuggestion $suggestion)
    {
        DB::beginTransaction();
        
        try {
            if ($suggestion->suggestion_type === 'analog') {
                // Получаем данные об аналоге
                $suggestionData = $suggestion->data ?? [];
                $isDirectAnalog = $suggestionData['is_direct'] ?? true;
                $notes = $suggestion->comment;
                
                // Проверяем, нужно ли создать новую запчасть
                if (!empty($suggestionData['need_create_part']) && $suggestionData['need_create_part']) {
                    // Проверяем, существует ли уже запчасть с таким артикулом
                    $partNumber = strtoupper($suggestionData['analog_article']);
                    $existingPart = \App\Models\SparePart::where('part_number', $partNumber)
                        ->first();
                    
                    if ($existingPart) {
                        // Если запчасть уже существует, используем её ID
                        $suggestion->analog_spare_part_id = $existingPart->id;
                        $suggestion->save();
                    } else {
                        // Создаем новую запчасть из предложенных данных
                        $newPart = new \App\Models\SparePart();
                        $newPart->name = $suggestionData['analog_description'];
                        $newPart->part_number = $partNumber;
                        $newPart->manufacturer = $suggestionData['analog_brand'];
                        $newPart->slug = \Illuminate\Support\Str::slug($suggestionData['analog_brand'] . '-' . $partNumber);
                        $newPart->description = $suggestionData['analog_description'];
                        $newPart->price = 0; // Цена будет установлена позже
                        $newPart->stock_quantity = 0; // Количество будет установлено позже
                        $newPart->is_available = false; // Запчасть недоступна, пока не будет заполнена информация
                        $newPart->category_id = $suggestion->sparePart->category_id; // Используем ту же категорию
                        $newPart->save();
                        
                        // Обновляем suggestion с новым ID запчасти
                        $suggestion->analog_spare_part_id = $newPart->id;
                        $suggestion->save();
                    }
                }
                
                // Создаем запись об аналоге
                if ($suggestion->analog_spare_part_id) {
                    SparePartAnalog::updateOrCreate(
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
                    
                    // Также добавляем обратную связь (другая запчасть тоже аналог для текущей)
                    // Это нужно только для прямых аналогов
                    if ($isDirectAnalog) {
                        SparePartAnalog::updateOrCreate(
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
                    }
                }
            } elseif ($suggestion->suggestion_type === 'compatibility') {
                // Создаем запись о совместимости
                $data = $suggestion->data;
                
                SparePartCompatibility::updateOrCreate(
                    [
                        'spare_part_id' => $data['spare_part_id'],
                        'car_model_id' => $data['car_model_id'],
                    ],
                    [
                        'start_year' => $data['start_year'] ?? null,
                        'end_year' => $data['end_year'] ?? null,
                        'notes' => $suggestion->comment,
                        'is_verified' => true,
                    ]
                );
            }
            
            // Обновляем статус предложения
            $suggestion->status = 'approved';
            $suggestion->approved_by = auth()->id();
            $suggestion->approved_at = now();
            $suggestion->save();
            
            DB::commit();
            
            return redirect()->route('admin.suggestions.inertia')
                ->with('success', 'Предложение успешно одобрено.');
        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('admin.suggestions.inertia')
                ->with('error', 'Ошибка при одобрении предложения: ' . $e->getMessage());
        }
    }

    /**
     * Отображение списка предложений пользователей
     */
    public function index()
    {
        $suggestions = UserSuggestion::with(['user', 'sparePart', 'analogSparePart', 'carModel.brand', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return view('admin.suggestions.index', compact('suggestions'));
    }

    /**
     * Отображение списка предложений пользователей через Inertia
     */
    public function indexInertia()
    {
        $suggestions = UserSuggestion::with(['user', 'sparePart', 'analogSparePart', 'carModel', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

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
    public function show(UserSuggestion $suggestion)
    {
        $suggestion->load(['user', 'sparePart', 'analogSparePart', 'carModel.brand', 'approvedBy']);
        
        // Подготовка дополнительных данных для отображения
        $analogTypeText = 'Прямой аналог';
        
        if ($suggestion->suggestion_type === 'analog' && !empty($suggestion->data)) {
            $analogType = $suggestion->data['analog_type'] ?? 'direct';
            $analogTypeText = $analogType === 'direct' ? 'Прямой аналог' : 'Заменитель';
        }
        
        return view('admin.suggestions.show', compact('suggestion', 'analogTypeText'));
    }

    /**
     * Отображение детальной информации о предложении через Inertia
     */
    public function showInertia(UserSuggestion $suggestion)
    {
        $suggestion->load(['user', 'sparePart', 'analogSparePart', 'carModel.brand']);

        $analogTypeText = '';
        if ($suggestion->suggestion_type == 'analog' && isset($suggestion->data['analog_type'])) {
            $analogTypes = [
                'direct' => 'Прямой аналог',
                'indirect' => 'Непрямой аналог',
                'universal' => 'Универсальный аналог'
            ];
            $analogTypeText = $analogTypes[$suggestion->data['analog_type']] ?? 'Неизвестный тип';
        }

        return Inertia::render('Admin/Suggestions/Show', [
            'suggestion' => $suggestion,
            'analogTypeText' => $analogTypeText,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    /**
     * Отклонение предложения пользователя
     */
    public function reject(Request $request, UserSuggestion $suggestion)
    {
        $validated = $request->validate([
            'admin_comment' => 'required|string|max:1000',
        ]);
        
        $suggestion->status = 'rejected';
        $suggestion->admin_comment = $validated['admin_comment'];
        $suggestion->approved_by = auth()->id();
        $suggestion->approved_at = now();
        $suggestion->save();
        
        return redirect()->route('admin.suggestions.inertia')
            ->with('success', 'Предложение отклонено.');
    }

    /**
     * Удаление предложения пользователя
     */
    public function destroy(UserSuggestion $suggestion)
    {
        try {
            // Сохраняем информацию о предложении для сообщения
            $suggestionType = $suggestion->suggestion_type === 'analog' ? 'аналога' : 'совместимости';
            
            // Удаляем предложение
            $suggestion->delete();
            
            return redirect()->route('admin.suggestions.inertia')
                ->with('success', "Предложение {$suggestionType} успешно удалено.");
        } catch (\Exception $e) {
            return redirect()->route('admin.suggestions.inertia')
                ->with('error', 'Ошибка при удалении предложения: ' . $e->getMessage());
        }
    }
} 