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
     * Поиск запчастей по имени или артикулу
     *
     * @param string $query Поисковый запрос
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function searchSpareParts(string $query, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
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
     * Получить запчасть по ID
     *
     * @param int $id ID запчасти
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return SparePart|null
     */
    public function getSparePartById(int $id, bool $isAdmin = false, ?float $markupPercent = null): ?SparePart
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
     * Получить запчасти, совместимые с определенной моделью автомобиля
     *
     * @param int $carModelId ID модели автомобиля
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getSparePartsByCarModel(int $carModelId, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        $spareParts = SparePart::whereHas('carModels', function (Builder $query) use ($carModelId) {
            $query->where('car_models.id', $carModelId);
        })->get();

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
    }

    /**
     * Получить популярные запчасти
     *
     * @param int $limit Лимит запчастей
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getPopularSpareParts(int $limit = 8, bool $isAdmin = false, ?float $markupPercent = null): Collection
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