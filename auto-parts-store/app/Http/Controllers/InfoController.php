<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class InfoController extends Controller
{
    /**
     * Страница "О нас"
     */
    public function about()
    {
        return Inertia::render('About', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Страница "Контакты"
     */
    public function contacts()
    {
        return Inertia::render('Contacts', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Страница "Новости"
     */
    public function news()
    {
        return Inertia::render('News', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Страница "Карта проезда"
     */
    public function locationMap()
    {
        return Inertia::render('LocationMap', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
} 