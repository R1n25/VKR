<?php

namespace App\Services;

use App\Models\SparePart;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SparePartService
{
    // Процент наценки по умолчанию для обычных пользователей и гостей
    const DEFAULT_MARKUP_PERCENT = 25.0;

    /**
     * Получить популярные запчасти для отображения на главной странице
     * 
     * @param int $limit Количество запчастей для отображения
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getPopularSpareParts(int $limit = 8, bool $isAdmin = false, ?float $markupPercent = null)
    {
        $spareParts = SparePart::query()
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0)
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->with('carModels')
            ->get();

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
    }
    
    /**
     * Получить информацию о конкретной запчасти по ID
     * 
     * @param int $id ID запчасти
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return SparePart|null
     */
    public function getSparePartById(int $id, bool $isAdmin = false, ?float $markupPercent = null)
    {
        $sparePart = SparePart::with('carModels')->find($id);
        
        if ($sparePart) {
            // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
            if ($markupPercent === null) {
                $markupPercent = $this->getUserMarkupPercent();
            }
            
            $this->formatSparePartWithPrice($sparePart, $isAdmin, $markupPercent);
        }
        
        return $sparePart;
    }
    
    /**
     * Получить похожие запчасти для указанной запчасти
     * 
     * @param int $sparePartId ID запчасти
     * @param int $limit Количество похожих запчастей
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getSimilarSpareParts(int $sparePartId, int $limit = 4, bool $isAdmin = false, ?float $markupPercent = null)
    {
        // Получаем информацию о текущей запчасти
        $sparePart = $this->getSparePartById($sparePartId);
        
        if (!$sparePart) {
            return collect([]);
        }
        
        // Находим запчасти той же категории
        $similarParts = SparePart::query()
            ->where('id', '!=', $sparePartId)
            ->where('category', $sparePart->category)
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0)
            ->inRandomOrder()
            ->limit($limit)
            ->get();
            
        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($similarParts, $isAdmin, $markupPercent);
    }
    
    /**
     * Поиск запчастей по названию или артикулу
     * 
     * @param string|null $query Поисковый запрос
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function searchSpareParts(?string $query, bool $isAdmin = false, ?float $markupPercent = null)
    {
        $query = $query ?? '';
        
        $spareParts = SparePart::query()
            ->where(function (Builder $builder) use ($query) {
                $builder->where('name', 'like', "%{$query}%")
                    ->orWhere('part_number', 'like', "%{$query}%")
                    ->orWhere('part_number', $query) // Точное совпадение артикула
                    ->orWhere(DB::raw('LOWER(part_number)'), 'like', '%' . strtolower($query) . '%') // Поиск без учета регистра
                    ->orWhere(DB::raw('LOWER(part_number)'), strtolower($query)) // Точное совпадение без учета регистра
                    ->orWhere('manufacturer', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->with('carModels')
            ->get();

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
    }
    
    /**
     * Получить запчасти, совместимые с определенной моделью автомобиля
     *
     * @param int $carModelId ID модели автомобиля
     * @param array $filters Фильтры
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getSparePartsByCarModel(int $carModelId, array $filters = [], bool $isAdmin = false, ?float $markupPercent = null)
    {
        $query = SparePart::whereHas('carModels', function (Builder $query) use ($carModelId) {
            $query->where('car_models.id', $carModelId);
        });
        
        // Применяем фильтры
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        
        if (!empty($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }
        
        if (!empty($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }
        
        if (!empty($filters['in_stock']) && $filters['in_stock']) {
            $query->where('stock_quantity', '>', 0);
        }
        
        // Сортировка
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;
                default:
                    $query->orderBy('name', 'asc');
            }
        } else {
            $query->orderBy('name', 'asc');
        }
        
        $spareParts = $query->get();

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
    }

    /**
     * Получить процент наценки для текущего пользователя
     * 
     * @return float
     */
    protected function getUserMarkupPercent(): float
    {
        // Если пользователь авторизован
        if (Auth::check()) {
            $user = Auth::user();
            
            // Если у пользователя задан индивидуальный процент наценки
            if ($user->markup_percent !== null) {
                return (float)$user->markup_percent;
            }
        }
        
        // Возвращаем процент по умолчанию
        return self::DEFAULT_MARKUP_PERCENT;
    }
    
    /**
     * Форматировать коллекцию запчастей с учетом цен и прав пользователя
     * 
     * @param Collection $spareParts
     * @param bool $isAdmin
     * @param float $markupPercent
     * @return Collection
     */
    protected function formatSparePartsWithPrices(Collection $spareParts, bool $isAdmin = false, float $markupPercent = self::DEFAULT_MARKUP_PERCENT): Collection
    {
        return $spareParts->map(function ($sparePart) use ($isAdmin, $markupPercent) {
            return $this->formatSparePartWithPrice($sparePart, $isAdmin, $markupPercent);
        });
    }
    
    /**
     * Форматировать запчасть с учетом цены и прав пользователя
     * 
     * @param SparePart $sparePart
     * @param bool $isAdmin
     * @param float $markupPercent
     * @return SparePart
     */
    protected function formatSparePartWithPrice(SparePart $sparePart, bool $isAdmin = false, float $markupPercent = self::DEFAULT_MARKUP_PERCENT): SparePart
    {
        // Исходная цена без наценки
        $originalPrice = $sparePart->price;
        
        // Рассчитываем наценку
        $markupPrice = $originalPrice * (1 + $markupPercent / 100);
        
        // Обычным пользователям показываем цену с наценкой
        if (!$isAdmin) {
            $sparePart->price = $markupPrice;
        } else {
            // Администраторам показываем как исходную цену, так и цену с наценкой
            $sparePart->original_price = $originalPrice;
            $sparePart->markup_price = $markupPrice;
            $sparePart->markup_percent = $markupPercent;
        }
        
        return $sparePart;
    }

    // Добавляем алиасы для совместимости с PartsService
    
    /**
     * Алиас для getSparePartById
     */
    public function getPartById(int $id, bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->getSparePartById($id, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для getPopularSpareParts
     */
    public function getPopularParts(int $limit = 8, bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->getPopularSpareParts($limit, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для getSimilarSpareParts
     */
    public function getSimilarParts(int $partId, int $limit = 4, bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->getSimilarSpareParts($partId, $limit, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для searchSpareParts
     */
    public function searchParts(?string $query, bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->searchSpareParts($query, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для getSparePartsByCarModel
     */
    public function getPartsByCarModel(int $carModelId, array $filters = [], bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->getSparePartsByCarModel($carModelId, $filters, $isAdmin, $markupPercent);
    }
} 