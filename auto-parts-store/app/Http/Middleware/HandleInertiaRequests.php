<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
        ];
    }

    /**
     * Determine if the given request is asking for JSON.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    public function isInertiaRequest(Request $request)
    {
        // Для страницы /brands всегда возвращаем false,
        // чтобы принудительно использовать HTML-ответ
        if ($request->is('brands') || $request->is('brands/*')) {
            return false;
        }
        
        return parent::isInertiaRequest($request);
    }
}
