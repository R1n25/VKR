<?php

namespace App\Services;

use App\Models\VinRequest;
use Illuminate\Support\Facades\Auth;

class VinRequestService
{
    /**
     * Создать новый VIN-запрос
     * 
     * @param array $data Данные запроса
     * @return \App\Models\VinRequest
     */
    public function createRequest(array $data)
    {
        // Получаем текущего пользователя
        $user = Auth::user();
        
        // Создаем запрос
        $vinRequest = new VinRequest();
        $vinRequest->user_id = $user->id;
        $vinRequest->vin = $data['vin'];
        $vinRequest->car_make = $data['car_make'] ?? null;
        $vinRequest->car_model = $data['car_model'] ?? null;
        $vinRequest->year = $data['year'] ?? null;
        $vinRequest->parts_list = $data['parts_list'] ?? null;
        $vinRequest->additional_info = $data['additional_info'] ?? null;
        $vinRequest->status = 'pending'; // Начальный статус - в ожидании
        $vinRequest->save();
        
        return $vinRequest;
    }
    
    /**
     * Получить список VIN-запросов пользователя
     * 
     * @param int $userId ID пользователя
     * @param int $limit Ограничение количества запросов
     * @param string $sortBy Поле для сортировки
     * @param string $sortDirection Направление сортировки
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserRequests(int $userId, int $limit = 10, string $sortBy = 'created_at', string $sortDirection = 'desc')
    {
        return VinRequest::where('user_id', $userId)
            ->orderBy($sortBy, $sortDirection)
            ->limit($limit)
            ->get();
    }
    
    /**
     * Получить список последних VIN-запросов пользователя
     * 
     * @param int $userId ID пользователя
     * @param int $limit Ограничение количества запросов
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRecentUserRequests(int $userId, int $limit = 5)
    {
        return $this->getUserRequests($userId, $limit);
    }
    
    /**
     * Получить детальную информацию о VIN-запросе
     * 
     * @param int $requestId ID запроса
     * @param int $userId ID пользователя (для проверки прав доступа)
     * @return \App\Models\VinRequest|null
     */
    public function getRequestDetails(int $requestId, int $userId)
    {
        return VinRequest::where('id', $requestId)
            ->where('user_id', $userId)
            ->first();
    }
    
    /**
     * Обновить статус VIN-запроса
     * 
     * @param int $requestId ID запроса
     * @param string $status Новый статус
     * @param string $adminComment Комментарий администратора (опционально)
     * @return bool
     */
    public function updateRequestStatus(int $requestId, string $status, string $adminComment = null)
    {
        $vinRequest = VinRequest::find($requestId);
        
        if (!$vinRequest) {
            return false;
        }
        
        $vinRequest->status = $status;
        
        if ($adminComment) {
            $vinRequest->admin_comment = $adminComment;
        }
        
        return $vinRequest->save();
    }
    
    /**
     * Отменить VIN-запрос
     * 
     * @param int $requestId ID запроса
     * @param int $userId ID пользователя (для проверки прав доступа)
     * @return bool
     */
    public function cancelRequest(int $requestId, int $userId)
    {
        $vinRequest = VinRequest::where('id', $requestId)
            ->where('user_id', $userId)
            ->first();
        
        if (!$vinRequest || $vinRequest->status != 'pending') {
            return false;
        }
        
        $vinRequest->status = 'cancelled';
        return $vinRequest->save();
    }
    
    /**
     * Получить все статусы VIN-запросов для использования в интерфейсе
     * 
     * @return array
     */
    public function getAllStatuses()
    {
        return [
            'pending' => 'Ожидает обработки',
            'processing' => 'В обработке',
            'completed' => 'Завершен',
            'cancelled' => 'Отменен',
            'rejected' => 'Отклонен'
        ];
    }
    
    /**
     * Получить CSS-класс для статуса
     * 
     * @param string $status Статус запроса
     * @return string CSS-класс
     */
    public function getStatusClass(string $status)
    {
        $classes = [
            'pending' => 'bg-yellow-100 text-yellow-800',
            'processing' => 'bg-blue-100 text-blue-800',
            'completed' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-gray-100 text-gray-800',
            'rejected' => 'bg-red-100 text-red-800'
        ];
        
        return $classes[$status] ?? 'bg-gray-100 text-gray-800';
    }
} 