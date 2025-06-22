<?php

namespace App\Console\Commands;

use App\Models\CarModel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeleteCarModels extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cars:delete-empty 
                            {--all-empty : Удалить все записи с пустыми значениями}
                            {--field= : Поле, по которому искать пустые значения}
                            {--dry-run : Только показать количество записей для удаления без фактического удаления}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Удаление моделей автомобилей с пустыми значениями';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $allEmpty = $this->option('all-empty');
        $field = $this->option('field');
        
        $query = CarModel::query();
        
        if ($allEmpty) {
            // Удаление записей, где все дополнительные поля NULL
            $query->whereNull('generation')
                  ->whereNull('body_type')
                  ->whereNull('engine_type')
                  ->whereNull('engine_volume')
                  ->whereNull('transmission_type')
                  ->whereNull('drive_type');
                  
            $this->info('Поиск записей, где все дополнительные поля пустые...');
        } elseif ($field) {
            // Удаление записей по конкретному полю
            $query->whereNull($field);
            $this->info("Поиск записей с пустым полем '{$field}'...");
        } else {
            $this->error('Необходимо указать опцию --all-empty или --field=имя_поля');
            return 1;
        }
        
        $count = $query->count();
        
        if ($count === 0) {
            $this->info('Записи для удаления не найдены.');
            return 0;
        }
        
        $this->info("Найдено {$count} записей для удаления.");
        
        if ($dryRun) {
            $this->warn('Это тестовый запуск. Записи не были удалены.');
            $this->info('Используйте команду без опции --dry-run для фактического удаления.');
            return 0;
        }
        
        if ($this->confirm("Вы уверены, что хотите удалить {$count} записей?", false)) {
            $deleted = $query->delete();
            $this->info("Удалено {$deleted} записей.");
        } else {
            $this->info('Операция отменена пользователем.');
        }
        
        return 0;
    }
} 