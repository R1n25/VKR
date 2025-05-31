<?php

namespace App\Services\Catalog;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class CatalogManager
{
    /**
     * @var ImportService
     */
    protected $importService;
    
    /**
     * @var ExportService
     */
    protected $exportService;
    
    /**
     * Директория для хранения каталогов
     */
    protected $catalogStoragePath = 'catalog';
    
    /**
     * Конструктор
     */
    public function __construct(ImportService $importService, ExportService $exportService)
    {
        $this->importService = $importService;
        $this->exportService = $exportService;
        
        // Создаем директорию для каталогов, если она не существует
        if (!Storage::exists($this->catalogStoragePath)) {
            Storage::makeDirectory($this->catalogStoragePath);
        }
    }
    
    /**
     * Импортировать запчасти из CSV файла
     *
     * @param string $filePath Путь к CSV файлу
     * @param bool $updateExisting Обновлять существующие записи
     * @param bool $saveBackup Создать резервную копию перед импортом
     * @return array Статистика импорта
     */
    public function importSpareParts(string $filePath, bool $updateExisting = true, bool $saveBackup = true): array
    {
        if ($saveBackup) {
            $this->backupSpareParts();
        }
        
        return $this->importService->importSpareParts($filePath, $updateExisting);
    }
    
    /**
     * Импортировать модели автомобилей из CSV файла
     *
     * @param string $filePath Путь к CSV файлу
     * @param bool $updateExisting Обновлять существующие записи
     * @param bool $saveBackup Создать резервную копию перед импортом
     * @return array Статистика импорта
     */
    public function importCarModels(string $filePath, bool $updateExisting = true, bool $saveBackup = true): array
    {
        if ($saveBackup) {
            $this->backupCarModels();
        }
        
        return $this->importService->importCarModels($filePath, $updateExisting);
    }
    
    /**
     * Создать резервную копию запчастей
     *
     * @return string Путь к созданному файлу
     */
    public function backupSpareParts(): string
    {
        $backupDir = $this->getBackupDirectory();
        $backupFile = $backupDir . '/spare_parts_' . date('Y-m-d_H-i-s') . '.csv';
        
        return $this->exportService->exportSpareParts($backupFile);
    }
    
    /**
     * Создать резервную копию моделей автомобилей
     *
     * @return string Путь к созданному файлу
     */
    public function backupCarModels(): string
    {
        $backupDir = $this->getBackupDirectory();
        $backupFile = $backupDir . '/car_models_' . date('Y-m-d_H-i-s') . '.csv';
        
        return $this->exportService->exportCarModels($backupFile);
    }
    
    /**
     * Экспортировать запчасти в CSV файл
     *
     * @param string|null $filePath Путь для сохранения файла (если null, будет сгенерирован)
     * @param array $filters Фильтры для выборки запчастей
     * @return string Путь к созданному файлу
     */
    public function exportSpareParts(?string $filePath = null, array $filters = []): string
    {
        if ($filePath === null) {
            $filePath = $this->catalogStoragePath . '/spare_parts_' . date('Y-m-d_H-i-s') . '.csv';
            $filePath = storage_path('app/' . $filePath);
            
            // Создаем директорию, если она не существует
            $directory = dirname($filePath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
        }
        
        return $this->exportService->exportSpareParts($filePath, $filters);
    }
    
    /**
     * Экспортировать модели автомобилей в CSV файл
     *
     * @param string|null $filePath Путь для сохранения файла (если null, будет сгенерирован)
     * @param array $filters Фильтры для выборки моделей
     * @return string Путь к созданному файлу
     */
    public function exportCarModels(?string $filePath = null, array $filters = []): string
    {
        if ($filePath === null) {
            $filePath = $this->catalogStoragePath . '/car_models_' . date('Y-m-d_H-i-s') . '.csv';
            $filePath = storage_path('app/' . $filePath);
            
            // Создаем директорию, если она не существует
            $directory = dirname($filePath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
        }
        
        return $this->exportService->exportCarModels($filePath, $filters);
    }
    
    /**
     * Получить директорию для резервных копий
     *
     * @return string Путь к директории
     */
    protected function getBackupDirectory(): string
    {
        $backupDir = $this->catalogStoragePath . '/backups/' . date('Y-m-d');
        
        // Создаем директорию физически
        $fullPath = storage_path('app/' . $backupDir);
        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0755, true);
        }
        
        return $fullPath;
    }
    
    /**
     * Получить список доступных резервных копий
     *
     * @param string $type Тип резервной копии (spare_parts или car_models)
     * @return array Список файлов резервных копий
     */
    public function getBackupsList(string $type = 'all'): array
    {
        $backupPath = $this->catalogStoragePath . '/backups';
        $result = [];
        
        if (!Storage::exists($backupPath)) {
            return $result;
        }
        
        $directories = Storage::directories($backupPath);
        
        foreach ($directories as $directory) {
            $files = Storage::files($directory);
            
            foreach ($files as $file) {
                $filename = basename($file);
                
                if ($type === 'all' 
                    || ($type === 'spare_parts' && strpos($filename, 'spare_parts_') === 0)
                    || ($type === 'car_models' && strpos($filename, 'car_models_') === 0)
                ) {
                    $result[] = [
                        'path' => $file,
                        'name' => $filename,
                        'date' => date('Y-m-d H:i:s', Storage::lastModified($file)),
                        'size' => $this->formatSize(Storage::size($file)),
                    ];
                }
            }
        }
        
        // Сортируем по дате (новые сверху)
        usort($result, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return $result;
    }
    
    /**
     * Форматировать размер файла
     *
     * @param int $size Размер в байтах
     * @return string Отформатированный размер
     */
    protected function formatSize(int $size): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        
        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }
        
        return round($size, 2) . ' ' . $units[$i];
    }
} 