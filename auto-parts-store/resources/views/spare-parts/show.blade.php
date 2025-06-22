<div class="mt-4">
    <h3 class="text-lg font-semibold">Аналоги</h3>
    @if($sparePart->analogs->count() > 0)
        <ul class="mt-2 space-y-2">
            @foreach($sparePart->analogs as $analog)
                <li class="border-b pb-2">
                    <a href="{{ route('parts.show', $analog->analogSparePart) }}" class="text-blue-600 hover:underline">
                        {{ $analog->analogSparePart->name }} ({{ $analog->analogSparePart->part_number }})
                    </a>
                    <span class="ml-2 text-gray-600">{{ $analog->analogSparePart->manufacturer }}</span>
                    <span class="ml-2 text-green-600 font-semibold">{{ number_format($analog->analogSparePart->price, 2) }} ₽</span>
                    @if($analog->notes)
                        <p class="text-sm text-gray-600">{{ $analog->notes }}</p>
                    @endif
                </li>
            @endforeach
        </ul>
    @else
        <p class="text-gray-600">Аналогов пока нет</p>
        
        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p class="text-sm">
                <span class="font-semibold">Знаете аналог для этой запчасти?</span> 
                Поделитесь своими знаниями и помогите другим пользователям найти нужную деталь!
            </p>
        </div>
    @endif
    
    <div class="mt-4">
        <a href="{{ route('suggestions.create-analog', $sparePart) }}" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <i class="fas fa-plus-circle mr-1"></i> Предложить аналог
        </a>
    </div>
</div>

<div class="mt-4">
    <h3 class="text-lg font-semibold">Совместимость с автомобилями</h3>
    @if($sparePart->compatibilities && $sparePart->compatibilities->count() > 0)
        <ul class="mt-2 space-y-2">
            @foreach($sparePart->compatibilities as $compatibility)
                <li class="border-b pb-2">
                    @if(isset($compatibility['brand']) && isset($compatibility['model']))
                        <span class="font-medium">{{ $compatibility['brand'] }} {{ $compatibility['model'] }}</span>
                    @elseif(isset($compatibility->carModel))
                        <span class="font-medium">{{ $compatibility->carModel->brand->name }} {{ $compatibility->carModel->name }}</span>
                    @else
                        <span class="font-medium">Универсальная совместимость</span>
                    @endif
                    
                    @if(isset($compatibility['years']))
                        <span class="text-sm text-gray-600">
                            ({{ $compatibility['years'] }})
                        </span>
                    @elseif(isset($compatibility->start_year) || isset($compatibility->end_year))
                        <span class="text-sm text-gray-600">
                            (
                            @if(isset($compatibility->start_year) && isset($compatibility->end_year))
                                {{ $compatibility->start_year }} - {{ $compatibility->end_year }}
                            @elseif(isset($compatibility->start_year))
                                с {{ $compatibility->start_year }}
                            @elseif(isset($compatibility->end_year))
                                до {{ $compatibility->end_year }}
                            @endif
                            )
                        </span>
                    @endif
                    
                    @if(isset($compatibility['engine']))
                        <div class="text-sm text-gray-700">
                            <strong>Двигатель:</strong> 
                            @if(is_array($compatibility['engine']))
                                {{ $compatibility['engine']['name'] ?? 'Н/Д' }}
                                @if(isset($compatibility['engine']['volume']))
                                    {{ $compatibility['engine']['volume'] }} л.
                                @endif
                                @if(isset($compatibility['engine']['power']))
                                    {{ $compatibility['engine']['power'] }} л.с.
                                @endif
                                @if(isset($compatibility['engine']['fuel_type']))
                                    ({{ $compatibility['engine']['fuel_type'] }})
                                @endif
                            @elseif(is_object($compatibility['engine']))
                                {{ $compatibility['engine']->name ?? 'Н/Д' }}
                            @endif
                        </div>
                    @elseif(isset($compatibility->carEngine))
                        <div class="text-sm text-gray-700">
                            <strong>Двигатель:</strong> {{ $compatibility->carEngine->name ?? 'Н/Д' }}
                        </div>
                    @endif
                    
                    @if(isset($compatibility['notes']))
                        <p class="text-sm text-gray-600">{{ $compatibility['notes'] }}</p>
                    @elseif(isset($compatibility->notes))
                        <p class="text-sm text-gray-600">{{ $compatibility->notes }}</p>
                    @endif
                </li>
            @endforeach
        </ul>
    @else
        <p class="text-gray-600">Информации о совместимости пока нет</p>
        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p class="text-sm">
                <span class="font-semibold">Знаете с какими автомобилями совместима эта запчасть?</span> 
                Поделитесь своими знаниями и помогите другим пользователям!
            </p>
        </div>
    @endif
    
    <div class="mt-2">
        <a href="{{ route('suggestions.create-compatibility', $sparePart) }}" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <i class="fas fa-car mr-1"></i> Предложить совместимость
        </a>
    </div>
</div>

<!-- Кнопки действий -->
<div class="mt-6 flex flex-wrap gap-3">
    <button 
        onclick="addToCart({{ $sparePart->id }})" 
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
        <i class="fas fa-shopping-cart mr-1"></i> Добавить в корзину
    </button>
    
    @auth
        <a href="{{ route('suggestions.create-analog', $sparePart) }}" 
           class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500">
            <i class="fas fa-exchange-alt mr-1"></i> Предложить аналог
        </a>
        
        <a href="{{ route('suggestions.create-compatibility', $sparePart) }}" 
           class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500">
            <i class="fas fa-car mr-1"></i> Предложить совместимость
        </a>
    @else
        <a href="{{ route('login') }}" 
           class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
           title="Войдите, чтобы предложить аналог или совместимость">
            <i class="fas fa-sign-in-alt mr-1"></i> Войти для предложений
        </a>
    @endauth
</div> 