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
            
            <form action="{{ route('suggestions.store-analog', $sparePart) }}" method="POST">
                @csrf
                
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
                
                <div class="mb-6">
                    <label for="comment" class="block text-gray-700 font-medium mb-2">Комментарий (необязательно)</label>
                    <textarea id="comment" name="comment" rows="3" class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">{{ old('comment') }}</textarea>
                    <p class="text-sm text-gray-500 mt-1">Укажите дополнительную информацию об аналоге, например, особенности совместимости.</p>
                    @error('comment')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
                
                <div class="flex justify-between">
                    <a href="{{ route('spare-parts.show', $sparePart) }}" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Отмена
                    </a>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Отправить предложение
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection 