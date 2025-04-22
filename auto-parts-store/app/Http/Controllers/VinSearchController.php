<?php

namespace App\Http\Controllers;

use App\Services\VinApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class VinSearchController extends Controller
{
    private VinApiService $vinService;

    public function __construct(VinApiService $vinService)
    {
        $this->vinService = $vinService;
    }

    /**
     * Display the VIN search page
     */
    public function index()
    {
        return Inertia::render('VinSearch/Index');
    }

    /**
     * Search vehicle by VIN
     */
    public function search(Request $request)
    {
        $request->validate([
            'vin' => 'required|string|size:17'
        ]);

        try {
            $searchResult = $this->vinService->searchByVin($request->vin);
            return response()->json($searchResult);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не удалось найти информацию по VIN номеру'
            ], 422);
        }
    }

    /**
     * Get part schemes for a vehicle
     */
    public function getSchemes(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|string'
        ]);

        try {
            $schemes = $this->vinService->getSchemes($request->vehicle_id);
            return response()->json($schemes);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не удалось получить схемы запчастей'
            ], 422);
        }
    }
} 