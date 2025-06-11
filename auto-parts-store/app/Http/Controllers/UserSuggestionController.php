<?php

namespace App\Http\Controllers;

use App\Models\UserSuggestion;
use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\SparePartAnalog;
use App\Models\SparePartCompatibility;
use App\Models\CarBrand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class UserSuggestionController extends Controller
{
    /**
     * Отображение формы для создания предложения аналога
     */
    public function createAnalog(SparePart $sparePart)
    {
        return Inertia::render('Parts/SuggestAnalogForm', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'sparePart' => $sparePart
        ]);
    }
    
    /**
     * Отображение формы для создания предложения совместимости
     */
    public function createCompatibility(SparePart $sparePart)
    {
        $carModels = CarModel::with('brand')->orderBy('name')->get();
        $carBrands = CarBrand::orderBy('name')->get();
        
        return Inertia::render('Parts/SuggestCompatibilityForm', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'sparePart' => $sparePart,
            'carModels' => $carModels,
            'carBrands' => $carBrands
        ]);
    }
    
    /**
     * Сохранение предложения аналога запчасти
     */
    public function storeAnalog(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'analog_article' => 'required|string|max:50',
            'analog_brand' => 'required|string|max:100',
            'analog_description' => 'nullable|string|max:1000',
            'analog_type' => 'required|in:direct,indirect,universal',
            'comment' => 'nullable|string|max:1000',
        ]);
        
        // Проверяем, существует ли уже такая запчасть в базе
        $existingPart = SparePart::where('part_number', $validated['analog_article'])
            ->where('manufacturer', $validated['analog_brand'])
            ->first();
        
        $suggestionData = [
            'analog_article' => $validated['analog_article'],
            'analog_brand' => $validated['analog_brand'],
            'analog_description' => $validated['analog_description'],
            'analog_type' => $validated['analog_type'],
            'need_create_part' => !$existingPart,
        ];
        
        // Создаем запись о предложении
        $suggestion = new UserSuggestion();
        $suggestion->user_id = Auth::id();
        $suggestion->suggestion_type = 'analog';
        $suggestion->spare_part_id = $sparePart->id;
        
        // Если аналог уже существует в базе, сохраняем ссылку на него
        if ($existingPart) {
            $suggestion->analog_spare_part_id = $existingPart->id;
        }
        
        $suggestion->comment = $validated['comment'];
        $suggestion->status = 'pending';
        $suggestion->data = $suggestionData;
        $suggestion->save();
        
        return redirect()->route('spare-parts.show', $sparePart->id)
            ->with('success', 'Ваше предложение аналога успешно отправлено на модерацию.');
    }
    
    /**
     * Сохранение предложения совместимости
     */
    public function storeCompatibility(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'car_brand_id' => 'required|exists:car_brands,id',
            'car_model_id' => 'required|exists:car_models,id',
            'car_engine_id' => 'nullable|exists:car_engines,id',
            'comment' => 'nullable|string|max:1000',
        ]);

        $suggestion = new UserSuggestion([
            'user_id' => auth()->id(),
            'suggestion_type' => 'compatibility',
            'spare_part_id' => $sparePart->id,
            'car_model_id' => $validated['car_model_id'],
            'status' => 'pending',
            'comment' => $validated['comment'] ?? null,
            'data' => [
                'spare_part_id' => $sparePart->id,
                'car_brand_id' => $validated['car_brand_id'],
                'car_model_id' => $validated['car_model_id'],
                'car_engine_id' => $validated['car_engine_id'] ?? null,
            ]
        ]);

        $suggestion->save();

        return redirect()->route('parts.show', $sparePart)
            ->with('success', 'Ваше предложение о совместимости успешно отправлено и будет рассмотрено администратором.');
    }
    
    /**
     * Отображение списка предложений для администратора
     */
    public function adminIndex()
    {
        $this->authorize('manage-suggestions');
        
        $suggestions = UserSuggestion::with(['sparePart', 'analogSparePart', 'carModel.brand', 'user'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
            
        // Для каждого предложения совместимости загружаем дополнительную информацию
        foreach ($suggestions as $suggestion) {
            if ($suggestion->suggestion_type === 'compatibility') {
                // Если в данных есть ID двигателя, загружаем информацию о нем
                if (!empty($suggestion->data['car_engine_id'])) {
                    $engine = DB::table('car_engines')
                        ->where('id', $suggestion->data['car_engine_id'])
                        ->first();
                    
                    if ($engine) {
                        $suggestion->engine = $engine;
                    }
                }
                
                // Если в данных есть ID бренда, загружаем информацию о нем
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
        ]);
    }
    
    /**
     * Отображение деталей предложения для администратора
     */
    public function adminShow(UserSuggestion $suggestion)
    {
        $this->authorize('manage-suggestions');
        
        // Загружаем дополнительные связи для предложения совместимости
        if ($suggestion->suggestion_type === 'compatibility') {
            $suggestion->load(['carModel.brand']);
            
            // Если в данных есть ID двигателя, загружаем информацию о нем
            if (!empty($suggestion->data['car_engine_id'])) {
                $engine = DB::table('car_engines')
                    ->where('id', $suggestion->data['car_engine_id'])
                    ->first();
                
                if ($engine) {
                    $suggestion->engine = $engine;
                }
            }
            
            // Если в данных есть ID бренда, загружаем информацию о нем
            if (!empty($suggestion->data['car_brand_id'])) {
                $brand = DB::table('car_brands')
                    ->where('id', $suggestion->data['car_brand_id'])
                    ->first();
                
                if ($brand) {
                    $suggestion->brand = $brand;
                }
            }
        }
        
        return Inertia::render('Admin/Suggestions/Show', [
            'suggestion' => $suggestion,
            'analogTypeText' => $suggestion->suggestion_type === 'analog' && isset($suggestion->data['analog_type']) 
                ? ($suggestion->data['analog_type'] === 'direct' ? 'Прямой аналог' : 'Неполный аналог') 
                : null,
        ]);
    }
    
    /**
     * Одобрение предложения администратором
     */
    public function approve(Request $request, UserSuggestion $suggestion)
    {
        $this->authorize('manage-suggestions');
        
        $validated = $request->validate([
            'admin_comment' => 'nullable|string|max:500',
        ]);
        
        // Обновляем статус предложения
        $suggestion->status = 'approved';
        $suggestion->admin_comment = $validated['admin_comment'] ?? null;
        $suggestion->approved_by = Auth::id();
        $suggestion->approved_at = now();
        $suggestion->save();
        
        // В зависимости от типа предложения, создаем соответствующую запись
        if ($suggestion->isAnalogSuggestion()) {
            SparePartAnalog::create([
                'spare_part_id' => $suggestion->spare_part_id,
                'analog_spare_part_id' => $suggestion->analog_spare_part_id,
                'is_direct' => true,
                'notes' => $suggestion->comment,
            ]);
        } elseif ($suggestion->isCompatibilitySuggestion()) {
            // Если указан двигатель, создаем запись о совместимости только с двигателем
            if (!empty($suggestion->data['car_engine_id'])) {
                $engine = \App\Models\CarEngine::find($suggestion->data['car_engine_id']);
                
                if ($engine) {
                    // Добавляем запись в таблицу car_engine_spare_part
                    SparePart::find($suggestion->spare_part_id)->carEngines()->syncWithoutDetaching([
                        $suggestion->data['car_engine_id'] => [
                            'notes' => $suggestion->comment ?? null
                        ]
                    ]);
                    
                    \Log::info('Added engine compatibility record', [
                        'spare_part_id' => $suggestion->spare_part_id,
                        'car_engine_id' => $suggestion->data['car_engine_id']
                    ]);
                }
            } else {
                // Если двигатель не указан, создаем запись о совместимости только с моделью
                $compatibilityData = [
                    'spare_part_id' => $suggestion->spare_part_id,
                    'car_model_id' => $suggestion->car_model_id,
                    'notes' => $suggestion->comment,
                ];
                
                SparePartCompatibility::create($compatibilityData);
            }
        }
        
        return redirect()->route('admin.suggestions.index')
            ->with('success', 'Предложение успешно одобрено и добавлено в базу данных.');
    }
    
    /**
     * Отклонение предложения администратором
     */
    public function reject(Request $request, UserSuggestion $suggestion)
    {
        $this->authorize('manage-suggestions');
        
        $validated = $request->validate([
            'admin_comment' => 'required|string|max:500',
        ]);
        
        $suggestion->status = 'rejected';
        $suggestion->admin_comment = $validated['admin_comment'];
        $suggestion->approved_by = Auth::id();
        $suggestion->approved_at = now();
        $suggestion->save();
        
        return redirect()->route('admin.suggestions.index')
            ->with('success', 'Предложение отклонено.');
    }

    /**
     * Отображение формы для создания предложения аналога по ID запчасти
     */
    public function createAnalogById($id)
    {
        $sparePart = \App\Models\SparePart::findOrFail($id);
        return $this->createAnalog($sparePart);
    }
    
    /**
     * Отображение формы для создания предложения совместимости по ID запчасти
     */
    public function createCompatibilityById($id)
    {
        $sparePart = \App\Models\SparePart::findOrFail($id);
        return $this->createCompatibility($sparePart);
    }

    /**
     * Сохранение предложения аналога запчасти по ID
     */
    public function storeAnalogById(Request $request, $id)
    {
        $sparePart = \App\Models\SparePart::findOrFail($id);
        return $this->storeAnalog($request, $sparePart);
    }
    
    /**
     * Сохранение предложения совместимости по ID
     */
    public function storeCompatibilityById(Request $request, $id)
    {
        $sparePart = \App\Models\SparePart::findOrFail($id);
        return $this->storeCompatibility($request, $sparePart);
    }
} 