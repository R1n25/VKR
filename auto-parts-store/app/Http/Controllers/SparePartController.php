<?php

namespace App\Http\Controllers;

use App\Services\SparePartService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SparePartController extends Controller
{
    protected SparePartService $sparePartService;

    public function __construct(SparePartService $sparePartService)
    {
        $this->sparePartService = $sparePartService;
    }

    /**
     * Проверить, является ли текущий пользователь администратором
     *
     * @return bool
     */
    protected function isAdmin(): bool
    {
        return auth()->check() && auth()->user()->is_admin;
    }

    /**
     * Поиск запчастей
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        $isAdmin = $this->isAdmin();
        $spareParts = $this->sparePartService->searchSpareParts($query, $isAdmin);

        return Inertia::render('Search', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'searchQuery' => $query,
            'spareParts' => $spareParts,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Показать детали запчасти
     */
    public function show($id)
    {
        $isAdmin = $this->isAdmin();
        $sparePart = $this->sparePartService->getSparePartById($id, $isAdmin);

        if (!$sparePart) {
            abort(404);
        }

        return Inertia::render('Parts/Show', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'sparePart' => $sparePart,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Показать все запчасти, совместимые с указанной моделью автомобиля
     */
    public function byCarModel($carModelId)
    {
        $isAdmin = $this->isAdmin();
        $spareParts = $this->sparePartService->getSparePartsByCarModel($carModelId, $isAdmin);

        return Inertia::render('Parts/ByCarModel', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'spareParts' => $spareParts,
            'carModelId' => $carModelId,
            'isAdmin' => $isAdmin,
        ]);
    }
}