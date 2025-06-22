<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VinRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VinRequestController extends Controller
{
    /**
     * Отображает список всех VIN-запросов
     */
    public function index()
    {
        $requests = VinRequest::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/VinRequests/Index', [
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
        $request = VinRequest::findOrFail($id);

        return Inertia::render('Admin/VinRequests/Show', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'request' => $request,
        ]);
    }

    /**
     * Обновляет статус VIN-запроса
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,processing,completed,cancelled',
            'admin_notes' => 'nullable|string',
        ]);

        $vinRequest = VinRequest::findOrFail($id);
        
        // Если статус изменился на 'completed', устанавливаем processed_at
        if ($validated['status'] === 'completed' && $vinRequest->status !== 'completed') {
            $validated['processed_at'] = now();
        }
        
        $vinRequest->update($validated);

        return redirect()->back()->with('success', 'Статус запроса обновлен');
    }
} 