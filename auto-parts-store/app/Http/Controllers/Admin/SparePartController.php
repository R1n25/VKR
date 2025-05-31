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
                  ->orWhere('article_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }
        
        if ($request->filled('manufacturer')) {
            $query->where('manufacturer', $request->input('manufacturer'));
        }
        
        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active' ? 1 : 0);
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
        $carModels = CarModel::orderBy('brand')->orderBy('name')->get();
        
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
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'compatible_car_models' => 'nullable|array',
            'compatible_car_models.*' => 'exists:car_models,id',
        ]);
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('spare_parts', 'public');
            $validated['image'] = $imagePath;
        }
        
        // Установка статуса активности
        $validated['is_active'] = $request->has('is_active');
        
        // Создание запчасти
        $sparePart = SparePart::create($validated);
        
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
        $carModels = CarModel::orderBy('brand')->orderBy('name')->get();
        
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
            'is_active' => 'boolean',
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
        
        // Установка статуса активности
        $validated['is_active'] = $request->has('is_active');
        
        // Обновление запчасти
        $sparePart->update($validated);
        
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
        // Проверка на наличие связанных заказов
        if ($sparePart->orderItems()->count() > 0) {
            return redirect()->route('admin.spare-parts.index')
                ->with('error', 'Невозможно удалить запчасть, так как она связана с заказами');
        }
        
        // Удаление изображения
        if ($sparePart->image) {
            Storage::disk('public')->delete($sparePart->image);
        }
        
        // Удаление связей с моделями автомобилей
        $sparePart->compatibleCars()->detach();
        
        // Удаление связей с аналогами
        $sparePart->analogs()->detach();
        $sparePart->parentAnalogs()->detach();
        
        // Удаление запчасти
        $sparePart->delete();
        
        return redirect()->route('admin.spare-parts.index')
            ->with('success', 'Запчасть успешно удалена');
    }
    
    /**
     * Быстрое изменение статуса активности
     */
    public function toggleStatus(SparePart $sparePart)
    {
        $sparePart->is_active = !$sparePart->is_active;
        $sparePart->save();
        
        return response()->json([
            'success' => true,
            'is_active' => $sparePart->is_active,
        ]);
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
                  ->orWhere('article_number', 'like', "%{$search}%")
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
} 