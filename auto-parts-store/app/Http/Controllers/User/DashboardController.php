<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\VinRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Получаем VIN-запросы пользователя
        $vinRequests = VinRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        return Inertia::render('User/Dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'vinRequests' => $vinRequests,
        ]);
    }
}
