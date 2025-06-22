<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\VinRequest;
use App\Models\CarModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VinRequestController extends Controller
{
    /**
     * Создать новый запрос по VIN
     */
    public function decode(Request $request)
    {
        $validated = $request->validate([
            'vin' => 'required|string|size:17',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255',
            'phone' => 'nullable|string|max:20',
            'parts_description' => 'nullable|string',
        ]);

        try {
            // TODO: Заменить на реальный API-ключ
            $apiKey = config('services.car_api.key');
            
            // Здесь будет вызов реального API для декодирования VIN
            // Это пример с использованием NHTSA API (бесплатный)
            $response = Http::get("https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{$validated['vin']}?format=json");
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Создаем запись о VIN-запросе
                $vinRequest = VinRequest::create([
                    'vin' => $validated['vin'],
                    'user_id' => $request->user()?->id,
                    'name' => $validated['name'] ?? null,
                    'email' => $validated['email'] ?? null,
                    'phone' => $validated['phone'] ?? null,
                    'parts_description' => $validated['parts_description'] ?? null,
                    'status' => 'pending',
                ]);

                // Находим соответствующую модель автомобиля в нашей базе
                $carModel = CarModel::where('name', 'like', "%{$this->extractFromResponse($data, 'Model')}%")
                    ->whereHas('brand', function ($query) use ($data) {
                        $query->where('name', 'like', "%{$this->extractFromResponse($data, 'Make')}%");
                    })
                    ->first();

                return response()->json([
                    'success' => true,
                    'message' => 'VIN-запрос успешно создан',
                    'data' => [
                        'vin_request' => $vinRequest,
                        'car_model' => $carModel,
                        'vin_data' => [
                            'make' => $this->extractFromResponse($data, 'Make'),
                            'model' => $this->extractFromResponse($data, 'Model'),
                            'year' => $this->extractFromResponse($data, 'ModelYear'),
                            'engine' => $this->extractFromResponse($data, 'EngineModel'),
                            'transmission' => $this->extractFromResponse($data, 'TransmissionStyle'),
                            'body_type' => $this->extractFromResponse($data, 'BodyClass')
                        ]
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Не удалось декодировать VIN'
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при обработке запроса',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить информацию о VIN-коде
     */
    public function getVinInfo(string $vin)
    {
        $vinRequest = VinRequest::where('vin', $vin)
            ->latest()
            ->firstOrFail();

        // Используем данные API из ответа для поиска модели
        $response = Http::get("https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{$vin}?format=json");
        $data = $response->json();
        
        $make = $this->extractFromResponse($data, 'Make');
        $model = $this->extractFromResponse($data, 'Model');

        $carModel = CarModel::where('name', 'like', "%{$model}%")
            ->whereHas('brand', function ($query) use ($make) {
                $query->where('name', 'like', "%{$make}%");
            })
            ->first();

        if (!$carModel) {
            return response()->json([
                'success' => false,
                'message' => 'Модель автомобиля не найдена в нашей базе данных'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'car_info' => [
                    'vin' => $vin,
                    'make' => $make,
                    'model' => $model,
                    'year' => $this->extractFromResponse($data, 'ModelYear'),
                    'engine' => $this->extractFromResponse($data, 'EngineModel')
                ],
                'car_model' => $carModel
            ]
        ]);
    }

    /**
     * Извлечь значение из ответа API
     */
    private function extractFromResponse($data, $variable)
    {
        if (isset($data['Results'])) {
            foreach ($data['Results'] as $result) {
                if ($result['Variable'] === $variable) {
                    return $result['Value'];
                }
            }
        }
        return null;
    }
} 