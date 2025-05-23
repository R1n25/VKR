<?php

namespace App\Services;

use App\Models\SparePart;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PartsService
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
    public function getPopularParts(int $limit = 8, bool $isAdmin = false, ?float $markupPercent = null)
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
    public function getPartById(int $id, bool $isAdmin = false, ?float $markupPercent = null)
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
     * @param int $partId ID запчасти
     * @param int $limit Количество похожих запчастей
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getSimilarParts(int $partId, int $limit = 4, bool $isAdmin = false, ?float $markupPercent = null)
    {
        // Получаем информацию о текущей запчасти
        $part = $this->getPartById($partId);
        
        if (!$part) {
            return collect([]);
        }
        
        // Находим запчасти той же категории
        $similarParts = SparePart::query()
            ->where('id', '!=', $partId)
            ->where('category', $part->category)
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
    public function searchParts(?string $query, bool $isAdmin = false, ?float $markupPercent = null)
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
    public function getPartsByCarModel(int $carModelId, array $filters = [], bool $isAdmin = false, ?float $markupPercent = null)
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
     * Получить процент наценки текущего пользователя или значение по умолчанию
     * 
     * @return float
     */
    protected function getUserMarkupPercent(): float
    {
        if (Auth::check()) {
            return Auth::user()->markup_percent;
        }
        
        return self::DEFAULT_MARKUP_PERCENT;
    }

    /**
     * Форматировать коллекцию запчастей с учетом роли пользователя
     *
     * @param Collection $spareParts Коллекция запчастей
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    protected function formatSparePartsWithPrices(Collection $spareParts, bool $isAdmin = false, float $markupPercent = self::DEFAULT_MARKUP_PERCENT): Collection
    {
        return $spareParts->map(function ($sparePart) use ($isAdmin, $markupPercent) {
            return $this->formatSparePartWithPrice($sparePart, $isAdmin, $markupPercent);
        });
    }

    /**
     * Форматировать запчасть с учетом роли пользователя
     *
     * @param SparePart $sparePart Запчасть
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float $markupPercent Процент наценки для пользователя
     * @return SparePart
     */
    protected function formatSparePartWithPrice(SparePart $sparePart, bool $isAdmin = false, float $markupPercent = self::DEFAULT_MARKUP_PERCENT): SparePart
    {
        // Сохраняем оригинальную цену
        $originalPrice = $sparePart->price;
        
        // Рассчитываем цену с наценкой
        $markupPrice = round($originalPrice * (1 + $markupPercent / 100), 2);
        
        if ($isAdmin) {
            // Для администраторов добавляем дополнительные атрибуты
            $sparePart->original_price = $originalPrice;
            $sparePart->markup_price = $markupPrice;
            $sparePart->markup_percent = $markupPercent;
        } else {
            // Для обычных пользователей и гостей устанавливаем цену с наценкой
            $sparePart->price = $markupPrice;
        }
        
        return $sparePart;
    }
} 