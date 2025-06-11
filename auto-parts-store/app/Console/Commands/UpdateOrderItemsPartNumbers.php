<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderItem;
use App\Models\SparePart;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateOrderItemsPartNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:update-part-numbers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Обновляет артикулы (part_number) в существующих элементах заказов';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Начинаем обновление артикулов в заказах...');
        Log::info('Starting update of part_number in order_items');
        
        $orderItems = OrderItem::whereNull('part_number')->get();
        $count = 0;
        $total = $orderItems->count();
        
        $this->output->progressStart($total);
        
        foreach ($orderItems as $item) {
            $sparePart = SparePart::find($item->spare_part_id);
            
            if ($sparePart && $sparePart->part_number) {
                $item->part_number = $sparePart->part_number;
                $item->save();
                $count++;
            } else {
                Log::warning("Could not find part_number for order_item ID: {$item->id}, spare_part_id: {$item->spare_part_id}");
            }
            
            $this->output->progressAdvance();
        }
        
        $this->output->progressFinish();
        
        $this->info("Обновлено артикулов: {$count} из {$total} элементов заказов");
        Log::info("Updated part_number for {$count} order items");
        
        return Command::SUCCESS;
    }
} 