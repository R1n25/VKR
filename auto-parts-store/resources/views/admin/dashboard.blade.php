@extends('layouts.admin')

@section('content')
<div class="container-fluid px-4">
    <h1 class="mt-4">Панель управления</h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item active">Обзор системы</li>
    </ol>
    
    <!-- Статистика -->
    <div class="row">
        <div class="col-xl-3 col-md-6">
            <div class="card bg-primary text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>Пользователи</div>
                        <div><strong>{{ $stats['users_count'] }}</strong></div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="#">Подробнее</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="card bg-success text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>Запчасти</div>
                        <div><strong>{{ $stats['spare_parts_count'] }}</strong></div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="{{ route('admin.spare-parts.index') }}">Управление запчастями</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="card bg-warning text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>Заказы</div>
                        <div><strong>{{ $stats['orders_count'] }}</strong></div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="#">Управление заказами</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="card bg-info text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>Категории</div>
                        <div><strong>{{ $stats['categories_count'] ?? '-' }}</strong></div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="{{ route('admin.part-categories.index') }}">Управление категориями</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row">
        @if(isset($selectedCategory))
        <!-- Детальная информация о выбранной категории -->
        <div class="col-xl-12 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-tag me-1"></i> Категория: {{ $selectedCategory->name }}
                    </div>
                    <div>
                        <a href="{{ route('admin.dashboard') }}" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-arrow-left"></i> Назад к панели
                        </a>
                        <a href="{{ route('admin.part-categories.edit', $selectedCategory->id) }}" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Редактировать
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-lg-5 mb-4">
                            <div class="card">
                                <div class="card-body">
                                    <div class="text-center mb-4">
                                        @if ($selectedCategory->image_url)
                                            <img src="{{ $selectedCategory->image_url }}" alt="{{ $selectedCategory->name }}" class="img-fluid img-thumbnail" style="max-height: 200px;">
                                        @else
                                            <div class="border p-3 text-muted">
                                                <i class="fas fa-image fa-3x"></i>
                                                <p class="mt-2">Изображение отсутствует</p>
                                            </div>
                                        @endif
                                    </div>
                                    
                                    <table class="table table-bordered">
                                        <tr>
                                            <th width="40%">ID:</th>
                                            <td>{{ $selectedCategory->id }}</td>
                                        </tr>
                                        <tr>
                                            <th>Название:</th>
                                            <td>{{ $selectedCategory->name }}</td>
                                        </tr>
                                        <tr>
                                            <th>Slug:</th>
                                            <td>{{ $selectedCategory->slug }}</td>
                                        </tr>
                                        <tr>
                                            <th>Родительская категория:</th>
                                            <td>
                                                @if ($selectedCategory->parent)
                                                    <a href="{{ route('admin.dashboard', ['category_id' => $selectedCategory->parent->id]) }}">
                                                        {{ $selectedCategory->parent->name }}
                                                    </a>
                                                @else
                                                    <span class="text-muted">Корневая категория</span>
                                                @endif
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Дата создания:</th>
                                            <td>{{ $selectedCategory->created_at->format('d.m.Y H:i') }}</td>
                                        </tr>
                                        <tr>
                                            <th>Последнее обновление:</th>
                                            <td>{{ $selectedCategory->updated_at->format('d.m.Y H:i') }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            
                            @if ($selectedCategory->description)
                                <div class="card mt-4">
                                    <div class="card-header">
                                        <i class="fas fa-align-left me-1"></i> Описание
                                    </div>
                                    <div class="card-body">
                                        {{ $selectedCategory->description }}
                                    </div>
                                </div>
                            @endif
                        </div>
                        
                        <div class="col-lg-7">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div><i class="fas fa-list me-1"></i> Запчасти в категории ({{ $selectedCategory->spareParts->count() }})</div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    @if ($selectedCategory->spareParts->count() > 0)
                                        <div class="table-responsive">
                                            <table class="table table-striped table-bordered" id="spareParts">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Артикул</th>
                                                        <th>Название</th>
                                                        <th>Цена</th>
                                                        <th>Наличие</th>
                                                        <th>Действия</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach ($selectedCategory->spareParts as $part)
                                                        <tr>
                                                            <td>{{ $part->id }}</td>
                                                            <td>{{ $part->article }}</td>
                                                            <td>{{ $part->name }}</td>
                                                            <td>{{ number_format($part->price, 2) }} ₽</td>
                                                            <td>
                                                                @if ($part->is_available)
                                                                    <span class="badge bg-success">В наличии ({{ $part->stock_quantity }})</span>
                                                                @else
                                                                    <span class="badge bg-danger">Нет в наличии</span>
                                                                @endif
                                                            </td>
                                                            <td>
                                                                <a href="{{ route('admin.spare-parts.show', $part->id) }}" class="btn btn-info btn-sm">
                                                                    <i class="fas fa-eye"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    @else
                                        <div class="alert alert-info">
                                            <i class="fas fa-info-circle me-2"></i> В этой категории пока нет запчастей.
                                        </div>
                                    @endif
                                </div>
                            </div>
                            
                            <div class="card">
                                <div class="card-header">
                                    <i class="fas fa-sitemap me-1"></i> Подкатегории ({{ $subcategories->count() }})
                                </div>
                                <div class="card-body">
                                    @if ($subcategories->count() > 0)
                                        <div class="table-responsive">
                                            <table class="table table-striped table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Название</th>
                                                        <th>Кол-во запчастей</th>
                                                        <th>Действия</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach ($subcategories as $subcategory)
                                                        <tr>
                                                            <td>{{ $subcategory->id }}</td>
                                                            <td>{{ $subcategory->name }}</td>
                                                            <td>{{ $subcategory->spare_parts_count }}</td>
                                                            <td>
                                                                <a href="{{ route('admin.dashboard', ['category_id' => $subcategory->id]) }}" class="btn btn-info btn-sm">
                                                                    <i class="fas fa-eye"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    @else
                                        <div class="alert alert-info">
                                            <i class="fas fa-info-circle me-2"></i> У этой категории нет подкатегорий.
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @else
        <!-- Категории запчастей -->
        <div class="col-xl-12 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div><i class="fas fa-tags me-1"></i> Категории запчастей</div>
                    <a href="{{ route('admin.part-categories.create') }}" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus"></i> Добавить категорию
                    </a>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Родительская категория</th>
                                    <th>Кол-во запчастей</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($topCategories ?? [] as $category)
                                    <tr>
                                        <td>{{ $category->id }}</td>
                                        <td>{{ $category->name }}</td>
                                        <td>
                                            @if ($category->parent)
                                                {{ $category->parent->name }}
                                            @else
                                                <span class="text-muted">Корневая категория</span>
                                            @endif
                                        </td>
                                        <td>{{ $category->spare_parts_count ?? 0 }}</td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ route('admin.dashboard', ['category_id' => $category->id]) }}" class="btn btn-info btn-sm" title="Просмотр">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ route('admin.part-categories.edit', $category->id) }}" class="btn btn-primary btn-sm" title="Редактировать">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="text-center">Нет категорий</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                    <div class="text-end mt-3">
                        <a href="{{ route('admin.part-categories.index') }}" class="btn btn-sm btn-primary">Все категории</a>
                    </div>
                </div>
            </div>
        </div>
        @endif
    
        <!-- Последние предложения -->
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-comment me-1"></i>
                    Последние предложения пользователей
                </div>
                <div class="card-body">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Пользователь</th>
                                <th>Тип</th>
                                <th>Статус</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentSuggestions as $suggestion)
                                <tr>
                                    <td>{{ $suggestion->user->name }}</td>
                                    <td>
                                        @if($suggestion->suggestion_type == 'analog')
                                            Аналог
                                        @elseif($suggestion->suggestion_type == 'compatibility')
                                            Совместимость
                                        @else
                                            {{ $suggestion->suggestion_type }}
                                        @endif
                                    </td>
                                    <td>
                                        @if($suggestion->status == 'pending')
                                            <span class="badge bg-warning">Ожидает</span>
                                        @elseif($suggestion->status == 'approved')
                                            <span class="badge bg-success">Одобрено</span>
                                        @elseif($suggestion->status == 'rejected')
                                            <span class="badge bg-danger">Отклонено</span>
                                        @endif
                                    </td>
                                    <td>{{ $suggestion->created_at->format('d.m.Y') }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Нет предложений</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                    <div class="text-end mt-3">
                        <a href="{{ route('admin.suggestions.index') }}" class="btn btn-sm btn-primary">Все предложения</a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Последние заказы -->
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-shopping-cart me-1"></i>
                    Последние заказы
                </div>
                <div class="card-body">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Пользователь</th>
                                <th>Сумма</th>
                                <th>Статус</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentOrders as $order)
                                <tr>
                                    <td>{{ $order->id }}</td>
                                    <td>{{ $order->user->name }}</td>
                                    <td>{{ number_format($order->total_amount, 2) }} ₽</td>
                                    <td>
                                        @if($order->status == 'pending')
                                            <span class="badge bg-warning">Ожидает</span>
                                        @elseif($order->status == 'processing')
                                            <span class="badge bg-info">Обработка</span>
                                        @elseif($order->status == 'completed')
                                            <span class="badge bg-success">Завершен</span>
                                        @elseif($order->status == 'cancelled')
                                            <span class="badge bg-danger">Отменен</span>
                                        @endif
                                    </td>
                                    <td>{{ $order->created_at->format('d.m.Y') }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center">Нет заказов</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                    <div class="text-end mt-3">
                        <a href="#" class="btn btn-sm btn-primary">Все заказы</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
@if(isset($selectedCategory))
<script>
    $(document).ready(function() {
        $('#spareParts').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Russian.json'
            },
            order: [[0, 'desc']]
        });
    });
</script>
@endif
@endsection 