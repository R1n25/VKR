<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Exception;

class VinDecoderService
{
    /**
     * Декодирует VIN-код и возвращает полную информацию
     *
     * @param string $vin
     * @return array
     */
    public function decodeVin(string $vin): array
    {
        // Приводим VIN к верхнему регистру и убираем пробелы
        $vin = strtoupper(trim($vin));
        
        // Валидируем VIN
        $this->validateVin($vin);
        
        // Кэшируем результат на сутки для повторных запросов
        $cacheKey = "vin_decoded_{$vin}";
        
        return Cache::remember($cacheKey, 86400, function () use ($vin) {
            // Извлекаем все части VIN
            $result = [
                'vin' => $vin,
                'make' => $this->extractManufacturer($vin),
                'country' => $this->extractCountry($vin),
                'year' => $this->extractYear($vin),
                'plant' => $this->extractPlant($vin),
                'vin_breakdown' => $this->breakdownVin($vin)
            ];
            
            // Дополнительная информация, которую можно получить только из внешних API
            $additionalInfo = $this->getAdditionalInfo($vin);
            
            return array_merge($result, $additionalInfo);
        });
    }
    
    /**
     * Проверяет валидность VIN-кода
     *
     * @param string $vin
     * @return bool
     * @throws Exception
     */
    public function validateVin(string $vin): bool
    {
        // VIN должен быть 17 символов
        if (strlen($vin) !== 17) {
            throw new Exception('VIN должен состоять из 17 символов');
        }
        
        // VIN может содержать только буквы (кроме I, O, Q) и цифры
        if (!preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', $vin)) {
            throw new Exception('VIN содержит недопустимые символы');
        }
        
        // Можно добавить проверку контрольной суммы
        if (!$this->checkVinChecksum($vin)) {
            throw new Exception('Некорректный VIN: ошибка контрольной суммы');
        }
        
        return true;
    }
    
    /**
     * Проверяет контрольную сумму VIN
     *
     * @param string $vin
     * @return bool
     */
    private function checkVinChecksum(string $vin): bool
    {
        // Значения для расчета контрольной суммы
        $weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
        $values = [
            'A' => 1, 'B' => 2, 'C' => 3, 'D' => 4, 'E' => 5, 'F' => 6, 'G' => 7, 'H' => 8,
            'J' => 1, 'K' => 2, 'L' => 3, 'M' => 4, 'N' => 5, 'P' => 7, 'R' => 9,
            'S' => 2, 'T' => 3, 'U' => 4, 'V' => 5, 'W' => 6, 'X' => 7, 'Y' => 8, 'Z' => 9,
            '0' => 0, '1' => 1, '2' => 2, '3' => 3, '4' => 4, '5' => 5, '6' => 6, '7' => 7, '8' => 8, '9' => 9
        ];
        
        // Позиция 9 - контрольная сумма (может быть 'X' = 10)
        $checkDigit = $vin[8];
        $checkValue = ($checkDigit === 'X') ? 10 : intval($checkDigit);
        
        $sum = 0;
        for ($i = 0; $i < 17; $i++) {
            $sum += $values[$vin[$i]] * $weights[$i];
        }
        
        $remainder = $sum % 11;
        $calculatedCheck = ($remainder === 10) ? 'X' : strval($remainder);
        
        // Проверяем, соответствует ли рассчитанный контрольный символ фактическому
        return $checkDigit === $calculatedCheck;
    }
    
