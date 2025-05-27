@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <div class="max-w-3xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Предложить совместимость запчасти с автомобилем</h1>
        
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
            <h2 class="text-xl font-semibold mb-4">Выберите автомобиль</h2>
            
            <form action="{{ route('suggestions.store-compatibility', $sparePart) }}" method="POST">
                @csrf
                
                <div class="mb-4">
                    <label for="car_model_id" class="block text-gray-700 font-medium mb-2">Модель автомобиля</label>
                    <select id="car_model_id" name="car_model_id" class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" required>
                        <option value="">-- Выберите модель автомобиля --</option>
                        @foreach($carModels as $carModel)
                            <option value="{{ $carModel->id }}">
                                {{ $carModel->brand->name }} {{ $carModel->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('car_model_id')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="start_year" class="block text-gray-700 font-medium mb-2">Год начала применимости</label>
                        <input type="number" id="start_year" name="start_year" min="1900" max="2100" value="{{ old('start_year') }}" class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                        @error('start_year')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label for="end_year" class="block text-gray-700 font-medium mb-2">Год окончания применимости</label>
                        <input type="number" id="end_year" name="end_year" min="1900" max="2100" value="{{ old('end_year') }}" class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                        @error('end_year')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
                
                <div class="mb-6">
                    <label for="comment" class="block text-gray-700 font-medium mb-2">Комментарий (необязательно)</label>
                    <textarea id="comment" name="comment" rows="3" class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">{{ old('comment') }}</textarea>
                    <p class="text-sm text-gray-500 mt-1">Укажите дополнительную информацию о совместимости, например, особенности установки.</p>
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