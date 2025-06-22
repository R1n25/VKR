<?php

namespace App\Http\Controllers;

use App\Models\SparePart;
use App\Services\SparePartService;
use App\Services\AnalogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PartDetailController extends Controller
{
    protected $sparePartService;
    protected $analogService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(SparePartService $sparePartService, AnalogService $analogService)
    {
        $this->sparePartService = $sparePartService;
        $this->analogService = $analogService;
    }

    /**
     * Отображение детальной информации о запчасти
     *
     * @param int $id ID запчасти
     * @return \Inertia\Response
     */
    public function show($id)
    {
        try {
            // Проверяем, является ли пользователь администратором
            $isAdmin = auth()->check() && auth()->user()->is_admin;
            
            // Получаем информацию о запчасти с учетом роли пользователя
            $part = $this->sparePartService->getSparePartById($id, $isAdmin);
            
            if (!$part) {
                // Если запчасть не найдена, перенаправляем на страницу поиска
                return redirect()->route('search')->with('error', 'Запчасть не найдена');
            }
            
            // Загружаем категорию запчасти
            if ($part->category_id) {
                $category = \App\Models\PartCategory::find($part->category_id);
                if ($category) {
                    $part->category_name = $category->name;
                }
            }
            
            // Получаем аналоги запчасти с учетом полной транзитивности
            $analogs = $this->getFullTransitiveAnalogs($id, $isAdmin);
            
            // Получаем совместимости запчасти с двигателями
            $compatibilities = app(\App\Services\SparePartCompatibilityService::class)->getCarEngineSparePartData($id);
            
            // Получаем похожие запчасти той же категории
            $similarParts = [];
            try {
                if ($part->category_id) {
                    $similarQuery = SparePart::where('category_id', $part->category_id)
                        ->where('id', '!=', $id)
                        ->where('is_active', true);
                    
                    if (!$isAdmin) {
                        $similarQuery->where('is_available', true)
                            ->where('stock_quantity', '>', 0);
                    }
                    
                    $rawSimilarParts = $similarQuery->limit(4)->get();
                    
                    // Форматируем похожие запчасти
                    foreach ($rawSimilarParts as $similarPart) {
                        $formattedPart = [
                            'id' => $similarPart->id,
                            'name' => $similarPart->name,
                            'part_number' => $similarPart->part_number,
                            'manufacturer' => $similarPart->manufacturer,
                            'price' => $isAdmin ? $similarPart->price : ($similarPart->price * 1.25),
                            'stock_quantity' => $similarPart->stock_quantity,
                            'is_available' => $similarPart->is_available
                        ];
                        
                        $similarParts[] = $formattedPart;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Ошибка при получении похожих запчастей для ID ' . $id . ': ' . $e->getMessage());
            }
            
            // Преобразуем запчасть в массив для передачи во фронтенд
            $partData = $part->toArray();
            
            return Inertia::render('Parts/Detail', [
                'auth' => [
                    'user' => auth()->user(),
                ],
                'part' => $partData,
                'analogs' => $analogs,
                'similarParts' => $similarParts,
                'compatibilities' => $compatibilities,
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при отображении детальной информации о запчасти ID ' . $id . ': ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // В случае ошибки перенаправляем на страницу поиска
            return redirect()->route('search')->with('error', 'Произошла ошибка при загрузке информации о запчасти');
        }
    }
    
    /**
     * Получить все аналоги для запчасти с учетом полной транзитивности
     * 
     * @param int $partId ID запчасти
     * @param bool $isAdmin Является ли пользователь администратором
     * @return array Массив аналогов
     */
    private function getFullTransitiveAnalogs($partId, $isAdmin)
    {
        try {
            // Получаем карту аналогов с типами связей
            $analogMap = $this->analogService->getAnalogMap($partId);
            
            if (empty($analogMap)) {
                return [];
            }
            
            // Массив ID аналогов
            $analogIds = array_keys($analogMap);
            
            // Получаем полную информацию о запчастях по их ID
            $analogParts = $this->sparePartService->getPartsByIds($analogIds, $isAdmin)->toArray();
            
            // Добавляем информацию о типе связи к каждому аналогу
            foreach ($analogParts as &$analogPart) {
                $id = $analogPart['id'];
                if (isset($analogMap[$id])) {
                    $analogPart['analog_type'] = $analogMap[$id]['type'];
                    
                    // Определяем пользовательский текст для типа аналога
                    if ($analogMap[$id]['type'] === 'direct') {
                        $analogPart['relation_type'] = 'Прямой аналог';
                    } else {
                        $analogPart['relation_type'] = 'Косвенный аналог (через общие аналоги)';
                    }
                }
            }
            
            // Сортировка: сначала прямые аналоги, потом косвенные
            usort($analogParts, function($a, $b) {
                if ($a['analog_type'] === 'direct' && $b['analog_type'] !== 'direct') {
                    return -1;
                } elseif ($a['analog_type'] !== 'direct' && $b['analog_type'] === 'direct') {
                    return 1;
                } else {
                    return 0;
                }
            });
            
            return $analogParts;
        } catch (\Exception $e) {
            Log::error('Ошибка при получении полных транзитивных аналогов: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return [];
        }
    }

    /**
     * Добавить аналог для запчасти
     *
     * @param Request $request
     * @param int $id ID запчасти
     * @return \Illuminate\Http\RedirectResponse
     */
    public function addAnalog(Request $request, $id)
    {
        try {
            $request->validate([
                'analog_id' => 'required|numeric|min:1',
                'analog_type' => 'required|string|max:50',
            ]);
            
            $analogId = $request->input('analog_id');
            $analogType = $request->input('analog_type', 'alternative');
            
            // Проверяем существование запчастей
            $sparePart = DB::table('spare_parts')->where('id', $id)->first();
            $analogPart = DB::table('spare_parts')->where('id', $analogId)->first();
            
            if (!$sparePart || !$analogPart) {
                return redirect()->back()->with('error', 'Одна из запчастей не найдена');
            }
            
            // Проверяем существование таблицы аналогов
            $tableExists = DB::getSchemaBuilder()->hasTable('spare_part_analogs');
            if (!$tableExists) {
                // Создаем таблицу, если она не существует
                DB::statement('
                    CREATE TABLE IF NOT EXISTS spare_part_analogs (
                        id SERIAL PRIMARY KEY,
                        spare_part_id INTEGER NOT NULL,
                        analog_spare_part_id INTEGER NOT NULL,
                        analog_type VARCHAR(50) DEFAULT \'alternative\',
                        created_at TIMESTAMP,
                        updated_at TIMESTAMP,
                        CONSTRAINT spare_part_analogs_unique UNIQUE (spare_part_id, analog_spare_part_id)
                    )
                ');
                Log::info("Таблица spare_part_analogs создана");
            }
            
            // Проверяем, не существует ли уже такой связи
            $exists = DB::table('spare_part_analogs')
                ->where(function($query) use ($id, $analogId) {
                    $query->where('spare_part_id', $id)
                          ->where('analog_spare_part_id', $analogId);
                })
                ->orWhere(function($query) use ($id, $analogId) {
                    $query->where('spare_part_id', $analogId)
                          ->where('analog_spare_part_id', $id);
                })
                ->exists();
            
            if ($exists) {
                return redirect()->back()->with('warning', 'Связь между этими запчастями уже существует');
            }
            
            // Добавляем связь между запчастями
            DB::table('spare_part_analogs')->insert([
                'spare_part_id' => $id,
                'analog_spare_part_id' => $analogId,
                'analog_type' => $analogType,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            Log::info("Создана связь между запчастями $id и $analogId типа $analogType");
            
            // Очищаем кеш
            // Перенаправляем обратно на страницу
            return redirect()->back()->with('success', 'Аналог успешно добавлен');
        } catch (\Exception $e) {
            Log::error('Ошибка при добавлении аналога: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Произошла ошибка при добавлении аналога');
        }
    }
    
    /**
     * Удалить связь между запчастями
     *
     * @param Request $request
     * @param int $id ID запчасти
     * @param int $analogId ID аналога
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeAnalog(Request $request, $id, $analogId)
    {
        try {
            // Удаляем связь между запчастями
            DB::table('spare_part_analogs')
                ->where(function($query) use ($id, $analogId) {
                    $query->where('spare_part_id', $id)
                          ->where('analog_spare_part_id', $analogId);
                })
                ->orWhere(function($query) use ($id, $analogId) {
                    $query->where('spare_part_id', $analogId)
                          ->where('analog_spare_part_id', $id);
                })
                ->delete();
            
            Log::info("Удалена связь между запчастями $id и $analogId");
            
            // Перенаправляем обратно на страницу
            return redirect()->back()->with('success', 'Аналог успешно удален');
        } catch (\Exception $e) {
            Log::error('Ошибка при удалении аналога: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Произошла ошибка при удалении аналога');
        }
    }
} 