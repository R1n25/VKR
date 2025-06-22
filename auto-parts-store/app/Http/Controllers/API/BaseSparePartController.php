<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\SparePartService;
use App\Services\AnalogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Базовый контроллер для работы с запчастями
 * 
 * Содержит общую функциональность для всех контроллеров запчастей
 */
class BaseSparePartController extends Controller
{
    /**
     * @var SparePartService
     */
    protected $sparePartService;

    /**
     * @var AnalogService
     */
    protected $analogService;

    /**
     * Конструктор с внедрением зависимостей
     * 
     * @param SparePartService $sparePartService
     * @param AnalogService $analogService
     */
    public function __construct(SparePartService $sparePartService, AnalogService $analogService)
    {
        $this->sparePartService = $sparePartService;
        $this->analogService = $analogService;
    }

    /**
     * Проверка, является ли пользователь администратором
     * 
     * @param Request $request
     * @return bool
     */
    protected function isAdmin(Request $request): bool
    {
        return $request->user() && $request->user()->is_admin;
    }

    /**
     * Стандартный формат успешного ответа API
     * 
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @return \Illuminate\Http\JsonResponse
     */
    protected function successResponse($data, string $message = 'Успешно', int $statusCode = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $statusCode);
    }

    /**
     * Стандартный формат ответа с ошибкой
     * 
     * @param string $message
     * @param mixed $errors
     * @param int $statusCode
     * @return \Illuminate\Http\JsonResponse
     */
    protected function errorResponse(string $message, $errors = null, int $statusCode = 400)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Логирование ошибки с дополнительным контекстом
     * 
     * @param \Exception $exception
     * @param string $context
     * @return void
     */
    protected function logError(\Exception $exception, string $context = 'API'): void
    {
        Log::error("{$context} ошибка: " . $exception->getMessage(), [
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
} 