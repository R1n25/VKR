<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CarModel;
use App\Models\CarBrand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CarModelController extends Controller
{
    /**
     * Отображение списка моделей автомобилей
     */
    public function index()
    {
        $carModels = CarModel::with('brand')
            ->orderBy('brand_id')
            ->orderBy('name')
            ->get()
            ->map(function($model) {
                // Убираем кавычки из имени модели и бренда
                if ($model->brand && $model->brand->name) {
                    $model->brand->name = preg_replace('/^"(.+)"$/', '$1', $model->brand->name);
                }
                $model->name = preg_replace('/^"(.+)"$/', '$1', $model->name);
                return $model;
            });
        
        $brands = CarBrand::orderBy('name')->get();
            
        return Inertia::render('Admin/CarModels/Index', [
            'carModels' => $carModels,
            'brands' => $brands
        ]);
    }
    
    /**
     * Отображение формы создания модели автомобиля
     */
    public function create()
    {
        $brands = CarBrand::orderBy('name')->get()
            ->map(function($brand) {
                // Убираем кавычки из имени бренда
                $brand->name = preg_replace('/^"(.+)"$/', '$1', $brand->name);
                return $brand;
            });
            
        return Inertia::render('Admin/CarModels/Create', [
            'brands' => $brands
        ]);
    }
    
    /**
     * Сохранение новой модели автомобиля
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:car_brands,id',
            'year_start' => 'nullable|integer|min:1900|max:' . (date('Y') + 5),
            'year_end' => 'nullable|integer|min:1900|max:' . (date('Y') + 5),
            'generation' => 'nullable|string|max:50',
            'body_type' => 'nullable|string|max:50',
            'engine_type' => 'nullable|string|max:50',
            'engine_volume' => 'nullable|string|max:50',
            'transmission_type' => 'nullable|string|max:50',
            'drive_type' => 'nullable|string|max:50',
            'is_popular' => 'boolean',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);
        
        // Создаем slug из имени
        $validated['slug'] = Str::slug($validated['name']);
        
        // Установка флага is_popular
        $validated['is_popular'] = $request->has('is_popular');
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('car_models', 'public');
            $validated['image_url'] = $imagePath;
        }
        
        CarModel::create($validated);
        
        return redirect()->route('admin.car-models.index')
            ->with('success', 'Модель автомобиля успешно добавлена');
    }
    
    /**
     * Отображение детальной информации о модели автомобиля
     */
    public function show(CarModel $carModel)
    {
        $carModel->load('brand');
        
        // Убираем кавычки из имени модели и бренда
        if ($carModel->brand && $carModel->brand->name) {
            $carModel->brand->name = preg_replace('/^"(.+)"$/', '$1', $carModel->brand->name);
        }
        $carModel->name = preg_replace('/^"(.+)"$/', '$1', $carModel->name);
        
        return Inertia::render('Admin/CarModels/Show', [
            'carModel' => $carModel
        ]);
    }
    
    /**
     * Отображение формы редактирования модели автомобиля
     */
    public function edit(CarModel $carModel)
    {
        $brands = CarBrand::orderBy('name')->get()
            ->map(function($brand) {
                // Убираем кавычки из имени бренда
                $brand->name = preg_replace('/^"(.+)"$/', '$1', $brand->name);
                return $brand;
            });
        
        // Убираем кавычки из имени модели
        $carModel->name = preg_replace('/^"(.+)"$/', '$1', $carModel->name);
        
        return Inertia::render('Admin/CarModels/Edit', [
            'carModel' => $carModel,
            'brands' => $brands
        ]);
    }
    
    /**
     * Обновление модели автомобиля
     */
    public function update(Request $request, CarModel $carModel)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:car_brands,id',
            'year_start' => 'nullable|integer|min:1900|max:' . (date('Y') + 5),
            'year_end' => 'nullable|integer|min:1900|max:' . (date('Y') + 5),
            'generation' => 'nullable|string|max:50',
            'body_type' => 'nullable|string|max:50',
            'engine_type' => 'nullable|string|max:50',
            'engine_volume' => 'nullable|string|max:50',
            'transmission_type' => 'nullable|string|max:50',
            'drive_type' => 'nullable|string|max:50',
            'is_popular' => 'boolean',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);
        
        // Обновляем slug только если изменилось имя
        if ($carModel->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        // Установка флага is_popular
        $validated['is_popular'] = $request->has('is_popular');
        
        // Обработка изображения
        if ($request->hasFile('image')) {
            // Удаляем старое изображение
            if ($carModel->image_url) {
                Storage::disk('public')->delete($carModel->image_url);
            }
            
            $imagePath = $request->file('image')->store('car_models', 'public');
            $validated['image_url'] = $imagePath;
        }
        
        $carModel->update($validated);
        
        return redirect()->route('admin.car-models.index')
            ->with('success', 'Модель автомобиля успешно обновлена');
    }
    
    /**
     * Удаление модели автомобиля
     */
    public function destroy(CarModel $carModel)
    {
        // Удаляем изображение
        if ($carModel->image_url) {
            Storage::disk('public')->delete($carModel->image_url);
        }
        
        $carModel->delete();
        
        return redirect()->route('admin.car-models.index')
            ->with('success', 'Модель автомобиля успешно удалена');
    }
    
    /**
     * Удаление изображения модели автомобиля
     */
    public function deleteImage(CarModel $carModel)
    {
        // Удаляем изображение
        if ($carModel->image_url) {
            Storage::disk('public')->delete($carModel->image_url);
            $carModel->image_url = null;
            $carModel->save();
        }
        
        return redirect()->route('admin.car-models.edit', $carModel)
            ->with('success', 'Изображение успешно удалено');
    }
} 