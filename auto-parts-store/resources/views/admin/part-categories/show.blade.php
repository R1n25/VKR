@extends('layouts.admin')

@section('title', 'Просмотр категории запчастей')

@section('content')
<div class="container-fluid px-4">
    <h1 class="mt-4">Категория: {{ $partCategory->name }}</h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Панель управления</a></li>
        <li class="breadcrumb-item"><a href="{{ route('admin.part-categories.index') }}">Категории запчастей</a></li>
        <li class="breadcrumb-item active">Просмотр</li>
    </ol>
    
    <div class="row">
        <div class="col-lg-5 mb-4">
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-info-circle me-1"></i> Информация о категории
                </div>
                <div class="card-body">
                    <div class="text-center mb-4">
                        @if ($partCategory->image_url)
                            <img src="{{ $partCategory->image_url }}" alt="{{ $partCategory->name }}" class="img-fluid img-thumbnail" style="max-height: 200px;">
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
                            <td>{{ $partCategory->id }}</td>
                        </tr>
                        <tr>
                            <th>Название:</th>
                            <td>{{ $partCategory->name }}</td>
                        </tr>
                        <tr>
                            <th>Slug:</th>
                            <td>{{ $partCategory->slug }}</td>
                        </tr>
                        <tr>
                            <th>Родительская категория:</th>
                            <td>
                                @if ($partCategory->parent)
                                    <a href="{{ route('admin.part-categories.show', $partCategory->parent->id) }}">
                                        {{ $partCategory->parent->name }}
                                    </a>
                                @else
                                    <span class="text-muted">Корневая категория</span>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <th>Дата создания:</th>
                            <td>{{ $partCategory->created_at->format('d.m.Y H:i') }}</td>
                        </tr>
                        <tr>
                            <th>Последнее обновление:</th>
                            <td>{{ $partCategory->updated_at->format('d.m.Y H:i') }}</td>
                        </tr>
                    </table>
                    
                    <div class="mt-3">
                        <a href="{{ route('admin.part-categories.edit', $partCategory->id) }}" class="btn btn-primary">
                            <i class="fas fa-edit"></i> Редактировать
                        </a>
                        <form action="{{ route('admin.part-categories.destroy', $partCategory->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Вы уверены, что хотите удалить эту категорию?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger">
                                <i class="fas fa-trash"></i> Удалить
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            @if ($partCategory->description)
                <div class="card mt-4">
                    <div class="card-header">
                        <i class="fas fa-align-left me-1"></i> Описание
                    </div>
                    <div class="card-body">
                        {{ $partCategory->description }}
                    </div>
                </div>
            @endif
        </div>
        
        <div class="col-lg-7">
            <div class="card mb-4">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-list me-1"></i> Запчасти в категории ({{ $partCategory->spareParts->count() }})</div>
                    </div>
                </div>
                <div class="card-body">
                    @if ($partCategory->spareParts->count() > 0)
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
                                    @foreach ($partCategory->spareParts as $part)
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
                                                <a href="{{ route('admin.part-categories.show', $subcategory->id) }}" class="btn btn-info btn-sm">
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
@endsection

@section('scripts')
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
@endsection 