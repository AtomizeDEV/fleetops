<?php

namespace Fleetbase\FleetOps\Console\Commands;

use Fleetbase\FleetOps\Models\Order;
use Fleetbase\FleetOps\Models\OrderConfig;
use Fleetbase\Support\Utils;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class FixLegacyOrderConfigs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fleetops:fix-legacy-order-configs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This is a command which migrates legacy orders to the new order config system.';

    /**
     * Execute the console command.
     *
     * This method is responsible for the main logic of the command.
     * It fetches dispatchable orders, notifies about the current time and number of orders,
     * and then dispatches each order if there are nearby drivers.
     *
     * @return int
     */
    public function handle()
    {
        if (Utils::classExists('\\Fleetbase\\FleetOps\\Seeders\\OrderConfigSeeder')) {
            $this->info('Starting the database seeding...');

            Artisan::call('db:seed', [
                '--class' => '\\Fleetbase\\FleetOps\\Seeders\\OrderConfigSeeder',
            ]);

            $this->info('Database seeding completed.');
        }

        $orders      = Order::whereNull('order_config_uuid')->get();
        $totalOrders = $orders->count();
        $this->info($totalOrders . ' orders found for updating.');
        $progressBar = $this->output->createProgressBar($totalOrders);
        $progressBar->start();
        foreach ($orders as $order) {
            $orderConfig = OrderConfig::where(['company_uuid' => $order->company_uuid, 'namespace' => 'system:order-config:transport'])->first();
            if ($orderConfig) {
                $order->update(['order_config_uuid' => $orderConfig->uuid]);
            }
            // Advance the progress bar by one step
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->line('');
        $this->info('All orders have been processed.');
    }
}
