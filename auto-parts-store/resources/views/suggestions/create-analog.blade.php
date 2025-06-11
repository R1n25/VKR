@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <div class="max-w-3xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Предложить аналог для запчасти</h1>
        
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Информация о запчасти</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-600">Наименование:</p>
                    <p class="font-medium">{{ $sparePart->name }}</p>
                </div>
                <div>
                    <p class="text-gray-600">Артикул:</p>
                    <p class="font-medium">{{ $sparePart->part_number }}</p>
                </div>
                <div>
                    <p class="text-gray-600">Производитель:</p>
                    <p class="font-medium">{{ $sparePart->manufacturer }}</p>
                </div>
                <div>
                    <p class="text-gray-600">Категория:</p>
                    <p class="font-medium">{{ $sparePart->category }}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Выберите аналог</h2>
            
            <div class="mb-5 p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                    <i class="fas fa-info-circle mr-2"></i> Предлагая аналог, вы помогаете другим пользователям найти подходящую замену оригинальной детали. Аналоги проходят модерацию и появляются в каталоге после проверки.
                </p>
            </div>
            
            <div class="mb-5">
                <div class="relative">
                    <input type="text" id="parts-search" placeholder="Поиск по названию или артикулу..." class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-10">
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
            </div>
            
            <form action="{{ route('suggestions.store-analog', $sparePart) }}" method="POST">
                <div class="mb-4">
                    <label for="analog_spare_part_id" class="block text-gray-700 font-medium mb-2">Запчасть-аналог</label>
                    <select id="analog_spare_part_id" name="analog_spare_part_id" class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" required>
                        <option value="">-- Выберите запчасть --</option>
                        @foreach($spareParts as $analogPart)
                            <option value="{{ $analogPart->id }}">
                                {{ $analogPart->name }} ({{ $analogPart->part_number }}) - {{ $analogPart->manufacturer }}
                            </option>
                        @endforeach
                    </select>
                    @error('analog_spare_part_id')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">Почему это аналог?</label>
                    <div class="grid grid-cols-2 gap-3 mb-2">
                        <div class="border rounded p-3 hover:bg-gray-50 cursor-pointer">
                            <input type="radio" id="reason-direct" name="analog_type" value="direct" class="mr-2" checked>
                            <label for="reason-direct" class="font-medium">Прямой аналог</label>
                            <p class="text-sm text-gray-600 mt-1">Полностью заменяет оригинальную деталь</p>
                        </div>
                        <div class="border rounded p-3 hover:bg-gray-50 cursor-pointer">
                            <input type="radio" id="reason-partial" name="analog_type" value="partial" class="mr-2">
                            <label for="reason-partial" class="font-medium">Заменитель</label>
                            <p class="text-sm text-gray-600 mt-1">Подходит с некоторыми ограничениями</p>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label for="comment" class="block text-gray-700 font-medium mb-2">Комментарий (необязательно)</label>
                    <textarea id="comment" name="comment" rows="3" class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">{{ old('comment') }}</textarea>
                    <p class="text-sm text-gray-500 mt-1">Укажите дополнительную информацию об аналоге, например, особенности совместимости.</p>
                    @error('comment')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
                
                <div class="mt-8 flex justify-end">
                    <a href="{{ route('parts.show', $sparePart) }}" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Отмена
                    </a>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        <i class="fas fa-paper-plane mr-1"></i> Отправить предложение
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('parts-search');
        const selectElement = document.getElementById('analog_spare_part_id');
        const originalOptions = [...selectElement.options].map(option => {
            return {
                value: option.value,
                text: option.text.toLowerCase()
            };
        });
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // Сначала удаляем все текущие опции, кроме первой (заголовка)
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }
            
            // Фильтруем и добавляем подходящие опции
            originalOptions.forEach(option => {
                if (option.value === "") return; // Пропускаем заголовок
                
                if (option.text.includes(searchTerm)) {
                    const newOption = document.createElement('option');
                    newOption.value = option.value;
                    newOption.text = option.text;
                    selectElement.add(newOption);
                }
            });
        });
        
        // Делаем выделяемыми родительские элементы радио-кнопок
        const radioContainers = document.querySelectorAll('.grid.grid-cols-2 > div');
        radioContainers.forEach(container => {
            container.addEventListener('click', function() {
                const radio = this.querySelector('input[type="radio"]');
                radio.checked = true;
            });
        });
    });
</script>
@endpush

@endsection 