<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CarEngineController extends Controller
{
    /**
     * Получить список двигателей для указанной модели автомобиля
     *
     * @param  int  $modelId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEnginesByModel($modelId)
    {
        try {
            // Проверяем существование модели
            $model = DB::table('car_models')
                ->where('car_models.id', $modelId)
                ->first();
            
            if (!$model) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Модель не найдена'
                ], 404);
            }
            
            // Получаем информацию о бренде отдельным запросом
            $brand = DB::table('car_brands')
                ->where('id', $model->brand_id)
                ->first();
                
            // Если бренд найден, добавляем его название к модели
            if ($brand) {
                $model->brand_name = $brand->name;
            } else {
                $model->brand_name = 'Неизвестный бренд';
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
                    if (!isset($groupedEngines['другой'])) {
                        $groupedEngines['другой'] = [];
                    }
                    $groupedEngines['другой'][] = $engine;
                }
            }
            
            // Удаляем пустые группы
            foreach ($groupedEngines as $type => $typeEngines) {
                if (empty($typeEngines)) {
                    unset($groupedEngines[$type]);
                }
            }
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'model' => $model,
                    'engines' => $engines,
                    'grouped_engines' => $groupedEngines
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении данных: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
    
    /**
     * Получить информацию о конкретном двигателе
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            // Получаем двигатель по ID
            $engine = DB::table('car_engines')
                ->where('id', $id)
                ->first();
            
            if (!$engine) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Двигатель не найден'
                ], 404);
            }
            
            // Получаем информацию о модели
            $model = DB::table('car_models')
                ->where('id', $engine->model_id)
                ->first();
                
            // Получаем информацию о бренде
            $brand = null;
            if ($model && $model->brand_id) {
                $brand = DB::table('car_brands')
                    ->where('id', $model->brand_id)
                    ->first();
            }
            
            // Добавляем информацию о модели и бренде к двигателю
            $engine->model_name = $model ? $model->name : 'Неизвестная модель';
            $engine->brand_name = $brand ? $brand->name : 'Неизвестный бренд';
            
            return response()->json([
                'status' => 'success',
                'data' => $engine
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении информации о двигателе: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Получить категории запчастей для указанного двигателя
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPartCategories($id)
    {
        try {
            // Проверяем существование двигателя
            $engine = DB::table('car_engines')
                ->where('car_engines.id', $id)
                ->first();
            
            if (!$engine) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Двигатель не найден'
                ], 404);
            }
            
            // Получаем модель отдельным запросом
            $model = DB::table('car_models')
                ->where('id', $engine->model_id)
                ->first();
            
            if ($model) {
                $engine->model_name = $model->name;
                $engine->model_id = $model->id;
                
                // Получаем бренд отдельным запросом
                $brand = DB::table('car_brands')
                    ->where('id', $model->brand_id)
                    ->first();
                
                if ($brand) {
                    $engine->brand_name = $brand->name;
                    $engine->brand_id = $brand->id;
                } else {
                    $engine->brand_name = 'Неизвестный бренд';
                    $engine->brand_id = 0;
                }
            } else {
                $engine->model_name = 'Неизвестная модель';
                $engine->model_id = 0;
                $engine->brand_name = 'Неизвестный бренд';
                $engine->brand_id = 0;
            }
            
            // Получаем все категории запчастей
            $categories = DB::table('part_categories')
                ->orderBy('name', 'asc')
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'engine' => $engine,
                    'categories' => $categories
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении категорий запчастей: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
} 