<?php

namespace App\Http\Controllers;

use App\Models\UserSuggestion;
use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\SparePartAnalog;
use App\Models\SparePartCompatibility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserSuggestionController extends Controller
{
    /**
     * Отображение формы для создания предложения аналога
     */
    public function createAnalogForm(SparePart $sparePart)
    {
        $spareParts = SparePart::where('id', '!=', $sparePart->id)->get();
        return view('suggestions.create-analog', compact('sparePart', 'spareParts'));
    }
    
    /**
     * Отображение формы для создания предложения совместимости
     */
    public function createCompatibility(SparePart $sparePart)
    {
        $carModels = CarModel::with('brand')->orderBy('name')->get();
        return view('suggestions.create-compatibility', compact('sparePart', 'carModels'));
    }
    
    /**
     * Сохранение предложения аналога
     */
    public function storeAnalog(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'analog_spare_part_id' => 'required|exists:spare_parts,id',
            'comment' => 'nullable|string|max:500',
        ]);
        
        $suggestion = new UserSuggestion();
        $suggestion->user_id = Auth::id();
        $suggestion->suggestion_type = 'analog';
        $suggestion->spare_part_id = $sparePart->id;
        $suggestion->analog_spare_part_id = $validated['analog_spare_part_id'];
        $suggestion->comment = $validated['comment'];
        $suggestion->status = 'pending';
        $suggestion->save();
        
        return redirect()->route('spare-parts.show', $sparePart)
            ->with('success', 'Ваше предложение аналога отправлено на модерацию. Спасибо за вклад!');
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

        return redirect()->route('spare-parts.show', $sparePart)
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