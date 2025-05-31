<?php

namespace App\Http\Controllers;

use App\Models\UserSuggestion;
use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\SparePartAnalog;
use App\Models\SparePartCompatibility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
        
        return Inertia::render('Parts/SuggestCompatibilityForm', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'sparePart' => $sparePart,
            'carModels' => $carModels
        ]);
    }
    
    /**
     * Сохранение предложения аналога
     */
    public function storeAnalog(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'analog_article' => 'required|string|max:100',
            'analog_brand' => 'required|string|max:100',
            'analog_description' => 'required|string|max:255',
            'comment' => 'nullable|string|max:500',
            'analog_type' => 'required|in:direct,partial',
        ]);
        
        // Нормализуем артикул для дальнейшего поиска (приводим к верхнему регистру)
        $normalizedArticle = strtoupper($validated['analog_article']);
        $validated['analog_article'] = $normalizedArticle;
        
        // Проверяем, не существует ли уже запчасть с таким артикулом, используя UPPER для игнорирования регистра
        $analogPart = SparePart::whereRaw('UPPER(part_number) = ?', [$normalizedArticle])
            ->where('manufacturer', $validated['analog_brand'])
            ->first();
            
        // Если такой запчасти нет, сохраним информацию для будущего создания
        $analogPartId = null;
        if ($analogPart) {
            $analogPartId = $analogPart->id;
            
            // Проверяем, не существует ли уже такой аналог
            $existingAnalog = SparePartAnalog::where('spare_part_id', $sparePart->id)
                ->where('analog_spare_part_id', $analogPartId)
                ->first();
                
            if ($existingAnalog) {
                return redirect()->route('parts.show', $sparePart)
                    ->with('info', 'Этот аналог уже существует в системе.');
            }
        }

        // Сохраняем предложение
        $suggestion = new UserSuggestion();
        $suggestion->user_id = Auth::id();
        $suggestion->suggestion_type = 'analog';
        $suggestion->spare_part_id = $sparePart->id;
        $suggestion->analog_spare_part_id = $analogPartId; // Может быть null
        $suggestion->comment = $validated['comment'];
        $suggestion->status = 'pending';
        
        // Сохраняем дополнительную информацию об аналоге
        $suggestion->data = [
            'is_direct' => $validated['analog_type'] === 'direct',
            'analog_type' => $validated['analog_type'],
            'analog_article' => $normalizedArticle, // Сохраняем нормализованный артикул (в верхнем регистре)
            'analog_brand' => $validated['analog_brand'],
            'analog_description' => $validated['analog_description'],
            'need_create_part' => ($analogPartId === null) // Флаг, что нужно создать новую запчасть
        ];
        
        $suggestion->save();
        
        return redirect()->route('parts.show', $sparePart)
            ->with('success', "Ваше предложение аналога ({$validated['analog_brand']} {$normalizedArticle}) отправлено на модерацию. Спасибо за вклад!");
    }
    
    /**
     * Сохранение предложения совместимости
     */
    public function storeCompatibility(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'car_model_id' => 'required|exists:car_models,id',
            'start_year' => 'nullable|integer|min:1900|max:2100',
            'end_year' => 'nullable|integer|min:1900|max:2100|gte:start_year',
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
                'car_model_id' => $validated['car_model_id'],
                'start_year' => $validated['start_year'] ?? null,
                'end_year' => $validated['end_year'] ?? null,
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
        
        $suggestions = UserSuggestion::with(['sparePart', 'analogSparePart', 'carModel', 'user'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
            
        return view('admin.suggestions.index', compact('suggestions'));
    }
    
    /**
     * Отображение деталей предложения для администратора
     */
    public function adminShow(UserSuggestion $suggestion)
    {
        $this->authorize('manage-suggestions');
        
        return view('admin.suggestions.show', compact('suggestion'));
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
            SparePartCompatibility::create([
                'spare_part_id' => $suggestion->spare_part_id,
                'car_model_id' => $suggestion->car_model_id,
                'notes' => $suggestion->comment,
            ]);
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
} 