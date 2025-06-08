<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CarEngine;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnginePartController extends Controller
{
    /**
     * Привязать запчасть к двигателю
     * 
     * @param  int  $engineId
     * @param  int  $partId
     * @return \Illuminate\Http\JsonResponse
     */
    public function attachPartToEngine($engineId, $partId)
    {
        try {
            $engine = CarEngine::findOrFail($engineId);
            $part = SparePart::findOrFail($partId);
            
            $engine->spareParts()->syncWithoutDetaching([$partId]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Запчасть успешно привязана к двигателю',
                'data' => [
                    'engine' => $engine->name,
                    'part' => $part->name
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при привязке запчасти к двигателю: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Отвязать запчасть от двигателя
     * 
     * @param  int  $engineId
     * @param  int  $partId
     * @return \Illuminate\Http\JsonResponse
     */
    public function detachPartFromEngine($engineId, $partId)
    {
        try {
            $engine = CarEngine::findOrFail($engineId);
            $part = SparePart::findOrFail($partId);
            
            $engine->spareParts()->detach($partId);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Запчасть успешно отвязана от двигателя',
                'data' => [
                    'engine' => $engine->name,
                    'part' => $part->name
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при отвязке запчасти от двигателя: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Получить все запчасти для конкретного двигателя
     * 
     * @param  int  $engineId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPartsByEngine($engineId)
    {
        try {
            $engine = CarEngine::with('spareParts')->findOrFail($engineId);
            $carModel = $engine->carModel;
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'engine' => $engine,
                    'car_model' => $carModel,
                    'parts' => $engine->spareParts
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении запчастей двигателя: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Получить все двигатели, с которыми совместима запчасть
     * 
     * @param  int  $partId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEnginesByPart($partId)
    {
        try {
            $part = SparePart::with('carEngines')->findOrFail($partId);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'part' => $part,
                    'engines' => $part->carEngines
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении двигателей для запчасти: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Обновить примечания к связи двигателя и запчасти
     * 
     * @param  Request  $request
     * @param  int  $engineId
     * @param  int  $partId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateNotes(Request $request, $engineId, $partId)
    {
        try {
            $engine = CarEngine::findOrFail($engineId);
            $part = SparePart::findOrFail($partId);
            
            $engine->spareParts()->updateExistingPivot($partId, [
                'notes' => $request->notes
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Примечания успешно обновлены',
                'data' => [
                    'engine' => $engine->name,
                    'part' => $part->name,
                    'notes' => $request->notes
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при обновлении примечаний: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Массовая привязка запчастей к двигателю
     *
     * @param  Request  $request
     * @param  int  $engineId
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkAttachPartsToEngine(Request $request, $engineId)
    {
        try {
            $engine = CarEngine::findOrFail($engineId);
            $partIds = $request->part_ids;
            
            if (!is_array($partIds) || count($partIds) === 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Необходимо указать массив ID запчастей'
                ], 400);
            }
            
            $engine->spareParts()->syncWithoutDetaching($partIds);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Запчасти успешно привязаны к двигателю',
                'data' => [
                    'engine' => $engine->name,
                    'attached_parts_count' => count($partIds)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при массовой привязке запчастей: ' . $e->getMessage()
            ], 500);
        }
    }
} 