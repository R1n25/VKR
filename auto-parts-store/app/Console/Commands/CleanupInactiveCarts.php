<?php

namespace App\Console\Commands;

use App\Services\CartService;
use Illuminate\Console\Command;

class CleanupInactiveCarts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'carts:cleanup {days=7 : Количество дней, после которых корзина считается устаревшей}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Очистка неактивных корзин старше указанного срока';

    /**
     * Execute the console command.
     *
     * @param CartService $cartService
     * @return int
     */
    public function handle(CartService $cartService)
    {
        $days = $this->argument('days');
        
        $this->info("Начинаем очистку неактивных корзин старше {$days} дней...");
        
        $count = $cartService->cleanupInactiveCarts($days);
        
        $this->info("Очистка завершена. Удалено {$count} неактивных корзин.");
        
        return Command::SUCCESS;
    }
} 