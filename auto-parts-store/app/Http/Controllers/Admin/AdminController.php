<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\User;
use App\Models\Order;
use App\Models\UserSuggestion;
use App\Models\PartCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Отображение панели управления администратора
     */
    public function dashboard(Request $request)
    {
        // Счетчики для панели управления
        $stats = [
            'users_count' => User::count(),
            'spare_parts_count' => SparePart::count(),
            'orders_count' => Order::count(),
            'pending_suggestions_count' => UserSuggestion::where('status', 'pending')->count(),
            'categories_count' => PartCategory::count(),
        ];
        
        // Последние предложения пользователей
        $recentSuggestions = UserSuggestion::with(['user', 'sparePart'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Последние заказы
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        // Добавляем информацию о суммах платежей
        foreach ($recentOrders as $order) {
            $order->total_paid = $order->getTotalPaidAmount();
        }
        
        // Получаем основные категории для отображения
        $topCategories = PartCategory::whereNull('parent_id')
            ->withCount('spareParts')
            ->orderBy('name')
            ->limit(10)
            ->get();
        
        // Если указан id категории, загружаем детальную информацию о ней
        $selectedCategory = null;
        $subcategories = null;
        
        if ($request->has('category_id')) {
            $selectedCategory = PartCategory::with(['parent', 'spareParts'])
                ->findOrFail($request->category_id);
            
            $subcategories = PartCategory::where('parent_id', $selectedCategory->id)
                ->withCount('spareParts')
                ->orderBy('name')
                ->get();
        }
        
        // Проверяем, запрашивается ли Inertia-версия
        if (request()->wantsJson() || request()->header('X-Inertia')) {
            return Inertia::render('Admin/Dashboard', [
                'stats' => $stats,
                'recentSuggestions' => $recentSuggestions,
                'recentOrders' => $recentOrders,
                'topCategories' => $topCategories,
                'selectedCategory' => $selectedCategory,
                'subcategories' => $subcategories,
            ]);
        }
        
        // Возвращаем обычное Laravel-представление
        return view('admin.dashboard', compact(
            'stats', 
            'recentSuggestions', 
            'recentOrders', 
            'topCategories',
            'selectedCategory',
            'subcategories'
        ));
    }
}