    /**
     * Извлекает информацию о производителе
     *
     * @param string $vin
     * @return string
     */
    private function extractManufacturer(string $vin): string
    {
        $wmi = substr($vin, 0, 3);
        
        $manufacturers = [
            'JHM' => 'Honda',
            'JHG' => 'Honda',
            'JH4' => 'Acura',
            'SHS' => 'Honda',
            'WVW' => 'Volkswagen',
            'WV2' => 'Volkswagen',
            'VWV' => 'Volkswagen',
            'WAU' => 'Audi',
            'WBA' => 'BMW',
            'WBS' => 'BMW',
            'WBX' => 'BMW',
            'WB1' => 'BMW',
            'MB1' => 'Mercedes-Benz',
            'WDD' => 'Mercedes-Benz',
            'W1N' => 'Mercedes-Benz',
            'WMW' => 'Mini',
            'YV1' => 'Volvo',
            'YV4' => 'Volvo',
            'SNE' => 'Ford',
            'SAL' => 'Land Rover',
            'SAJ' => 'Jaguar',
            'SCA' => 'Rolls Royce',
            'SCC' => 'Lotus',
            'SCB' => 'Bentley',
            'SJG' => 'General Motors',
            'SAR' => 'Saturn',
            'JT' => 'Toyota',
            '1G' => 'General Motors',
            '2G' => 'General Motors',
            '3G' => 'General Motors',
            '1G1' => 'Chevrolet',
            '1GC' => 'Chevrolet',
            '2G1' => 'Chevrolet',
            '3G1' => 'Chevrolet',
            '1GT' => 'GMC',
            '1G8' => 'Saturn',
            '1GA' => 'Buick',
            '1G4' => 'Buick',
            '1GY' => 'Cadillac',
            '1G6' => 'Cadillac',
            'KL' => 'Daewoo',
            'KND' => 'KIA',
            'KNA' => 'KIA',
            'KMH' => 'Hyundai',
            'KMF' => 'Hyundai',
            'VF1' => 'Renault',
            'VF3' => 'Peugeot',
            'VF7' => 'Citroën',
            'XTA' => 'LADA (АвтоВАЗ)',
            'XTW' => 'LADA (АвтоВАЗ)',
            'X7L' => 'Renault Russia',
            'X4X' => 'BMW Russia',
            '3N1' => 'Nissan',
            'JN1' => 'Nissan',
            'VSK' => 'Nissan',
            'VSS' => 'SEAT',
            'TMB' => 'Škoda',
            'TRU' => 'Audi',
            'WF0' => 'Ford',
            '1FA' => 'Ford',
            '1FB' => 'Ford',
            '1FC' => 'Ford',
            '1FD' => 'Ford',
            '1ZV' => 'Lincoln',
            'Z8T' => 'Opel',
            'KPT' => 'Ssangyong',
            'SUL' => 'Fiat',
            'ZFA' => 'Fiat',
        ];
        
        // Проверяем вхождение WMI (Мировой индекс производителя)
        foreach ($manufacturers as $code => $name) {
            if (strpos($wmi, $code) === 0) {
                return $name;
            }
        }
        
        // Если не найдено по 3 символам, проверяем по 2 символам
        $wmiShort = substr($vin, 0, 2);
        foreach ($manufacturers as $code => $name) {
            if (strlen($code) == 2 && $wmiShort === $code) {
                return $name;
            }
        }
        
        return 'Неизвестный производитель';
    }
    
    /**
     * Извлекает информацию о стране производства
     *
     * @param string $vin
     * @return string
     */
    private function extractCountry(string $vin): string
    {
        $firstChar = $vin[0];
        
        $countries = [
            'A' => 'Южная Африка',
            'B' => 'Ангола, Кения, Тунис',
            'C' => 'Берег Слоновой Кости',
            'J' => 'Япония',
            'K' => 'Корея (Южная)',
            'L' => 'Китай',
            'M' => 'Индия, Индонезия, Таиланд',
            'N' => 'Иран, Пакистан, Турция',
            'P' => 'Филиппины, Сингапур, Малайзия',
            'R' => 'ОАЭ, Тайвань',
            'S' => 'Великобритания, Германия, Польша',
            'T' => 'Швейцария, Чехия, Венгрия',
            'U' => 'Дания, Ирландия, Румыния, Словакия',
            'V' => 'Австрия, Франция, Испания, Хорватия, Сербия',
            'W' => 'Германия',
            'X' => 'Россия, Болгария, Греция',
            'Y' => 'Бельгия, Финляндия, Мальта, Словения',
            'Z' => 'Италия',
            '1' => 'США',
            '2' => 'Канада',
            '3' => 'Мексика',
            '4' => 'США',
            '5' => 'США',
            '6' => 'Австралия',
            '7' => 'Новая Зеландия',
            '8' => 'Аргентина, Чили, Колумбия',
            '9' => 'Бразилия, Венесуэла, Парагвай, Уругвай'
        ];
        
        return $countries[$firstChar] ?? 'Неизвестная страна';
    }
    
