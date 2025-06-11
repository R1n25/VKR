<?php

namespace App\Http\Controllers\API;

use App\Services\SparePartService;
use App\Services\SparePartSearchService;
use App\Services\SparePartCompatibilityService;
use App\Services\AnalogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\SparePart;

/**
 * Контроллер API для работы с запчастями
 */
class SparePartController extends BaseSparePartController
{
    /**
     * @var SparePartSearchService
     */
    protected $sparePartSearchService;

    /**
     * @var SparePartCompatibilityService
     */
    protected $compatibilityService;

    /**
     * Конструктор с внедрением зависимостей
     * 
     * @param SparePartService $sparePartService
     * @param SparePartSearchService $sparePartSearchService
     * @param SparePartCompatibilityService $compatibilityService
     * @param AnalogService $analogService
     */
    public function __construct(
        SparePartService $sparePartService,
        SparePartSearchService $sparePartSearchService,
        SparePartCompatibilityService $compatibilityService,
        AnalogService $analogService
    ) {
        parent::__construct($sparePartService, $analogService);
        $this->sparePartSearchService = $sparePartSearchService;
        $this->compatibilityService = $compatibilityService;
    }

    /**
     * Получить список всех запчастей с возможностью фильтрации
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $isAdmin = $this->isAdmin($request);
            $limit = $request->input('limit', 12);
            $page = $request->input('page', 1);
            $filters = $request->only(['category_id', 'brand_id', 'model_id', 'engine_id', 'sort_by', 'sort_order']);
            
            $result = $this->sparePartService->getPaginatedSpareParts($page, $limit, $filters, $isAdmin);
            
            return $this->successResponse($result);
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при получении списка запчастей');
            return $this->errorResponse('Произошла ошибка при получении списка запчастей', $e->getMessage(), 500);
        }
    }

    /**
     * Поиск запчастей по названию или артикулу
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        try {
            // Получаем параметры запроса
            $query = $request->input('query') ?? $request->input('q'); // Поддерживаем оба варианта параметра
            $originalQuery = $request->input('original_query'); // Для отладки
            $limit = $request->input('limit', 50);
            $isAdmin = $this->isAdmin($request);
            
            // Логируем начало поиска с деталями запроса
            Log::info("API поиск запчастей: '{$query}'", [
                'original_query' => $originalQuery ?? $query,
                'query' => $query,
                'lowercase_query' => strtolower($query),
                'client_ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent')
            ]);
            
            // Проверяем, что запрос не пустой
            if (empty($query)) {
                return $this->successResponse([], 'Пустой поисковый запрос');
            }
            
            // Проверяем, не выглядит ли запрос как артикул
            $isArticleSearch = preg_match('/^[A-Za-z0-9-]+$/', $query);
            
            // Получаем результаты поиска через сервис
            $results = $this->sparePartSearchService->searchSpareParts($query, $isAdmin);
            
            // Ограничиваем количество результатов
            $results = $results->take($limit);
            
            // Логируем результаты поиска
            Log::info("API поиск запчастей: найдено {$results->count()} результатов", [
                'query' => $query,
                'results_count' => $results->count(),
                'first_result_id' => $results->first() ? $results->first()->id : null,
                'first_result_name' => $results->first() ? $results->first()->name : null
            ]);
            
            return $this->successResponse([
                'items' => $results,
                'query' => $query,
                'is_article_search' => $isArticleSearch,
                'total' => $results->count(),
            ], 'Результаты поиска');
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при поиске запчастей');
            return $this->errorResponse('Произошла ошибка при поиске запчастей', $e->getMessage(), 500);
        }
    }

    /**
     * Получить информацию о конкретной запчасти
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $part = $this->sparePartService->getPartById($id);
            
            if (!$part) {
                return $this->errorResponse('Запчасть не найдена', null, 404);
            }
            
            // Получаем связанные запчасти той же категории и марки
            $relatedParts = $this->sparePartService->getSimilarParts($id, 4);
            
            return $this->successResponse([
                'part' => $part,
                'related_parts' => $relatedParts
            ]);
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при получении информации о запчасти');
            return $this->errorResponse('Произошла ошибка при получении информации о запчасти', $e->getMessage(), 500);
        }
    }

    /**
     * Получить полную информацию о запчасти по ID
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFullInfo($id)
    {
        try {
            $part = $this->sparePartService->getPartById($id);
            
            if (!$part) {
                return $this->errorResponse('Запчасть не найдена', null, 404);
            }
            
            return $this->successResponse($part);
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при получении полной информации о запчасти');
            return $this->errorResponse('Произошла ошибка при получении информации о запчасти', $e->getMessage(), 500);
        }
    }

    /**
     * Получение детальной информации о запчасти
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function showDetails($id, Request $request)
    {
        try {
            $isAdmin = $this->isAdmin($request);
            $part = $this->sparePartService->getSparePartById($id, $isAdmin);
            
            if (!$part) {
                return $this->errorResponse('Запчасть не найдена', null, 404);
            }
            
            // Получаем аналоги запчасти
            $analogs = $this->analogService->getAnalogs($id);
            
            // Получаем совместимые автомобили
            $compatibilities = $this->compatibilityService->getCompatibilities($id);
            
            return $this->successResponse([
                'part' => $part,
                'analogs' => $analogs,
                'compatibilities' => $compatibilities
            ], 'Информация о запчасти');
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при получении детальной информации о запчасти');
            return $this->errorResponse('Произошла ошибка при получении информации о запчасти', $e->getMessage(), 500);
        }
    }

    /**
     * Получение списка аналогов для запчасти
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAnalogs($id, Request $request)
    {
        try {
            // Определяем, является ли пользователь администратором
            $isAdmin = $this->isAdmin($request);
            
            // Получаем процент наценки для пользователя
            $markupPercent = null;
            if ($isAdmin) {
                $user = $request->user();
                $markupPercent = $user ? $user->markup_percent : null;
            }
            
            // Получаем аналоги с учетом роли пользователя
            $analogs = $this->analogService->getAnalogs($id, $isAdmin, $markupPercent);
            
            return $this->successResponse($analogs, 'Список аналогов');
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при получении аналогов');
            return $this->errorResponse('Произошла ошибка при получении аналогов', $e->getMessage(), 500);
        }
    }

    /**
     * Получение списка совместимых автомобилей для запчасти
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCompatibilities($id)
    {
        try {
            $compatibilities = $this->compatibilityService->getCompatibilities($id);
            
            return $this->successResponse($compatibilities, 'Список совместимых автомобилей');
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при получении совместимостей');
            return $this->errorResponse('Произошла ошибка при получении совместимостей', $e->getMessage(), 500);
        }
    }

    /**
     * Получение подсказок для поиска запчастей
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchSuggestions(Request $request)
    {
        try {
            $query = $request->input('q', '');
            $originalQuery = $request->input('original_query', $query); // Для отладки
            $limit = $request->input('limit', 10);
            $type = $request->input('type', 'text'); // Тип поиска: text или article
            
            // Добавляем логирование для отладки
            \Log::info('Запрос подсказок поиска', [
                'original_query' => $originalQuery,
                'query' => $query,
                'lowercase_query' => strtolower($query),
                'type' => $type,
                'limit' => $limit,
                'client_ip' => $request->ip()
            ]);
            
            if (empty($query) || strlen($query) < 2) {
                return $this->successResponse([
                    'suggestions' => []
                ]);
            }
            
            // Получаем подсказки в зависимости от типа поиска
            if ($type === 'article') {
                // Для поиска по артикулу используем специальный метод
                // Преобразуем запрос к нижнему регистру для поиска
                $suggestions = $this->sparePartSearchService->getArticleSuggestions(strtolower($query), $limit);
                
                // Логируем результаты для артикула
                \Log::info('Результаты подсказок для артикула', [
                    'original_query' => $originalQuery,
                    'query' => $query,
                    'count' => count($suggestions),
                    'suggestions' => $suggestions
                ]);
            } else {
                // Для текстового поиска используем стандартный метод
                // Преобразуем запрос к нижнему регистру для поиска
                $suggestions = $this->sparePartSearchService->getSearchSuggestions(strtolower($query), $limit);
                
                // Логируем результаты для текстового поиска
                \Log::info('Результаты подсказок для текста', [
                    'original_query' => $originalQuery,
                    'query' => $query,
                    'count' => count($suggestions),
                    'suggestions' => $suggestions
                ]);
            }
            
            return $this->successResponse([
                'suggestions' => $suggestions
            ]);
        } catch (\Exception $e) {
            $this->logError($e, 'Ошибка при получении подсказок поиска');
            return $this->errorResponse('Произошла ошибка при получении подсказок поиска', $e->getMessage(), 500);
        }
    }

    /**
     * Проверяет существование запчасти по ID
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function exists($id)
    {
        // Загружаем запчасть вместе с категорией
        $sparePart = SparePart::with('category')->find($id);
        $exists = $sparePart !== null;
        
        // Если запчасть найдена, добавляем информацию о категории
        if ($exists) {
            if ($sparePart->category) {
                $sparePart->category_name = $sparePart->category->name;
            } else if ($sparePart->category_id) {
                // Если категория не загружена, но есть ID категории, загружаем название категории из базы данных
                $category = \App\Models\PartCategory::find($sparePart->category_id);
                if ($category) {
                    $sparePart->category_name = $category->name;
                }
            }
        }
        
        return response()->json([
            'exists' => $exists,
            'id' => $id,
            'spare_part' => $exists ? $sparePart : null
        ]);
    }
} 