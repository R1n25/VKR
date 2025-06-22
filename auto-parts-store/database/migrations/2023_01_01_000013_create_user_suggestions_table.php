<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('spare_part_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type'); // price, availability, description, etc.
            $table->text('content');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('admin_comment')->nullable();
            $table->json('data')->nullable(); // Additional data
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_suggestions');
    }
}; 