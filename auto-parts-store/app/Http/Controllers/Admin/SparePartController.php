<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\PartCategory;
use App\Models\CarBrand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SparePartController extends Controller
{
    /**
     * Отображение списка запчастей
     */
    public function index(Request $request)
    {
        $query = SparePart::query()->with(['category']);
        
        // Фильтрация
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('part_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }
        
        if ($request->filled('manufacturer')) {
            $query->where('manufacturer', $request->input('manufacturer'));
        }
        
        // Сортировка
        $sortField = $request->input('sort', 'id');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);
        
        $perPage = $request->input('per_page', 30);
        $spareParts = $query->paginate($perPage)->withQueryString();
        $categories = PartCategory::all();
        
        // Получение уникальных производителей запчастей
        $manufacturers = SparePart::distinct()->pluck('manufacturer')->filter()->values();
        
        return view('admin.spare-parts.index', compact('spareParts', 'categories', 'manufacturers'));
    }

    /**
     * Отображение формы создания запчасти
     */
    public function create()
    {
        $categories = PartCategory::all();
        $brands = CarBrand::all();
        $carModels = CarModel::with('brand')
                    ->orderBy('brand_id')
                    ->orderBy('name')
                    ->get();
        
        return view('admin.spare-parts.create', compact('categories', 'brands', 'carModels'));
    }

    /**
     * Сохранение новой запчасти
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'article_number' => 'required|string|max:100|unique:spare_parts',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:part_categories,id',
            'brand_id' => 'required|exists:car_brands,id',
            'is_available' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'compatible_car_models' => 'nullable|array',
            'compatible_car_models.*' => 'exists:car_models,id',
        ]);
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('spare_parts', 'public');
            $validated['image'] = $imagePath;
        }
        
        // Получаем и удаляем количество из валидированных данных, 
        // так как будем устанавливать его через updateAvailability
        $quantity = (int)$validated['stock_quantity'];
        unset($validated['stock_quantity']);
        $validated['stock_quantity'] = 0; // Начальное значение
        
        // Установка статуса активности
        $validated['is_available'] = $request->has('is_available');
        
        // Создание запчасти с нулевым количеством
        $sparePart = SparePart::create($validated);
        
        // Установка количества через updateAvailability
        if ($quantity > 0) {
            $sparePart->updateAvailability($quantity);
        }
        
        // Добавление совместимых моделей автомобилей
        if ($request->has('compatible_car_models')) {
            $sparePart->compatibleCars()->attach($request->input('compatible_car_models'));
        }
        
        return redirect()->route('admin.spare-parts.index')
            ->with('success', 'Запчасть успешно добавлена');
    }

    /**
     * Отображение детальной информации о запчасти
     */
    public function show(SparePart $sparePart)
    {
        $sparePart->load(['category', 'brand', 'compatibleCars', 'analogs']);
        
        return view('admin.spare-parts.show', compact('sparePart'));
    }

    /**
     * Отображение формы редактирования запчасти
     */
    public function edit(SparePart $sparePart)
    {
        $categories = PartCategory::all();
        $brands = CarBrand::all();
        $carModels = CarModel::with('brand')
                    ->orderBy('brand_id')
                    ->orderBy('name')
                    ->get();
        
        // Получение ID совместимых моделей
        $compatibleCarIds = $sparePart->compatibleCars()->pluck('car_model_id')->toArray();
        
        return view('admin.spare-parts.edit', compact('sparePart', 'categories', 'brands', 'carModels', 'compatibleCarIds'));
    }

    /**
     * Обновление запчасти
     */
    public function update(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'article_number' => 'required|string|max:100|unique:spare_parts,article_number,' . $sparePart->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:part_categories,id',
            'brand_id' => 'required|exists:car_brands,id',
            'is_available' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'compatible_car_models' => 'nullable|array',
            'compatible_car_models.*' => 'exists:car_models,id',
        ]);
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            // Удаление старого изображения
            if ($sparePart->image) {
                Storage::disk('public')->delete($sparePart->image);
            }
            
            $imagePath = $request->file('image')->store('spare_parts', 'public');
            $validated['image'] = $imagePath;
        }
        
        // Получаем текущее количество товара
        $oldQuantity = $sparePart->stock_quantity;
        $newQuantity = (int)$validated['stock_quantity'];
        
        // Вычисляем разницу для обновления количества
        $quantityDiff = $newQuantity - $oldQuantity;
        
        // Удаляем stock_quantity из валидированных данных, так как будем обновлять его через updateAvailability
        unset($validated['stock_quantity']);
        
        // Установка статуса активности
        $validated['is_available'] = $request->has('is_available');
        
        // Обновление запчасти без количества
        $sparePart->update($validated);
        
        // Обновление количества через updateAvailability
        if ($quantityDiff != 0) {
            $sparePart->updateAvailability($quantityDiff);
        }
        
        // Обновление совместимых моделей автомобилей
        if ($request->has('compatible_car_models')) {
            $sparePart->compatibleCars()->sync($request->input('compatible_car_models'));
        } else {
            $sparePart->compatibleCars()->detach();
        }
        
        return redirect()->route('admin.spare-parts.index')
            ->with('success', 'Запчасть успешно обновлена');
    }

    /**
     * Удаление запчасти
     */
    public function destroy(SparePart $sparePart)
    {
        try {
            // Проверка на наличие связанных заказов
            if ($sparePart->orderItems()->count() > 0) {
                if (request()->header('X-Inertia')) {
                    return back()->with('error', 'Запчасть невозможно удалить, так как она связана с заказами. Запчасть помечена как "не в наличии".');
                }
                
                // Вместо удаления, помечаем запчасть как "не в наличии"
                $sparePart->is_available = false;
                $sparePart->stock_quantity = 0;
                $sparePart->save();
                
                return redirect()->route('admin.spare-parts.index')
                    ->with('success', 'Запчасть помечена как "не в наличии", так как она связана с заказами');
            }
            
            // Вместо удаления, помечаем запчасть как "не в наличии"
            $sparePart->is_available = false;
            $sparePart->stock_quantity = 0;
            $sparePart->save();
            
            if (request()->header('X-Inertia')) {
                return back()->with('success', 'Запчасть помечена как "не в наличии"');
            }
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Запчасть помечена как "не в наличии"'
                ]);
            }
            
            return redirect()->route('admin.spare-parts.index')
                ->with('success', 'Запчасть помечена как "не в наличии"');
        } catch (\Exception $e) {
            \Log::error('Ошибка при обработке запчасти: ' . $e->getMessage());
            
            if (request()->header('X-Inertia')) {
                return back()->with('error', 'Ошибка при обработке запчасти: ' . $e->getMessage());
            }
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при обработке запчасти: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->route('admin.spare-parts.index')
                ->with('error', 'Ошибка при обработке запчасти: ' . $e->getMessage());
        }
    }

    /**
     * Отображение списка запчастей через Inertia.js
     */
    public function indexInertia(Request $request)
    {
        $query = SparePart::query()->with(['category']);
        
        // Фильтрация
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('part_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }
        
        if ($request->filled('manufacturer')) {
            $query->where('manufacturer', $request->input('manufacturer'));
        }
        
        // Сортировка
        $sortField = $request->input('sort', 'id');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);
        
        $perPage = $request->input('per_page', 30);
        $spareParts = $query->paginate($perPage)->withQueryString();
        $categories = PartCategory::all();
        
        return inertia('Admin/SpareParts/Index', [
            'spareParts' => $spareParts,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'manufacturer', 'sort', 'direction']),
        ]);
    }

    /**
     * Отображение страницы управления аналогами запчасти
     * 
     * @param int $id ID запчасти
     * @return \Inertia\Response
     */
    public function manageAnalogs($id)
    {
        $sparePart = SparePart::with(['analogs.analogSparePart'])->findOrFail($id);
        
        // Получаем ID уже добавленных аналогов
        $existingAnalogIds = $sparePart->analogs->pluck('analog_spare_part_id')->toArray();
        
        // Также добавляем ID самой запчасти в исключения
        $excludeIds = array_merge($existingAnalogIds, [$id]);
        
        // Получаем список возможных аналогов (той же категории, не включая уже добавленные)
        $potentialAnalogs = SparePart::where('category_id', $sparePart->category_id)
            ->whereNotIn('id', $excludeIds)
            ->where('is_available', true)
            ->orderBy('name')
            ->get();
        
        return inertia('Admin/SpareParts/ManageAnalogs', [
            'sparePart' => $sparePart,
            'existingAnalogs' => $sparePart->analogs->map(function ($analog) {
                return [
                    'id' => $analog->id,
                    'analog_id' => $analog->analog_spare_part_id,
                    'name' => $analog->analogSparePart->name,
                    'part_number' => $analog->analogSparePart->part_number,
                    'manufacturer' => $analog->analogSparePart->manufacturer,
                    'is_direct' => $analog->is_direct,
                    'notes' => $analog->notes
                ];
            }),
            'potentialAnalogs' => $potentialAnalogs->map(function ($part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'part_number' => $part->part_number,
                    'manufacturer' => $part->manufacturer
                ];
            })
        ]);
    }
    
    /**
     * Добавление аналога к запчасти
     * 
     * @param \Illuminate\Http\Request $request
     * @param int $id ID запчасти
     * @return \Illuminate\Http\RedirectResponse
     */
    public function addAnalog(Request $request, $id)
    {
        $validated = $request->validate([
            'analog_id' => 'required|exists:spare_parts,id',
            'is_direct' => 'boolean',
            'notes' => 'nullable|string|max:255'
        ]);
        
        $sparePart = SparePart::findOrFail($id);
        
        // Проверяем, что аналог еще не добавлен
        $exists = \App\Models\SparePartAnalog::where('spare_part_id', $id)
            ->where('analog_spare_part_id', $validated['analog_id'])
            ->exists();
            
        if ($exists) {
            return redirect()->back()->with('error', 'Этот аналог уже добавлен');
        }
        
        // Добавляем аналог
        $analog = new \App\Models\SparePartAnalog();
        $analog->spare_part_id = $id;
        $analog->analog_spare_part_id = $validated['analog_id'];
        $analog->is_direct = $validated['is_direct'] ?? true;
        $analog->notes = $validated['notes'] ?? null;
        $analog->save();
        
        // Если это прямой аналог, добавляем обратную связь
        if ($analog->is_direct) {
            \App\Models\SparePartAnalog::updateOrCreate(
                [
                    'spare_part_id' => $validated['analog_id'],
                    'analog_spare_part_id' => $id,
                ],
                [
                    'is_direct' => true,
                    'notes' => $validated['notes'] ?? null,
                ]
            );
        }
        
        return redirect()->back()->with('success', 'Аналог успешно добавлен');
    }
    
    /**
     * Удаление аналога запчасти
     * 
     * @param int $id ID запчасти
     * @param int $analogId ID записи аналога
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeAnalog($id, $analogId)
    {
        $analog = \App\Models\SparePartAnalog::where('spare_part_id', $id)
            ->where('id', $analogId)
            ->firstOrFail();
            
        // Получаем данные перед удалением
        $analogSparePartId = $analog->analog_spare_part_id;
        $isDirect = $analog->is_direct;
        
        // Удаляем аналог
        $analog->delete();
        
        // Если это был прямой аналог, удаляем и обратную связь
        if ($isDirect) {
            \App\Models\SparePartAnalog::where('spare_part_id', $analogSparePartId)
                ->where('analog_spare_part_id', $id)
                ->delete();
        }
        
        return redirect()->back()->with('success', 'Аналог успешно удален');
    }

    /**
     * Отображение формы создания запчасти через Inertia.js
     */
    public function createInertia()
    {
        $categories = PartCategory::all();
        
        // Получаем уникальные производители запчастей вместо брендов автомобилей
        $manufacturers = SparePart::distinct()->pluck('manufacturer')->filter()->values();
        
        $carModels = CarModel::with('brand')
                    ->orderBy('brand_id')
                    ->orderBy('name')
                    ->get()
                    ->map(function($model) {
                        // Убираем кавычки из имени бренда
                        if ($model->brand && $model->brand->name) {
                            $model->brand->name = preg_replace('/^"(.+)"$/', '$1', $model->brand->name);
                        }
                        return $model;
                    });
        
        return inertia('Admin/SpareParts/Create', [
            'categories' => $categories,
            'manufacturers' => $manufacturers,
            'carModels' => $carModels
        ]);
    }

    /**
     * Сохранение новой запчасти через Inertia.js
     */
    public function storeInertia(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'required|string|max:100|unique:spare_parts',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:part_categories,id',
            'manufacturer' => 'required|string|max:255',
            'is_available' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'compatible_car_models' => 'nullable|array',
            'compatible_car_models.*' => 'exists:car_models,id',
        ]);
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('spare_parts', 'public');
            $validated['image'] = $imagePath;
        }
        
        // Получаем и удаляем количество из валидированных данных, 
        // так как будем устанавливать его через updateAvailability
        $quantity = (int)$validated['stock_quantity'];
        unset($validated['stock_quantity']);
        $validated['stock_quantity'] = 0; // Начальное значение
        
        // Создание запчасти с нулевым количеством
        $sparePart = SparePart::create($validated);
        
        // Установка количества через updateAvailability
        if ($quantity > 0) {
            $sparePart->updateAvailability($quantity);
        }
        
        // Добавление совместимых моделей автомобилей
        if ($request->has('compatible_car_models')) {
            $sparePart->compatibleCars()->attach($request->input('compatible_car_models'));
        }
        
        return redirect()->route('admin.spare-parts.inertia')
            ->with('success', 'Запчасть успешно добавлена');
    }

    /**
     * Отображение детальной информации о запчасти через Inertia.js
     */
    public function showInertia(SparePart $sparePart)
    {
        $sparePart->load(['category', 'carModels', 'analogs.analogSparePart']);
        
        return inertia('Admin/SpareParts/Show', [
            'sparePart' => $sparePart
        ]);
    }

    /**
     * Отображение формы редактирования запчасти через Inertia.js
     */
    public function editInertia(SparePart $sparePart)
    {
        $categories = PartCategory::all();
        
        // Получаем уникальные производители запчастей
        $manufacturers = SparePart::distinct()->pluck('manufacturer')->filter()->values();
        
        $carModels = CarModel::with('brand')
                    ->orderBy('brand_id')
                    ->orderBy('name')
                    ->get()
                    ->map(function($model) {
                        // Убираем кавычки из имени бренда
                        if ($model->brand && $model->brand->name) {
                            $model->brand->name = preg_replace('/^"(.+)"$/', '$1', $model->brand->name);
                        }
                        return $model;
                    });
        
        // Получение ID совместимых моделей
        $compatibleCarIds = $sparePart->carModels()->pluck('car_models.id')->toArray();
        
        return inertia('Admin/SpareParts/Edit', [
            'sparePart' => $sparePart,
            'categories' => $categories,
            'manufacturers' => $manufacturers,
            'carModels' => $carModels,
            'compatibleCarIds' => $compatibleCarIds
        ]);
    }

    /**
     * Обновление запчасти через Inertia.js
     */
    public function updateInertia(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'required|string|max:100|unique:spare_parts,part_number,' . $sparePart->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:part_categories,id',
            'manufacturer' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'compatible_car_models' => 'nullable|array',
            'compatible_car_models.*' => 'exists:car_models,id',
        ]);
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            // Удаление старого изображения
            if ($sparePart->image_url) {
                Storage::disk('public')->delete($sparePart->image_url);
            }
            
            $imagePath = $request->file('image')->store('spare_parts', 'public');
            $validated['image_url'] = $imagePath;
        }
        
        // Получаем текущее количество товара
        $oldQuantity = $sparePart->stock_quantity;
        $newQuantity = (int)$validated['stock_quantity'];
        
        // Вычисляем разницу для обновления количества
        $quantityDiff = $newQuantity - $oldQuantity;
        
        // Удаляем stock_quantity из валидированных данных, так как будем обновлять его через updateAvailability
        unset($validated['stock_quantity']);
        
        // Обновление запчасти без количества
        $sparePart->update($validated);
        
        // Обновление количества через updateAvailability
        if ($quantityDiff != 0) {
            $sparePart->updateAvailability($quantityDiff);
        }
        
        // Обновление совместимых моделей автомобилей
        if ($request->has('compatible_car_models')) {
            $sparePart->carModels()->sync($request->input('compatible_car_models'));
        } else {
            $sparePart->carModels()->detach();
        }
        
        return redirect()->route('admin.spare-parts.show-inertia', $sparePart->id)
            ->with('success', 'Запчасть успешно обновлена');
    }
} 