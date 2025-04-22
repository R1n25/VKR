<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Exception;

class VinApiService
{
    private string $apiUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->apiUrl = config('services.vin_api.url');
        $this->apiKey = config('services.vin_api.key');
    }

    /**
     * Search vehicle information by VIN
     *
     * @param string $vin
     * @return array
     * @throws Exception
     */
    public function searchByVin(string $vin)
    {
        $cacheKey = "vin_search_{$vin}";

        return Cache::remember($cacheKey, 3600, function () use ($vin) {
            $response = Http::withHeaders([
                'X-API-Key' => $this->apiKey
            ])->get("{$this->apiUrl}/search", [
                'vin' => $vin
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch vehicle data');
            }

            return $response->json();
        });
    }

    /**
     * Get part schemes for a specific vehicle
     *
     * @param string $vehicleId
     * @return array
     * @throws Exception
     */
    public function getSchemes(string $vehicleId)
    {
        $cacheKey = "vin_schemes_{$vehicleId}";

        return Cache::remember($cacheKey, 3600, function () use ($vehicleId) {
            $response = Http::withHeaders([
                'X-API-Key' => $this->apiKey
            ])->get("{$this->apiUrl}/schemes/{$vehicleId}");

            if (!$response->successful()) {
                throw new Exception('Failed to fetch vehicle schemes');
            }

            return $response->json();
        });
    }
} 