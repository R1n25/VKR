<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\User;
use App\Models\Order;
use App\Models\UserSuggestion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Отображение панели управления администратора
     */
    public function dashboard()
    {
        // Счетчики для панели управления
        $stats = [
            'users_count' => User::count(),
            'spare_parts_count' => SparePart::count(),
            'orders_count' => Order::count(),
            'pending_suggestions_count' => UserSuggestion::where('status', 'pending')->count(),
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
        
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentSuggestions' => $recentSuggestions,
            'recentOrders' => $recentOrders,
        ]);
    }
}
