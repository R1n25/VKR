<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PartCategory;
use App\Models\SparePart;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /**
     * Отображение страницы категории запчастей
     * 
     * @param Request $request
     * @param int $id
     * @return \Inertia\Response
     */
    public function show(Request $request, $id)
    {
        // Получаем категорию со связями
        $category = PartCategory::with(['parent', 'children'])->findOrFail($id);
        
        // Возвращаем представление Inertia с категорией
        return Inertia::render('Category/Show', [
            'category' => $category,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }
} 