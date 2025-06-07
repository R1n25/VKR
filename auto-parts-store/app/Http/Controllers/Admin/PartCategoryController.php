<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        // Загружаем связанные запчасти
        $partCategory->load('spareParts');
        
        // Загружаем подкатегории
        $subcategories = PartCategory::where('parent_id', $partCategory->id)
            ->withCount('spareParts')
            ->orderBy('name')
            ->get();
        
        return view('admin.part-categories.show', compact('partCategory', 'subcategories'));
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
        $spareParts = $partCategory->spareParts;
        
        if ($spareParts->count() > 0) {
            // Вместо запрета на удаление категории, помечаем все запчасти в ней как "не в наличии"
            foreach ($spareParts as $sparePart) {
                $sparePart->is_available = false;
                $sparePart->stock_quantity = 0;
                $sparePart->save();
            }
        }

        // Удаляем изображение
        if ($partCategory->image_url) {
            Storage::disk('public')->delete($partCategory->image_url);
        }

        $partCategory->delete();

        return redirect()->route('admin.part-categories.index')
            ->with('success', 'Категория успешно удалена. Все запчасти в этой категории помечены как "не в наличии"');
    }

    /**
     * Отображение списка категорий запчастей (Inertia)
     */
    public function indexInertia()
    {
        $categories = PartCategory::with('parent')
            ->withCount('spareParts')
            ->orderBy('name')
            ->get();

        return inertia('Admin/Categories/Index', [
            'categories' => $categories,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Форма создания новой категории (Inertia)
     */
    public function createInertia()
    {
        $categories = PartCategory::all();
        $spareParts = \App\Models\SparePart::orderBy('name')->get();
        
        return inertia('Admin/Categories/Create', [
            'categories' => $categories,
            'spareParts' => $spareParts
        ]);
    }

    /**
     * Отображение информации о категории (Inertia)
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
        
        return inertia('Admin/Categories/Show', [
            'category' => $partCategory,
            'subcategories' => $subcategories,
            'spareParts' => $spareParts
        ]);
    }

    /**
     * Форма редактирования категории (Inertia)
     */
    public function editInertia(PartCategory $partCategory)
    {
        $categories = PartCategory::where('id', '!=', $partCategory->id)
            ->get();
        
        // Загружаем запчасти с указанием, какие уже относятся к этой категории
        $spareParts = \App\Models\SparePart::orderBy('name')->get();
        $categorySparePartIds = $partCategory->spareParts->pluck('id')->toArray();
            
        return inertia('Admin/Categories/Edit', [
            'category' => $partCategory,
            'categories' => $categories,
            'spareParts' => $spareParts,
            'categorySparePartIds' => $categorySparePartIds
        ]);
    }

    /**
     * Сохранение новой категории через Inertia
     */
    public function storeInertia(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:part_categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:part_categories,id',
            'image' => 'nullable|image|max:2048',
            'spare_parts' => 'nullable|array',
            'spare_parts.*' => 'exists:spare_parts,id',
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

        // Обновляем category_id у выбранных запчастей
        if ($request->has('spare_parts')) {
            \App\Models\SparePart::whereIn('id', $request->input('spare_parts'))
                ->update(['category_id' => $category->id]);
        }

        return redirect()->route('admin.part-categories.inertia')
            ->with('success', 'Категория успешно создана');
    }

    /**
     * Обновление категории через Inertia
     */
    public function updateInertia(Request $request, PartCategory $partCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:part_categories,name,' . $partCategory->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:part_categories,id',
            'image' => 'nullable|image|max:2048',
            'spare_parts' => 'nullable|array',
            'spare_parts.*' => 'exists:spare_parts,id',
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

        // Обновляем категорию
        $partCategory->update($validated);

        // Сначала сбрасываем категорию у всех запчастей, которые принадлежали этой категории
        \App\Models\SparePart::where('category_id', $partCategory->id)
            ->update(['category_id' => null]);

        // Затем устанавливаем категорию для выбранных запчастей
        if ($request->has('spare_parts')) {
            \App\Models\SparePart::whereIn('id', $request->input('spare_parts'))
                ->update(['category_id' => $partCategory->id]);
        }

        // Изменяем перенаправление на Inertia-версию вместо Blade
        return redirect()->route('admin.part-categories.inertia')
            ->with('success', 'Категория успешно обновлена');
    }

    /**
     * Удаление категории через Inertia
     */
    public function destroyInertia(PartCategory $partCategory)
    {
        // Проверяем, есть ли запчасти в этой категории
        $spareParts = $partCategory->spareParts;
        
        if ($spareParts->count() > 0) {
            // Вместо запрета на удаление категории, помечаем все запчасти в ней как "не в наличии"
            foreach ($spareParts as $sparePart) {
                $sparePart->is_available = false;
                $sparePart->stock_quantity = 0;
                $sparePart->save();
            }
        }

        // Удаляем изображение
        if ($partCategory->image_url) {
            Storage::disk('public')->delete($partCategory->image_url);
        }

        $partCategory->delete();

        return redirect()->route('admin.part-categories.inertia')
            ->with('success', 'Категория успешно удалена. Все запчасти в этой категории помечены как "не в наличии"');
    }
} 