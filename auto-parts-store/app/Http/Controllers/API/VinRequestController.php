<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\VinRequest;
use App\Models\CarModel;
use App\Models\PartScheme;
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
            'vin' => 'required|string|size:17'
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
                    'vehicle_info' => $data,
                    // Извлекаем основную информацию из ответа API
                    'make' => $this->extractFromResponse($data, 'Make'),
                    'model' => $this->extractFromResponse($data, 'Model'),
                    'year' => $this->extractFromResponse($data, 'ModelYear'),
                    'engine' => $this->extractFromResponse($data, 'EngineModel'),
                    'transmission' => $this->extractFromResponse($data, 'TransmissionStyle'),
                    'body_type' => $this->extractFromResponse($data, 'BodyClass')
                ]);

                // Находим соответствующую модель автомобиля в нашей базе
                $carModel = CarModel::where('name', 'like', "%{$vinRequest->model}%")
                    ->whereHas('brand', function ($query) use ($vinRequest) {
                        $query->where('name', 'like', "%{$vinRequest->make}%");
                    })
                    ->first();

                // Получаем схемы запчастей для данной модели
                $schemes = $carModel ? PartScheme::where('car_model_id', $carModel->id)
                    ->with(['category', 'parts'])
                    ->get()
                    : collect();

                return response()->json([
                    'success' => true,
                    'message' => 'VIN успешно декодирован',
                    'data' => [
                        'vin_request' => $vinRequest,
                        'car_model' => $carModel,
                        'schemes' => $schemes
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
     * Получить схемы запчастей для автомобиля
     */
    public function getSchemes(string $vin)
    {
        $vinRequest = VinRequest::where('vin', $vin)
            ->latest()
            ->firstOrFail();

        $carModel = CarModel::where('name', 'like', "%{$vinRequest->model}%")
            ->whereHas('brand', function ($query) use ($vinRequest) {
                $query->where('name', 'like', "%{$vinRequest->make}%");
            })
            ->firstOrFail();

        $schemes = PartScheme::where('car_model_id', $carModel->id)
            ->with(['category', 'parts'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'schemes' => $schemes,
                'car_info' => $vinRequest
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