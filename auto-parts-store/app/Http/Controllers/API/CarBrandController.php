<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CarBrand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CarBrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CarBrand::query();
        
        // Фильтрация по популярным брендам
        if ($request->has('popular') && $request->popular) {
            $query->where('is_popular', true);
        }
        
        // Получаем бренды
        $brands = $query->get();
        
        // Удаляем кавычки из названий брендов
        $brands = $brands->map(function($brand) {
            $brand->name = preg_replace('/^"(.+)"$/', '$1', $brand->name);
            return $brand;
        });
        
        return response()->json(['data' => $brands]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:car_brands',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048'
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('brands', 'public');
            $validated['image'] = $path;
        }

        $brand = CarBrand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Бренд успешно создан',
            'data' => $brand
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $brand = CarBrand::with(['carModels' => function($query) {
            $query->orderBy('name', 'asc');
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $brand
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $brand = CarBrand::findOrFail($id);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('car_brands')->ignore($brand->id)],
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048'
        ]);
        
        if ($request->filled('name') && $brand->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        if ($request->hasFile('image')) {
            // Удаляем старое изображение
            if ($brand->image) {
                Storage::disk('public')->delete($brand->image);
            }
            
            $path = $request->file('image')->store('brands', 'public');
            $validated['image'] = $path;
        }
        
        $brand->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Бренд успешно обновлен',
            'data' => $brand
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $brand = CarBrand::findOrFail($id);
        
        // Удаляем изображение
        if ($brand->image) {
            Storage::disk('public')->delete($brand->image);
        }
        
        $brand->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Бренд успешно удален'
        ]);
    }
}
