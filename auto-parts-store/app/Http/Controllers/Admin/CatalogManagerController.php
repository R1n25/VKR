<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Catalog\CatalogManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CatalogManagerController extends Controller
{
    /**
     * @var CatalogManager
     */
    protected $catalogManager;
    
    /**
     * Конструктор
     */
    public function __construct(CatalogManager $catalogManager)
    {
        $this->catalogManager = $catalogManager;
        // Middleware уже применяются в маршрутах (routes/web.php)
        // через группу middleware(['auth', \App\Http\Middleware\AdminMiddleware::class])
    }
    
    /**
     * Показать страницу управления каталогом
     */
    public function index()
    {
        $backups = $this->catalogManager->getBackupsList();
        
        return inertia('Admin/CatalogManager/Index', [
            'backups' => $backups,
        ]);
    }
    
    /**
     * Импортировать запчасти
     */
    public function importParts(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:csv,txt|max:10240',
                'update_existing' => 'boolean',
                'create_backup' => 'boolean',
            ]);
            
            if ($validator->fails()) {
                return back()->withErrors($validator);
            }
            
            $file = $request->file('file');
            $path = $file->getRealPath();
            
            $updateExisting = $request->boolean('update_existing', true);
            $createBackup = $request->boolean('create_backup', true);
            
            $stats = $this->catalogManager->importSpareParts($path, $updateExisting, $createBackup);
            
            return back()->with('success', 'Импорт запчастей успешно выполнен!')->with('stats', $stats);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при импорте: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Импортировать модели автомобилей
     */
    public function importCars(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:csv,txt|max:10240',
                'update_existing' => 'boolean',
                'create_backup' => 'boolean',
            ]);
            
            if ($validator->fails()) {
                return back()->withErrors($validator);
            }
            
            $file = $request->file('file');
            $path = $file->getRealPath();
            
            $updateExisting = $request->boolean('update_existing', true);
            $createBackup = $request->boolean('create_backup', true);
            
            $stats = $this->catalogManager->importCarModels($path, $updateExisting, $createBackup);
            
            return back()->with('success', 'Импорт моделей автомобилей успешно выполнен!')->with('stats', $stats);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при импорте: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Экспортировать запчасти
     */
    public function exportParts(Request $request)
    {
        try {
            $filters = [];
            
            if ($request->filled('category_id')) {
                $filters['category_id'] = $request->input('category_id');
            }
            
            if ($request->filled('manufacturer')) {
                $filters['manufacturer'] = $request->input('manufacturer');
            }
            
            $filePath = $this->catalogManager->exportSpareParts(null, $filters);
            
            return response()->download($filePath, 'spare_parts_' . date('Y-m-d_H-i-s') . '.csv')->deleteFileAfterSend();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при экспорте: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Экспортировать модели автомобилей
     */
    public function exportCars(Request $request)
    {
        try {
            $filters = [];
            
            if ($request->filled('brand_id')) {
                $filters['brand_id'] = $request->input('brand_id');
            }
            
            if ($request->boolean('is_popular', false)) {
                $filters['is_popular'] = true;
            }
            
            $filePath = $this->catalogManager->exportCarModels(null, $filters);
            
            return response()->download($filePath, 'car_models_' . date('Y-m-d_H-i-s') . '.csv')->deleteFileAfterSend();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при экспорте: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Скачать резервную копию
     */
    public function downloadBackup(Request $request)
    {
        try {
            $path = $request->input('path');
            
            if (!Storage::exists($path)) {
                throw new \Exception('Файл не найден');
            }
            
            $fullPath = storage_path('app/' . $path);
            $fileName = basename($path);
            
            return response()->download($fullPath, $fileName);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при скачивании: ' . $e->getMessage()]);
        }
    }
} 