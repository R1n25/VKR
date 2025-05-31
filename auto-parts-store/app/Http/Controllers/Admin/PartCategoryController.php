<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PartCategoryController extends Controller
{
    /**
     * Отображение списка категорий запчастей
     */
    public function index()
    {
        $categories = PartCategory::withCount('spareParts')
            ->orderBy('name')
            ->get();

        return view('admin.part-categories.index', compact('categories'));
    }

    /**
     * Форма создания новой категории
     */
    public function create()
    {
        $categories = PartCategory::all();
        return view('admin.part-categories.create', compact('categories'));
    }

    /**
     * Сохранение новой категории
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:part_categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:part_categories,id',
            'image' => 'nullable|image|max:2048',
        ]);

        // Создаем slug из имени
        $validated['slug'] = Str::slug($validated['name']);

        // Обработка изображения
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('part_categories', 'public');
            $validated['image_url'] = $imagePath;
        }

        PartCategory::create($validated);

        return redirect()->route('admin.part-categories.index')
            ->with('success', 'Категория успешно создана');
    }

    /**
     * Отображение информации о категории
     */
    public function show(PartCategory $partCategory)
    {
        $partCategory->load('spareParts');
        
        return view('admin.part-categories.show', compact('partCategory'));
    }

    /**
     * Форма редактирования категории
     */
    public function edit(PartCategory $partCategory)
    {
        $categories = PartCategory::where('id', '!=', $partCategory->id)
            ->get();
            
        return view('admin.part-categories.edit', compact('partCategory', 'categories'));
    }

    /**
     * Обновление категории
     */
    public function update(Request $request, PartCategory $partCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:part_categories,name,' . $partCategory->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:part_categories,id',
            'image' => 'nullable|image|max:2048',
        ]);

        // Обновляем slug
        $validated['slug'] = Str::slug($validated['name']);

        // Обработка изображения
        if ($request->hasFile('image')) {
            // Удаляем старое изображение
            if ($partCategory->image_url) {
                Storage::disk('public')->delete($partCategory->image_url);
            }

            $imagePath = $request->file('image')->store('part_categories', 'public');
            $validated['image_url'] = $imagePath;
        }

        $partCategory->update($validated);

        return redirect()->route('admin.part-categories.index')
            ->with('success', 'Категория успешно обновлена');
    }

    /**
     * Удаление категории
     */
    public function destroy(PartCategory $partCategory)
    {
        // Проверяем, есть ли запчасти в этой категории
        if ($partCategory->spareParts()->count() > 0) {
            return redirect()->route('admin.part-categories.index')
                ->with('error', 'Невозможно удалить категорию, так как в ней есть запчасти');
        }

        // Удаляем изображение
        if ($partCategory->image_url) {
            Storage::disk('public')->delete($partCategory->image_url);
        }

        $partCategory->delete();

        return redirect()->route('admin.part-categories.index')
            ->with('success', 'Категория успешно удалена');
    }
} 