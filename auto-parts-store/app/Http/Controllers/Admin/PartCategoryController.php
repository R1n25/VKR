<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartCategory;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PartCategoryController extends Controller
{
    /**
     * Отображение списка категорий запчастей
     */
    public function indexInertia()
    {
        $categories = PartCategory::with('parent')
            ->withCount('spareParts')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Форма создания новой категории
     */
    public function createInertia()
    {
        $categories = PartCategory::all();
        $spareParts = SparePart::orderBy('name')->get();
        
        return Inertia::render('Admin/Categories/Create', [
            'categories' => $categories,
            'spareParts' => $spareParts
        ]);
    }

    /**
     * Сохранение новой категории
     */
    public function storeInertia(Request $request)
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

        // Создаем категорию
        $category = PartCategory::create($validated);

        // Если переданы ID запчастей, связываем их с категорией
        if ($request->has('spare_parts') && is_array($request->spare_parts)) {
            $spareParts = SparePart::whereIn('id', $request->spare_parts)->get();
            foreach ($spareParts as $sparePart) {
                $sparePart->category_id = $category->id;
                $sparePart->save();
            }
        }

        return redirect()->route('admin.part-categories.index')
            ->with('success', 'Категория успешно создана');
    }

    /**
     * Отображение информации о категории
     */
    public function showInertia(PartCategory $partCategory)
    {
        // Загружаем родительскую категорию
        $partCategory->load('parent');
        
        // Загружаем подкатегории
        $subcategories = PartCategory::where('parent_id', $partCategory->id)
            ->withCount('spareParts')
            ->orderBy('name')
            ->get();
        
        // Загружаем запчасти в этой категории
        $spareParts = $partCategory->spareParts()->with('category')->get();
        
        return Inertia::render('Admin/Categories/Show', [
            'category' => $partCategory,
            'subcategories' => $subcategories,
            'spareParts' => $spareParts
        ]);
    }

    /**
     * Форма редактирования категории
     */
    public function editInertia(PartCategory $partCategory)
    {
        $categories = PartCategory::where('id', '!=', $partCategory->id)
            ->get();
        
        // Загружаем запчасти с указанием, какие уже относятся к этой категории
        $spareParts = SparePart::orderBy('name')->get();
        $categorySparePartIds = $partCategory->spareParts->pluck('id')->toArray();
            
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $partCategory,
            'categories' => $categories,
            'spareParts' => $spareParts,
            'categorySparePartIds' => $categorySparePartIds
        ]);
    }

    /**
     * Обновление категории
     */
    public function updateInertia(Request $request, PartCategory $partCategory)
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

        // Обновляем связи с запчастями
        if ($request->has('spare_parts')) {
            // Сначала сбрасываем категорию у всех запчастей, которые были в этой категории
            SparePart::where('category_id', $partCategory->id)
                ->update(['category_id' => null]);
            
            // Затем устанавливаем категорию для выбранных запчастей
            if (is_array($request->spare_parts) && count($request->spare_parts) > 0) {
                SparePart::whereIn('id', $request->spare_parts)
                    ->update(['category_id' => $partCategory->id]);
            }
        }

        return redirect()->route('admin.part-categories.index')
            ->with('success', 'Категория успешно обновлена');
    }

    /**
     * Удаление категории
     */
    public function destroyInertia(PartCategory $partCategory)
    {
        try {
            // Проверяем, есть ли запчасти в этой категории
            $spareParts = $partCategory->spareParts;
            
            if ($spareParts->count() > 0) {
                // Обнуляем категорию у всех запчастей
                foreach ($spareParts as $sparePart) {
                    $sparePart->category_id = null;
                    $sparePart->save();
                }
            }
            
            // Проверяем, есть ли подкатегории
            $subcategories = PartCategory::where('parent_id', $partCategory->id)->get();
            if ($subcategories->count() > 0) {
                // Обнуляем родительскую категорию у всех подкатегорий
                foreach ($subcategories as $subcategory) {
                    $subcategory->parent_id = null;
                    $subcategory->save();
                }
            }

            // Удаляем изображение
            if ($partCategory->image_url) {
                Storage::disk('public')->delete($partCategory->image_url);
            }

            $partCategory->delete();

            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Категория успешно удалена'
                ]);
            }

            return redirect()->route('admin.part-categories.index')
                ->with('success', 'Категория успешно удалена');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при удалении категории: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->route('admin.part-categories.index')
                ->with('error', 'Ошибка при удалении категории: ' . $e->getMessage());
        }
    }
} 