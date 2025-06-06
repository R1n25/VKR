<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\Request;

class SparePartController extends Controller
{
    /**
     * Получить список всех запчастей
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $parts = SparePart::with('category')->paginate(10);
        return response()->json($parts);
    }

    /**
     * Получить информацию о конкретной запчасти
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $part = SparePart::with('category')->findOrFail($id);
        return response()->json($part);
    }
} 