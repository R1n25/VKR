<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VinSearch extends Model
{
    protected $fillable = [
        'vin',
        'user_id',
        'vehicle_info',
        'make',
        'model',
        'year',
        'engine',
        'transmission',
        'body_type'
    ];

    protected $casts = [
        'vehicle_info' => 'array',
        'year' => 'integer'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function decodeVin()
    {
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->get(config('services.vin_api.url') . '/decode/' . $this->vin, [
                'headers' => [
                    'Authorization' => 'Bearer ' . config('services.vin_api.key'),
                    'Accept' => 'application/json',
                ],
            ]);

            $data = json_decode($response->getBody(), true);

            $this->vehicle_info = $data;
            $this->make = $data['make'] ?? null;
            $this->model = $data['model'] ?? null;
            $this->year = $data['year'] ?? null;
            $this->engine = $data['engine'] ?? null;
            $this->transmission = $data['transmission'] ?? null;
            $this->body_type = $data['body_type'] ?? null;

            $this->save();

            return $data;
        } catch (\Exception $e) {
            \Log::error('VIN Decode Error: ' . $e->getMessage(), [
                'vin' => $this->vin,
                'error' => $e->getMessage()
            ]);
            throw new \Exception('Ошибка при декодировании VIN: ' . $e->getMessage());
        }
    }
} 