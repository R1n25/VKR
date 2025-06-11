<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\PartCategory;
use App\Models\CarBrand;
use App\Models\CarEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SparePartController extends Controller
{
    /**
     * Отображение списка запчастей через Inertia
     */
    public function indexInertia(Request $request)
    {
        $query = SparePart::query()->with(['category', 'brand']);
        
        // Фильтрация
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(part_number) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(manufacturer) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }
        
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }
        
        if ($request->filled('manufacturer')) {
            $query->where('manufacturer', $request->input('manufacturer'));
        }
        
        if ($request->filled('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));
        }
        
        // Сортировка
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        
        if ($sortField && $sortDirection) {
            $query->orderBy($sortField, $sortDirection);
        }
        
        $perPage = $request->input('perPage', 15);
        $spareParts = $query->paginate($perPage)->appends($request->query());
        
        // Получение категорий для фильтра
        $categories = PartCategory::all();
        
        // Получение уникальных производителей
        $manufacturers = SparePart::distinct()->pluck('manufacturer')->filter()->values();
        
        return Inertia::render('Admin/SpareParts/Index', [
            'spareParts' => $spareParts,
            'categories' => $categories,
            'manufacturers' => $manufacturers,
            'filters' => $request->only(['search', 'category', 'manufacturer', 'is_available', 'sort', 'direction']),
        ]);
    }

    /**
     * Управление аналогами запчасти
     */
    public function manageAnalogs($id)
    {
        $sparePart = SparePart::with(['analogs.analogSparePart'])->findOrFail($id);
        
        // Получаем все запчасти, которые могут быть аналогами (исключая текущую)
        $potentialAnalogs = SparePart::where('id', '!=', $id)
            ->select('id', 'name', 'part_number', 'manufacturer', 'price')
            ->orderBy('name')
            ->get();
        
        // Форматируем существующие аналоги для отображения
        $existingAnalogs = $sparePart->analogs->map(function($analog) {
            return [
                'id' => $analog->id,
                'analog_id' => $analog->analog_spare_part_id,
                'name' => $analog->analogSparePart->name,
                'part_number' => $analog->analogSparePart->part_number,
                'manufacturer' => $analog->analogSparePart->manufacturer,
                'is_direct' => $analog->is_direct,
                'notes' => $analog->notes
            ];
        });
        
        return Inertia::render('Admin/SpareParts/ManageAnalogs', [
            'sparePart' => $sparePart,
            'existingAnalogs' => $existingAnalogs,
            'potentialAnalogs' => $potentialAnalogs,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Добавление аналога запчасти
     */
    public function addAnalog(Request $request, $id)
    {
        $request->validate([
            'analog_id' => 'required|exists:spare_parts,id',
            'is_direct' => 'boolean',
            'notes' => 'nullable|string|max:255',
        ]);
        
        $sparePart = SparePart::findOrFail($id);
        $analogPart = SparePart::findOrFail($request->analog_id);
        
        // Проверяем, что запчасть не является аналогом самой себя
        if ($sparePart->id == $analogPart->id) {
            return redirect()->back()->with('error', 'Запчасть не может быть аналогом самой себя');
        }
        
        // Проверяем, что такой аналог еще не добавлен
        $exists = $sparePart->analogs()->where('analog_spare_part_id', $analogPart->id)->exists();
        if ($exists) {
            return redirect()->back()->with('error', 'Этот аналог уже добавлен');
        }
        
        // Добавляем аналог
        $sparePart->analogs()->create([
            'analog_spare_part_id' => $analogPart->id,
            'is_direct' => $request->has('is_direct'),
            'notes' => $request->notes,
            'is_verified' => true
        ]);
        
        // Если это прямой аналог, то добавляем обратную связь
        if ($request->has('is_direct')) {
            $analogPart->analogs()->updateOrCreate(
                ['analog_spare_part_id' => $sparePart->id],
                [
                    'is_direct' => true,
                    'notes' => $request->notes,
                    'is_verified' => true
                ]
            );
        }
        
        return redirect()->route('admin.spare-parts.analogs', $sparePart->id)
            ->with('success', 'Аналог успешно добавлен');
    }

    /**
     * Удаление аналога запчасти
     */
    public function removeAnalog($id, $analogId)
    {
        $sparePart = SparePart::findOrFail($id);
        $analog = $sparePart->analogs()->where('id', $analogId)->firstOrFail();
        
        // Находим обратную связь, если это прямой аналог
        if ($analog->is_direct) {
            $reverseAnalog = SparePart::findOrFail($analog->analog_spare_part_id)
                ->analogs()
                ->where('analog_spare_part_id', $sparePart->id)
                ->first();
            
            // Удаляем обратную связь, если она существует
            if ($reverseAnalog) {
                $reverseAnalog->delete();
            }
        }
        
        // Удаляем аналог
        $analog->delete();
        
        return redirect()->route('admin.spare-parts.analogs', $sparePart->id)
            ->with('success', 'Аналог успешно удален');
    }

    /**
     * Отображение формы создания запчасти через Inertia
     */
    public function createInertia()
    {
        $categories = PartCategory::all();
        $brands = CarBrand::all();
        
        // Получаем уникальные производители
        $manufacturers = SparePart::distinct()->pluck('manufacturer')->filter()->values()->toArray();
        
        // Загружаем модели автомобилей с их брендами
        $carModels = CarModel::with('brand')->get();
        
        // Загружаем двигатели с моделями и брендами
        $engines = CarEngine::with('carModel.brand')->get();
        
        return Inertia::render('Admin/SpareParts/Create', [
            'categories' => $categories,
            'brands' => $brands,
            'manufacturers' => $manufacturers,
            'carModels' => $carModels,
            'carEngines' => $engines,
            'compatibleCarIds' => [],
            'compatibleEngineIds' => []
        ]);
    }

    /**
     * Сохранение новой запчасти через Inertia
     */
    public function storeInertia(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'required|string|max:100|unique:spare_parts',
            'manufacturer' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:part_categories,id',
            'image' => 'nullable|image|max:2048',
            'is_available' => 'boolean',
        ]);
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('spare_parts', 'public');
            $validated['image_url'] = $imagePath;
        }
        
        // Установка статуса активности
        $validated['is_available'] = $request->boolean('is_available', true);
        
        // Создание запчасти
        $sparePart = SparePart::create($validated);
        
        // Связывание с совместимыми двигателями, если они указаны
        if ($request->has('compatible_engines') && is_array($request->compatible_engines)) {
            $sparePart->carEngines()->attach($request->compatible_engines);
        }
        
        return redirect()->route('admin.spare-parts.index')
            ->with('success', 'Запчасть успешно добавлена');
    }

    /**
     * Отображение детальной информации о запчасти через Inertia
     */
    public function showInertia(SparePart $sparePart)
    {
        // Загружаем связанные данные
        $sparePart->load([
            'category',
            'brand', 
            'analogs.analogSparePart',
            'carEngines.carModel.brand'
        ]);
        
        // Получаем данные о совместимости с двигателями из таблицы car_engine_spare_part
        $engineCompatibilities = app(\App\Services\SparePartCompatibilityService::class)->getCarEngineSparePartData($sparePart->id);
        
        // Добавляем данные о совместимости с двигателями к запчасти
        $sparePart->engine_compatibilities = $engineCompatibilities;
            
        return Inertia::render('Admin/SpareParts/Show', [
            'sparePart' => $sparePart,
            'categories' => PartCategory::all(),
            'analogs' => $sparePart->analogs()->with('analogSparePart')->get(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Отображение формы редактирования запчасти через Inertia
     */
    public function editInertia(SparePart $sparePart)
    {
        // Загружаем категории и бренды для выбора
        $categories = PartCategory::all();
        $brands = CarBrand::all();
        
        // Получаем уникальные производители
        $manufacturers = SparePart::distinct()->pluck('manufacturer')->filter()->values()->toArray();
        
        // Загружаем модели автомобилей с их брендами
        $carModels = CarModel::with('brand')->get();
        
        // Загружаем двигатели с моделями и брендами
        $engines = CarEngine::with('carModel.brand')->get();
        
        // Получаем ID совместимых двигателей
        $compatibleEngineIds = $sparePart->carEngines()->pluck('car_engines.id')->toArray();
        
        // Получаем ID совместимых моделей автомобилей через связь с двигателями
        $compatibleCarIds = $sparePart->carEngines()->join('car_models', 'car_engines.model_id', '=', 'car_models.id')
            ->pluck('car_models.id')
            ->unique()
            ->values()
            ->toArray();
        
        return Inertia::render('Admin/SpareParts/Edit', [
            'sparePart' => $sparePart,
            'categories' => $categories,
            'brands' => $brands,
            'manufacturers' => $manufacturers,
            'carModels' => $carModels,
            'compatibleCarIds' => $compatibleCarIds,
            'carEngines' => $engines,
            'compatibleEngineIds' => $compatibleEngineIds
        ]);
    }

    /**
     * Обновление запчасти через Inertia
     */
    public function updateInertia(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'required|string|max:100|unique:spare_parts,part_number,' . $sparePart->id,
            'manufacturer' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:part_categories,id',
            'image' => 'nullable|image|max:2048',
            'is_available' => 'boolean',
        ]);
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            // Удаляем старое изображение
            if ($sparePart->image_url) {
                Storage::disk('public')->delete($sparePart->image_url);
            }
            
            $imagePath = $request->file('image')->store('spare_parts', 'public');
            $validated['image_url'] = $imagePath;
        }
        
        // Обрабатываем изменение цены
        $oldPrice = $sparePart->price;
        $newPrice = (float)$validated['price'];
        
        // Логируем изменение цены (без создания записи в истории)
        if ($oldPrice != $newPrice) {
            \Log::info("Цена запчасти ID:{$sparePart->id} изменена с {$oldPrice} на {$newPrice}");
        }
        
        // Обрабатываем изменение количества
        $oldQuantity = $sparePart->stock_quantity;
        $newQuantity = (int)$validated['stock_quantity'];
        
        // Логируем изменение количества (без создания записи в истории)
        if ($oldQuantity != $newQuantity) {
            \Log::info("Количество запчасти ID:{$sparePart->id} изменено с {$oldQuantity} на {$newQuantity}");
        }
        
        // Установка статуса активности
        $validated['is_available'] = $request->boolean('is_available', true);
        
        // Обновление запчасти
        $sparePart->update($validated);
        
        // Обновление связей с двигателями
        if ($request->has('compatible_engines')) {
            $sparePart->carEngines()->sync($request->compatible_engines);
        } else {
            $sparePart->carEngines()->detach();
        }
        
        return redirect()->route('admin.spare-parts.index')
            ->with('success', 'Запчасть успешно обновлена');
    }

    /**
     * Обновление категории запчасти
     */
    public function updateCategory(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:part_categories,id',
        ]);
        
        $sparePart->update($validated);
        
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Категория запчасти успешно обновлена'
            ]);
        }
        
        return redirect()->back()->with('success', 'Категория запчасти успешно обновлена');
    }

    /**
     * Активация всех запчастей
     */
    public function activateAll()
    {
        SparePart::query()->update(['is_available' => true]);
        
        return redirect()->route('admin.spare-parts.index')
            ->with('success', 'Все запчасти успешно активированы');
    }

    /**
     * Массовая установка статуса активности
     */
    public function setAllActive(Request $request)
    {
        $status = $request->boolean('status', true);
        
        SparePart::query()->update(['is_available' => $status]);
        
        return redirect()->route('admin.spare-parts.index')
            ->with('success', 'Статус активности всех запчастей обновлен');
    }

    /**
     * Синхронизировать все аналоги запчастей
     * Создает полносвязный граф аналогов, где каждая запчасть связана со всеми аналогами в группе
     */
    public function syncAllAnalogs()
    {
        try {
            $analogService = app(\App\Services\AnalogService::class);
            
            // Получаем все запчасти, у которых есть аналоги
            $sparePartsWithAnalogs = SparePart::whereHas('analogs')->get();
            
            $count = 0;
            $processed = [];
            
            // Для каждой запчасти обновляем связи с аналогами
            foreach ($sparePartsWithAnalogs as $sparePart) {
                // Пропускаем уже обработанные запчасти
                if (in_array($sparePart->id, $processed)) {
                    continue;
                }
                
                // Получаем все аналоги для запчасти
                $analogs = $analogService->getAllAnalogs($sparePart->id);
                
                // Добавляем текущую запчасть к списку аналогов
                $allParts = array_merge([$sparePart->id], $analogs);
                
                // Для каждой пары запчастей создаем связь аналога
                for ($i = 0; $i < count($allParts); $i++) {
                    for ($j = $i + 1; $j < count($allParts); $j++) {
                        $partId = $allParts[$i];
                        $analogId = $allParts[$j];
                        
                        // Проверяем, существует ли уже связь
                        $exists = \DB::table('spare_part_analogs')
                            ->where(function ($query) use ($partId, $analogId) {
                                $query->where('spare_part_id', $partId)
                                    ->where('analog_spare_part_id', $analogId);
                            })
                            ->orWhere(function ($query) use ($partId, $analogId) {
                                $query->where('spare_part_id', $analogId)
                                    ->where('analog_spare_part_id', $partId);
                            })
                            ->exists();
                        
                        // Если связи нет, создаем её
                        if (!$exists) {
                            \DB::table('spare_part_analogs')->insert([
                                'spare_part_id' => $partId,
                                'analog_spare_part_id' => $analogId,
                                'is_direct' => true,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                            
                            $count++;
                        }
                    }
                }
                
                // Добавляем все обработанные запчасти в список
                $processed = array_merge($processed, $allParts);
            }
            
            return redirect()->route('admin.spare-parts.index')
                ->with('success', "Синхронизация аналогов завершена. Добавлено $count новых связей.");
        } catch (\Exception $e) {
            \Log::error('Ошибка при синхронизации аналогов: ' . $e->getMessage());
            return redirect()->route('admin.spare-parts.index')
                ->with('error', 'Ошибка при синхронизации аналогов: ' . $e->getMessage());
        }
    }
} 