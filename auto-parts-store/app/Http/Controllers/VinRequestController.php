<?php

namespace App\Http\Controllers;

use App\Models\VinRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VinRequestController extends Controller
{
    /**
     * Отображает форму подбора запчастей по VIN
     */
    public function index()
    {
        return Inertia::render('VinRequest/Index', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Сохраняет новый запрос на подбор запчастей по VIN
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vin_code' => 'required|string|min:17|max:17',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'parts_description' => 'required|string|min:10',
        ]);

        // Переименовываем поле vin_code в vin для соответствия структуре таблицы
        $validated['vin'] = $validated['vin_code'];
        unset($validated['vin_code']);

        // Если пользователь авторизован, добавляем его ID к запросу
        if (Auth::check()) {
            $validated['user_id'] = Auth::id();
        }

        $vinRequest = VinRequest::create($validated);

        return redirect()->route('vin-request.success')->with('vinRequestId', $vinRequest->id);
    }

    /**
     * Отображает страницу успешной отправки запроса
     */
    public function success()
    {
        return Inertia::render('VinRequest/Success', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'requestId' => session('vinRequestId'),
        ]);
    }

    /**
     * Отображает список запросов пользователя
     */
    public function userRequests()
    {
        $requests = VinRequest::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('VinRequest/UserRequests', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'requests' => $requests,
        ]);
    }
    
    /**
     * Отображает детальную информацию о VIN-запросе
     */
    public function show($id)
    {
        // Получаем запрос и проверяем, что он принадлежит текущему пользователю
        $request = VinRequest::where('id', $id)
            ->where(function($query) {
                $query->where('user_id', Auth::id())
                    ->orWhere('email', Auth::user()->email);
            })
            ->firstOrFail();
            
        return Inertia::render('VinRequest/Show', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'request' => $request,
        ]);
    }
} 