    /**
     * Извлекает год выпуска автомобиля из VIN
     *
     * @param string $vin
     * @return string
     */
    private function extractYear(string $vin): string
    {
        $yearChar = $vin[9];
        
        $yearMap = [
            'A' => '2010', 'B' => '2011', 'C' => '2012', 'D' => '2013', 'E' => '2014',
            'F' => '2015', 'G' => '2016', 'H' => '2017', 'J' => '2018', 'K' => '2019',
            'L' => '2020', 'M' => '2021', 'N' => '2022', 'P' => '2023', 'R' => '2024',
            'S' => '1995', 'T' => '1996', 'V' => '1997', 'W' => '1998', 'X' => '1999',
            'Y' => '2000', '1' => '2001', '2' => '2002', '3' => '2003', '4' => '2004',
            '5' => '2005', '6' => '2006', '7' => '2007', '8' => '2008', '9' => '2009'
        ];
        
        return $yearMap[$yearChar] ?? 'Неизвестный год';
    }
    
    /**
     * Извлекает информацию о заводе-изготовителе
     *
     * @param string $vin
     * @return string
     */
    private function extractPlant(string $vin): string
    {
        // В данной реализации возвращаем просто номер завода из VIN
        // В реальности для каждого производителя это может быть свой код
        return $vin[10] . $vin[11];
    }
    
    /**
     * Разбивает VIN на составные части с расшифровкой
     *
     * @param string $vin
     * @return array
     */
    private function breakdownVin(string $vin): array
    {
        $breakdown = [];
        
        // WMI - World Manufacturer Identifier (1-3 позиции)
        $breakdown['1-3'] = [
            'char' => substr($vin, 0, 3),
            'meaning' => 'Мировой индекс производителя (WMI)'
        ];
        
        // VDS - Vehicle Descriptor Section (4-9 позиции)
        $breakdown['4-8'] = [
            'char' => substr($vin, 3, 5),
            'meaning' => 'Описательная часть (модель, тип кузова, двигатель)'
        ];
        
        // Контрольная цифра (9 позиция)
        $breakdown['9'] = [
            'char' => $vin[8],
            'meaning' => 'Контрольная цифра'
        ];
        
        // Год выпуска (10 позиция)
        $breakdown['10'] = [
            'char' => $vin[9],
            'meaning' => 'Год выпуска: ' . $this->extractYear($vin)
        ];
        
        // Завод-изготовитель (11 позиция)
        $breakdown['11'] = [
            'char' => $vin[10],
            'meaning' => 'Завод-изготовитель'
        ];
        
        // Серийный номер (12-17 позиции)
        $breakdown['12-17'] = [
            'char' => substr($vin, 11, 6),
            'meaning' => 'Серийный номер автомобиля'
        ];
        
        return $breakdown;
    }
    
    /**
     * Получает дополнительную информацию из внешних источников
     * В реальном приложении здесь будет интеграция с API
     *
     * @param string $vin
     * @return array
     */
    private function getAdditionalInfo(string $vin): array
    {
        // В реальном приложении здесь будет запрос к внешнему API
        // Для демонстрации возвращаем заглушки
        
        // Можно интегрировать с одним из сервисов:
        // - NHTSA API (бесплатный)
        // - Carfax
        // - Autocheck
        // - VinAudit
        
        return [
            'model' => 'Определяется по API',
            'body_type' => 'Определяется по API',
            'engine' => 'Определяется по API',
            'transmission' => 'Определяется по API',
        ];
    }
} 