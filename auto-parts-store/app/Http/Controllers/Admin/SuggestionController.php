<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePartAnalog;
use App\Models\SparePartCompatibility;
use App\Models\UserSuggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuggestionController extends Controller
{
    public function approve(UserSuggestion $suggestion)
    {
        DB::beginTransaction();
        
        try {
            if ($suggestion->suggestion_type === 'analog') {
                // Создаем запись об аналоге
                SparePartAnalog::updateOrCreate(
                    [
                        'spare_part_id' => $suggestion->spare_part_id,
                        'analog_spare_part_id' => $suggestion->analog_spare_part_id,
                    ],
                    [
                        'is_verified' => true,
                    ]
                );
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
            
            return redirect()->route('admin.suggestions.index')
                ->with('success', 'Предложение успешно одобрено.');
        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('admin.suggestions.index')
                ->with('error', 'Ошибка при одобрении предложения: ' . $e->getMessage());
        }
    }

    /**
     * Отображение списка предложений пользователей
     */
    public function index()
    {
        $suggestions = UserSuggestion::with(['user', 'sparePart', 'analogSparePart', 'carModel'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return view('admin.suggestions.index', compact('suggestions'));
    }

    /**
     * Отображение детальной информации о предложении
     */
    public function show(UserSuggestion $suggestion)
    {
        $suggestion->load(['user', 'sparePart', 'analogSparePart', 'carModel', 'approvedBy']);
        
        return view('admin.suggestions.show', compact('suggestion'));
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
        
        return redirect()->route('admin.suggestions.index')
            ->with('success', 'Предложение отклонено.');
    }
} 