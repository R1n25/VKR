<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EngineController extends Controller
{
    /**
     * Показать список двигателей для выбранной модели
     *
     * @param  int  $modelId
     * @return \Illuminate\View\View
     */
    public function showEngines($modelId)
    {
        // Получаем информацию о модели
        $model = DB::table('car_models')
            ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
            ->select('car_models.*', 'car_brands.name as brand_name')
            ->where('car_models.id', $modelId)
            ->first();
        
        if (!$model) {
            abort(404, 'Модель не найдена');
        }
        
        // Получаем двигатели для модели
        $engines = DB::table('car_engines')
            ->where('model_id', $modelId)
            ->orderBy('volume', 'asc')
            ->orderBy('power', 'asc')
            ->get();
        
        // Группируем двигатели по типу для удобства отображения
        $groupedEngines = [
            'бензиновый' => [],
            'дизельный' => [],
            'гибрид' => [],
            'электро' => []
        ];
        
        foreach ($engines as $engine) {
            if (isset($groupedEngines[$engine->type])) {
                $groupedEngines[$engine->type][] = $engine;
            } else {
                $groupedEngines['другой'][] = $engine;
            }
        }
        
        // Удаляем пустые группы
        foreach ($groupedEngines as $type => $typeEngines) {
            if (empty($typeEngines)) {
                unset($groupedEngines[$type]);
            }
        }
        
        return view('engines.index', [
            'model' => $model,
            'engines' => $engines,
            'groupedEngines' => $groupedEngines
        ]);
    }
    
    /**
     * Показать категории запчастей для выбранного двигателя
     *
     * @param  int  $engineId
     * @return \Illuminate\View\View
     */
    public function showPartCategories($engineId)
    {
        // Получаем информацию о двигателе
        $engine = DB::table('car_engines')
            ->join('car_models', 'car_engines.model_id', '=', 'car_models.id')
            ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
            ->select('car_engines.*', 'car_models.name as model_name', 'car_brands.name as brand_name')
            ->where('car_engines.id', $engineId)
            ->first();
        
        if (!$engine) {
            abort(404, 'Двигатель не найден');
        }
        
        // Получаем категории запчастей
        $categories = DB::table('part_categories')
            ->orderBy('name', 'asc')
            ->get();
        
        return view('parts.categories', [
            'engine' => $engine,
            'categories' => $categories
        ]);
    }
} 