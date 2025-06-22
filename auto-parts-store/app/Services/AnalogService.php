<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnalogService
{
    /**
     * Получить все аналоги для запчасти, включая транзитивные
     * 
     * @param int $partId ID запчасти
     * @return array Массив ID аналогов
     */
    public function getAllAnalogs(int $partId): array
    {
        // Создаем пустой граф связей
        $graph = [];
        
        try {
            // Проверяем существование таблицы spare_part_analogs
            Log::info("Проверка существования таблицы аналогов для partId: $partId");
            
            $tableExists = DB::getSchemaBuilder()->hasTable('spare_part_analogs');
            Log::info("Таблица spare_part_analogs " . ($tableExists ? "существует" : "НЕ существует"));
            
            if (!$tableExists) {
                Log::warning("Таблица spare_part_analogs не существует, создаем");
                $this->createSparePartAnalogsTable();
            }
            
            // Подсчитываем количество записей в таблице
            $count = DB::table('spare_part_analogs')->count();
            Log::info("Записей в таблице spare_part_analogs: $count");
            
            // Проверяем наличие прямых аналогов для указанного ID
            $directCount = DB::table('spare_part_analogs')
                ->where('spare_part_id', $partId)
                ->orWhere('analog_spare_part_id', $partId)
                ->count();
            Log::info("Прямых аналогов для partId $partId: $directCount");
            
            // Выводим список прямых аналогов
            $directAnalogs = DB::table('spare_part_analogs')
                ->where('spare_part_id', $partId)
                ->orWhere('analog_spare_part_id', $partId)
                ->get();
            
            // Создаем массив для прямых аналогов
            $directAnalogIds = [];
            foreach ($directAnalogs as $analog) {
                $analogId = ($analog->spare_part_id == $partId) 
                    ? $analog->analog_spare_part_id 
                    : $analog->spare_part_id;
                $directAnalogIds[] = $analogId;
                Log::info("Прямой аналог: $analogId (тип: " . ($analog->analog_type ?? 'alternative') . ")");
            }
            
            // Шаг 1: Построение графа связей из таблицы spare_part_analogs
            $this->buildAnalogGraph($graph);
            Log::info("График связей построен, узлов: " . count($graph));
            
            // Шаг 2: Получение всех связанных запчастей для указанного ID
            $connectedParts = $this->findAllConnected($graph, $partId);
            Log::info("Найдено связанных запчастей: " . count($connectedParts));
            
            // Исключаем из результата исходную запчасть
            if (($key = array_search($partId, $connectedParts)) !== false) {
                unset($connectedParts[$key]);
            }
            
            // Если аналогов не найдено через граф, но есть прямые аналоги, используем их
            if (empty($connectedParts) && !empty($directAnalogIds)) {
                Log::info("Аналоги через граф не найдены, используем прямые аналоги");
                $connectedParts = $directAnalogIds;
            }
            
            // Проверяем, включены ли все прямые аналоги в список связанных запчастей
            foreach ($directAnalogIds as $directId) {
                if (!in_array($directId, $connectedParts)) {
                    Log::warning("Прямой аналог $directId не найден в списке связанных запчастей, добавляем его");
                    $connectedParts[] = $directId;
                }
            }
            
            // Шаг 3: Расширяем список аналогов, добавляя связи через промежуточные запчасти
            $expandedAnalogs = $this->expandAnalogConnections($graph, $directAnalogIds, $partId);
            Log::info("Расширенный список аналогов: " . count($expandedAnalogs));
            
            // Объединяем все найденные аналоги
            $allAnalogs = array_unique(array_merge($connectedParts, $expandedAnalogs));
            
            // Исключаем из результата исходную запчасть еще раз
            if (($key = array_search($partId, $allAnalogs)) !== false) {
                unset($allAnalogs[$key]);
            }
            
            // Преобразуем массив в уникальный и переиндексируем
            $allAnalogs = array_values(array_unique($allAnalogs));
            
            Log::info("Найдено всего аналогов для запчасти ID {$partId}: " . count($allAnalogs) . ", аналоги: " . implode(", ", $allAnalogs));
            
            return $allAnalogs;
        } catch (\Exception $e) {
            Log::error('Ошибка при поиске аналогов в AnalogService: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return [];
        }
    }
    
    /**
     * Создать таблицу аналогов запчастей, если она не существует
     */
    private function createSparePartAnalogsTable()
    {
        try {
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
            
            Log::info("Таблица spare_part_analogs успешно создана");
        } catch (\Exception $e) {
            Log::error('Ошибка при создании таблицы spare_part_analogs: ' . $e->getMessage());
        }
    }
    
    /**
     * Построить граф связей аналогов из таблицы
     * 
     * @param array &$graph Ссылка на массив графа связей
     * @return void
     */
    private function buildAnalogGraph(array &$graph): void
    {
        // Получаем все записи из таблицы аналогов
        $analogs = DB::table('spare_part_analogs')->get();
        
        Log::info("Построение графа из " . $analogs->count() . " записей");
        
        foreach ($analogs as $analog) {
            $partId = $analog->spare_part_id;
            $analogId = $analog->analog_spare_part_id;
            
            Log::debug("Связь: $partId <-> $analogId");
            
            // Добавляем связь в обоих направлениях
            if (!isset($graph[$partId])) {
                $graph[$partId] = [];
            }
            if (!isset($graph[$analogId])) {
                $graph[$analogId] = [];
            }
            
            // Добавляем связь A -> B
            if (!in_array($analogId, $graph[$partId])) {
                $graph[$partId][] = $analogId;
            }
            
            // Добавляем связь B -> A
            if (!in_array($partId, $graph[$analogId])) {
                $graph[$analogId][] = $partId;
            }
        }
        
        // Логируем содержимое графа
        foreach ($graph as $nodeId => $connections) {
            Log::debug("Узел $nodeId связан с: " . implode(", ", $connections));
        }
        
        // Добавляем транзитивные связи
        $this->addTransitiveConnections($graph);
    }
    
    /**
     * Добавляет транзитивные связи в граф
     * Если A связан с B, а B связан с C, то A будет связан с C
     * Также добавляет связи между всеми узлами, которые имеют общего соседа
     * Создает полносвязный граф для всех запчастей в группе аналогов
     * 
     * @param array &$graph Ссылка на массив графа связей
     * @return void
     */
    private function addTransitiveConnections(array &$graph): void
    {
        Log::info("Добавление транзитивных связей в граф");
        
        // Шаг 1: Находим все связанные компоненты графа (группы аналогов)
        $components = $this->findConnectedComponents($graph);
        Log::info("Найдено групп аналогов: " . count($components));
        
        // Шаг 2: Для каждой группы аналогов создаем полносвязный граф
        foreach ($components as $index => $component) {
            Log::info("Обработка группы аналогов #$index, размер: " . count($component));
            
            // Если в группе только один элемент, пропускаем
            if (count($component) <= 1) {
                continue;
            }
            
            // Для каждой пары узлов в компоненте добавляем двунаправленную связь
            foreach ($component as $nodeA) {
                foreach ($component as $nodeB) {
                    // Не добавляем связь узла с самим собой
                    if ($nodeA != $nodeB) {
                        // Проверяем, существует ли уже связь A -> B
                        if (!isset($graph[$nodeA]) || !in_array($nodeB, $graph[$nodeA])) {
                            if (!isset($graph[$nodeA])) {
                                $graph[$nodeA] = [];
                            }
                            $graph[$nodeA][] = $nodeB;
                            Log::debug("Добавлена транзитивная связь: $nodeA -> $nodeB");
                        }
                    }
                }
            }
        }
        
        Log::info("Транзитивные связи добавлены, граф содержит " . count($graph) . " узлов");
    }
    
    /**
     * Находит все связанные компоненты графа (группы аналогов)
     * 
     * @param array $graph Граф связей
     * @return array Массив компонентов, где каждый компонент - массив ID узлов
     */
    private function findConnectedComponents(array $graph): array
    {
        $visited = [];
        $components = [];
        
        // Для каждого узла в графе
        foreach (array_keys($graph) as $node) {
            // Если узел еще не посещен, находим его компонент
            if (!isset($visited[$node])) {
                $component = [];
                $this->dfs($graph, $node, $visited, $component);
                $components[] = $component;
            }
        }
        
        return $components;
    }
    
    /**
     * Поиск в глубину для нахождения всех узлов в компоненте
     * 
     * @param array $graph Граф связей
     * @param int $node Текущий узел
     * @param array &$visited Массив посещенных узлов
     * @param array &$component Массив узлов в текущем компоненте
     * @return void
     */
    private function dfs(array $graph, int $node, array &$visited, array &$component): void
    {
        $visited[$node] = true;
        $component[] = $node;
        
        // Если у узла есть соседи, обходим их
        if (isset($graph[$node])) {
            foreach ($graph[$node] as $neighbor) {
                if (!isset($visited[$neighbor])) {
                    $this->dfs($graph, $neighbor, $visited, $component);
                }
            }
        }
    }
    
    /**
     * Находит все связанные узлы в графе с помощью поиска в ширину (BFS)
     * 
     * @param array $graph Граф связей
     * @param int $startNode Начальный узел
     * @return array Массив всех связанных узлов
     */
    private function findAllConnected(array $graph, int $startNode): array
    {
        // Если начального узла нет в графе, возвращаем пустой массив
        if (!isset($graph[$startNode])) {
            Log::warning("Узел $startNode отсутствует в графе связей");
            return [];
        }
        
        $visited = [$startNode]; // Посещенные узлы
        $queue = [$startNode]; // Очередь для обхода
        
        Log::info("Начало поиска связанных узлов от узла $startNode");
        
        while (!empty($queue)) {
            $currentNode = array_shift($queue);
            Log::debug("Обрабатываем узел $currentNode");
            
            // Если у текущего узла нет связей, пропускаем его
            if (!isset($graph[$currentNode])) {
                Log::debug("У узла $currentNode нет связей");
                continue;
            }
            
            // Перебираем все связанные узлы
            foreach ($graph[$currentNode] as $neighbor) {
                // Если узел еще не посещен, добавляем его в очередь
                if (!in_array($neighbor, $visited)) {
                    Log::debug("Добавляем узел $neighbor в список посещенных");
                    $visited[] = $neighbor;
                    $queue[] = $neighbor;
                }
            }
        }
        
        Log::info("Найдено связанных узлов: " . (count($visited) - 1) . " для узла $startNode");
        Log::debug("Связанные узлы: " . implode(", ", $visited));
        
        return $visited;
    }
    
    /**
     * Получить карту аналогов с информацией о прямых и косвенных связях
     * 
     * @param int $partId ID запчасти
     * @return array Карта аналогов с типами связей
     */
    public function getAnalogMap(int $partId): array
    {
        // Карта аналогов с типами связей
        $analogMap = [];
        
        try {
            // Шаг 1: Найти прямые аналоги
            $directAnalogs = DB::table('spare_part_analogs')
                ->where('spare_part_id', $partId)
                ->orWhere('analog_spare_part_id', $partId)
                ->get();
            
            Log::info("Найдено прямых аналогов в таблице: " . $directAnalogs->count());
            
            // Массив ID прямых аналогов
            $directAnalogIds = [];
            foreach ($directAnalogs as $analog) {
                $analogId = ($analog->spare_part_id == $partId) 
                    ? $analog->analog_spare_part_id 
                    : $analog->spare_part_id;
                
                $directAnalogIds[] = $analogId;
                $analogType = $analog->analog_type ?? 'alternative';
                
                $analogMap[$analogId] = [
                    'type' => 'direct',
                    'analog_type' => $analogType,
                    'distance' => 1 // Расстояние от исходной запчасти
                ];
                
                Log::info("Прямой аналог: ID {$analogId}, тип: {$analogType}");
            }
            
            // Шаг 2: Построить граф связей
            $graph = [];
            $this->buildAnalogGraph($graph);
            
            // Шаг 3: Найти все связанные запчасти и определить расстояние от исходной запчасти
            $distances = $this->calculateDistances($graph, $partId);
            Log::info("Рассчитаны расстояния для " . count($distances) . " узлов");
            
            // Шаг 4: Получить все аналоги (включая транзитивные)
            $allAnalogIds = $this->getAllAnalogs($partId);
            Log::info("Всего найдено аналогов (включая транзитивные): " . count($allAnalogIds));
            
            // Шаг 5: Найти все запчасти, связанные с группой аналогов
            $connectedGroup = $this->findConnectedGroup($graph, $directAnalogIds, $partId);
            Log::info("Найдено запчастей, связанных с группой аналогов: " . count($connectedGroup));
            
            // Объединяем все найденные аналоги
            $allAnalogIds = array_unique(array_merge($allAnalogIds, $connectedGroup));
            
            // Исключаем исходную запчасть
            if (($key = array_search($partId, $allAnalogIds)) !== false) {
                unset($allAnalogIds[$key]);
            }
            
            // Шаг 6: Определить косвенные аналоги и их расстояние
            foreach ($allAnalogIds as $analogId) {
                if (!in_array($analogId, $directAnalogIds)) {
                    $distance = $distances[$analogId] ?? 2; // По умолчанию расстояние 2, если не удалось определить точно
                    
                    $analogMap[$analogId] = [
                        'type' => 'indirect',
                        'analog_type' => 'transitive',
                        'distance' => $distance
                    ];
                    
                    Log::info("Косвенный аналог: ID {$analogId}, тип: transitive, расстояние: {$distance}");
                }
            }
            
            // Если в карте нет аналогов, но есть прямые аналоги в таблице, добавляем их
            if (empty($analogMap) && $directAnalogs->count() > 0) {
                Log::info("Карта аналогов пуста, но найдены прямые аналоги. Добавляем их вручную.");
                foreach ($directAnalogs as $analog) {
                    $analogId = ($analog->spare_part_id == $partId) 
                        ? $analog->analog_spare_part_id 
                        : $analog->spare_part_id;
                    
                    $analogType = $analog->analog_type ?? 'alternative';
                    
                    $analogMap[$analogId] = [
                        'type' => 'direct',
                        'analog_type' => $analogType,
                        'distance' => 1
                    ];
                    
                    Log::info("Добавлен прямой аналог: ID {$analogId}, тип: {$analogType}");
                }
            }
            
            Log::info("Итоговая карта аналогов содержит " . count($analogMap) . " записей");
            return $analogMap;
        } catch (\Exception $e) {
            Log::error('Ошибка при построении карты аналогов: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Находит все запчасти, связанные с группой аналогов
     * 
     * @param array $graph Граф связей
     * @param array $analogIds ID аналогов
     * @param int $originalPartId ID исходной запчасти
     * @return array Список ID связанных запчастей
     */
    private function findConnectedGroup(array $graph, array $analogIds, int $originalPartId): array
    {
        $connectedParts = [];
        $visited = [$originalPartId]; // Исключаем исходную запчасть
        
        // Добавляем все аналоги в список посещенных
        foreach ($analogIds as $analogId) {
            $visited[] = $analogId;
        }
        
        // Очередь для обхода в ширину
        $queue = $analogIds;
        
        while (!empty($queue)) {
            $currentId = array_shift($queue);
            
            // Если узел есть в графе
            if (isset($graph[$currentId])) {
                // Обрабатываем все связи текущего узла
                foreach ($graph[$currentId] as $connectedId) {
                    // Если узел еще не посещен
                    if (!in_array($connectedId, $visited)) {
                        $visited[] = $connectedId;
                        $queue[] = $connectedId;
                        $connectedParts[] = $connectedId;
                        Log::debug("Найдена связанная запчасть: $connectedId через аналог $currentId");
                    }
                }
            }
        }
        
        // Для каждой найденной связанной запчасти находим все ее связи
        $secondLevelConnections = [];
        foreach ($connectedParts as $connectedId) {
            if (isset($graph[$connectedId])) {
                foreach ($graph[$connectedId] as $secondLevelId) {
                    if (!in_array($secondLevelId, $visited) && $secondLevelId != $originalPartId) {
                        $secondLevelConnections[] = $secondLevelId;
                        Log::debug("Найдена запчасть второго уровня: $secondLevelId через $connectedId");
                    }
                }
            }
        }
        
        // Объединяем все найденные связи
        $allConnected = array_unique(array_merge($connectedParts, $secondLevelConnections));
        
        return $allConnected;
    }
    
    /**
     * Рассчитывает расстояния от начального узла до всех остальных узлов в графе
     * 
     * @param array $graph Граф связей
     * @param int $startNode Начальный узел
     * @return array Массив расстояний [узел => расстояние]
     */
    private function calculateDistances(array $graph, int $startNode): array
    {
        // Если начального узла нет в графе, возвращаем пустой массив
        if (!isset($graph[$startNode])) {
            return [];
        }
        
        $distances = [$startNode => 0]; // Расстояние до самого себя = 0
        $queue = [[$startNode, 0]]; // Очередь [узел, расстояние]
        
        while (!empty($queue)) {
            [$currentNode, $distance] = array_shift($queue);
            
            // Если у текущего узла нет связей, пропускаем его
            if (!isset($graph[$currentNode])) {
                continue;
            }
            
            // Перебираем все связанные узлы
            foreach ($graph[$currentNode] as $neighbor) {
                // Если узел еще не посещен или найден более короткий путь
                if (!isset($distances[$neighbor]) || $distances[$neighbor] > $distance + 1) {
                    $distances[$neighbor] = $distance + 1;
                    $queue[] = [$neighbor, $distance + 1];
                }
            }
        }
        
        // Удаляем расстояние до начального узла
        unset($distances[$startNode]);
        
        return $distances;
    }
    
    /**
     * Рекурсивно определить тип отношений между аналогами
     * 
     * @param int $originId ID исходной запчасти
     * @param int $targetId ID целевой запчасти
     * @return string Тип связи
     */
    public function determineRelationType(int $originId, int $targetId): string
    {
        try {
            // Проверяем, являются ли запчасти прямыми аналогами
            $directAnalog = DB::table('spare_part_analogs')
                ->where(function ($query) use ($originId, $targetId) {
                    $query->where('spare_part_id', $originId)
                          ->where('analog_spare_part_id', $targetId);
                })
                ->orWhere(function ($query) use ($originId, $targetId) {
                    $query->where('spare_part_id', $targetId)
                          ->where('analog_spare_part_id', $originId);
                })
                ->first();
            
            if ($directAnalog) {
                return 'Прямой аналог';
            }
            
            // Если не прямые аналоги, то это косвенная связь через другие запчасти
            return 'Косвенный аналог';
        } catch (\Exception $e) {
            Log::error('Ошибка при определении типа связи: ' . $e->getMessage());
            return 'Неопределенный аналог';
        }
    }
    
    /**
     * Получить аналоги запчасти с полной информацией
     * 
     * @param int $partId ID запчасти
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return \Illuminate\Support\Collection Коллекция аналогов
     */
    public function getAnalogs(int $partId, bool $isAdmin = false, ?float $markupPercent = null): \Illuminate\Support\Collection
    {
        try {
            Log::info("Получение аналогов для запчасти ID: $partId");
            
            // Проверяем прямые связи в таблице spare_part_analogs
            $directAnalogs = DB::table('spare_part_analogs')
                ->where('spare_part_id', $partId)
                ->orWhere('analog_spare_part_id', $partId)
                ->get();
            
            Log::info("Прямые связи в таблице spare_part_analogs: " . $directAnalogs->count());
            foreach ($directAnalogs as $analog) {
                $analogId = ($analog->spare_part_id == $partId) 
                    ? $analog->analog_spare_part_id 
                    : $analog->spare_part_id;
                Log::info("Прямая связь: $partId <-> $analogId");
            }
            
            // Получаем ID всех аналогов с расширенным поиском
            $analogIds = $this->getAllAnalogs($partId);
            
            if (empty($analogIds)) {
                Log::info("Аналоги не найдены для запчасти ID: $partId");
                return collect([]);
            }
            
            Log::info("Найдено аналогов: " . count($analogIds) . " для запчасти ID: $partId");
            Log::info("ID аналогов: " . implode(', ', $analogIds));
            
            // Получаем карту аналогов с типами связей
            $analogMap = $this->getAnalogMap($partId);
            Log::info("Получена карта аналогов с " . count($analogMap) . " записями");
            
            // Получаем полную информацию о запчастях
            $analogs = \App\Models\SparePart::whereIn('id', array_keys($analogMap))
                ->where('is_available', true)
                ->where('stock_quantity', '>', 0)
                ->get();
            
            Log::info("Получено запчастей из базы: " . $analogs->count() . " из " . count($analogMap) . " ID аналогов");
            
            // Если аналогов не найдено в базе, попробуем получить их без ограничения наличия
            if ($analogs->isEmpty() && !empty($analogIds)) {
                Log::info("Аналоги не найдены в наличии, пробуем искать без ограничения наличия");
                $analogs = \App\Models\SparePart::whereIn('id', array_keys($analogMap))->get();
                Log::info("Получено запчастей без ограничения наличия: " . $analogs->count());
            }
            
            // Если все еще нет результатов, пробуем искать по всем найденным ID аналогов
            if ($analogs->isEmpty() && !empty($analogIds)) {
                Log::info("Аналоги не найдены по карте аналогов, пробуем искать по всем ID аналогов");
                $analogs = \App\Models\SparePart::whereIn('id', $analogIds)->get();
                Log::info("Получено запчастей по всем ID аналогов: " . $analogs->count());
            }
            
            // Добавляем информацию о типе связи к каждому аналогу
            $analogs = $analogs->map(function ($part) use ($analogMap) {
                $part->is_analog = true;
                $part->is_exact_match = false;
                
                // Если запчасть есть в карте аналогов, используем информацию из карты
                if (isset($analogMap[$part->id])) {
                    $part->analog_type = $analogMap[$part->id]['analog_type'] ?? 'alternative';
                    $part->relation_type = $analogMap[$part->id]['type'] ?? 'indirect';
                    $part->distance = $analogMap[$part->id]['distance'] ?? 2;
                } else {
                    // Иначе устанавливаем значения по умолчанию
                    $part->analog_type = 'alternative';
                    $part->relation_type = 'indirect';
                    $part->distance = 2;
                }
                
                return $part;
            });
            
            // Сортируем аналоги по расстоянию (сначала прямые, потом косвенные)
            $analogs = $analogs->sortBy('distance');
            
            // Форматируем цены в зависимости от роли пользователя
            $sparePartService = app(\App\Services\SparePartService::class);
            $analogs = $sparePartService->formatSparePartsWithPrices($analogs, $isAdmin, $markupPercent);
            
            Log::info("Возвращаем " . $analogs->count() . " аналогов для запчасти ID: $partId");
            
            return $analogs;
        } catch (\Exception $e) {
            Log::error('Ошибка при получении аналогов: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return collect([]);
        }
    }
    
    /**
     * Расширяет список аналогов, добавляя связи через промежуточные запчасти
     * 
     * @param array $graph Граф связей
     * @param array $directAnalogIds ID прямых аналогов
     * @param int $originalPartId ID исходной запчасти
     * @return array Расширенный список ID аналогов
     */
    private function expandAnalogConnections(array $graph, array $directAnalogIds, int $originalPartId): array
    {
        $expandedAnalogs = [];
        
        // Для каждого прямого аналога находим все его связи
        foreach ($directAnalogIds as $analogId) {
            // Если аналог есть в графе
            if (isset($graph[$analogId])) {
                // Добавляем все связи аналога в расширенный список
                foreach ($graph[$analogId] as $connectedId) {
                    // Не добавляем исходную запчасть и уже найденные прямые аналоги
                    if ($connectedId != $originalPartId && !in_array($connectedId, $directAnalogIds)) {
                        $expandedAnalogs[] = $connectedId;
                        Log::debug("Добавлен расширенный аналог: $connectedId через аналог $analogId");
                    }
                }
                
                // Рекурсивно находим связи второго уровня (связи связей)
                foreach ($graph[$analogId] as $connectedId) {
                    if ($connectedId != $originalPartId && isset($graph[$connectedId])) {
                        foreach ($graph[$connectedId] as $secondLevelId) {
                            // Не добавляем исходную запчасть, прямые аналоги и уже найденные расширенные аналоги
                            if ($secondLevelId != $originalPartId && 
                                !in_array($secondLevelId, $directAnalogIds) && 
                                !in_array($secondLevelId, $expandedAnalogs)) {
                                $expandedAnalogs[] = $secondLevelId;
                                Log::debug("Добавлен аналог второго уровня: $secondLevelId через $connectedId и $analogId");
                            }
                        }
                    }
                }
            }
        }
        
        return $expandedAnalogs;
    }
} 
