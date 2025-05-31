@extends('layouts.admin')

@section('content')
<div class="container-fluid px-4">
    <h1 class="mt-4">Управление запчастями</h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Панель управления</a></li>
        <li class="breadcrumb-item active">Запчасти</li>
    </ol>
    
    <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <i class="fas fa-table me-1"></i>
                Список запчастей
            </div>
            <a href="{{ route('admin.spare-parts.create') }}" class="btn btn-primary btn-sm">
                <i class="fas fa-plus"></i> Добавить запчасть
            </a>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <form action="{{ route('admin.spare-parts.index') }}" method="GET" class="row g-3">
                    <div class="col-md-3">
                        <div class="input-group">
                            <input type="text" name="search" class="form-control" placeholder="Поиск..." value="{{ request('search') }}">
                            <button class="btn btn-primary" type="submit">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <select name="category" class="form-select">
                            <option value="">Все категории</option>
                            @foreach($categories as $category)
                                <option value="{{ $category->id }}" {{ request('category') == $category->id ? 'selected' : '' }}>
                                    {{ $category->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select name="manufacturer" class="form-select">
                            <option value="">Все производители</option>
                            @foreach($manufacturers as $manufacturer)
                                <option value="{{ $manufacturer }}" {{ request('manufacturer') == $manufacturer ? 'selected' : '' }}>
                                    {{ $manufacturer }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select name="status" class="form-select">
                            <option value="">Все статусы</option>
                            <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Активные</option>
                            <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Неактивные</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select name="sort" class="form-select">
                            <option value="id" {{ request('sort') == 'id' ? 'selected' : '' }}>По ID</option>
                            <option value="name" {{ request('sort') == 'name' ? 'selected' : '' }}>По названию</option>
                            <option value="price" {{ request('sort') == 'price' ? 'selected' : '' }}>По цене</option>
                            <option value="stock_quantity" {{ request('sort') == 'stock_quantity' ? 'selected' : '' }}>По количеству</option>
                            <option value="created_at" {{ request('sort') == 'created_at' ? 'selected' : '' }}>По дате создания</option>
                        </select>
                    </div>
                    <div class="col-md-1">
                        <select name="direction" class="form-select">
                            <option value="asc" {{ request('direction') == 'asc' ? 'selected' : '' }}>↑</option>
                            <option value="desc" {{ request('direction') == 'desc' ? 'selected' : '' }}>↓</option>
                        </select>
                    </div>
                </form>
            </div>
            
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Изображение</th>
                            <th>Название</th>
                            <th>Артикул</th>
                            <th>Категория</th>
                            <th>Производитель</th>
                            <th>Цена</th>
                            <th>Кол-во</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($spareParts as $sparePart)
                            <tr>
                                <td>{{ $sparePart->id }}</td>
                                <td class="text-center">
                                    @if($sparePart->image)
                                        <img src="{{ asset('storage/' . $sparePart->image) }}" alt="{{ $sparePart->name }}" class="img-thumbnail" style="max-width: 50px; max-height: 50px;">
                                    @else
                                        <span class="text-muted"><i class="fas fa-image"></i></span>
                                    @endif
                                </td>
                                <td>{{ $sparePart->name }}</td>
                                <td>{{ $sparePart->article_number }}</td>
                                <td>{{ $sparePart->category->name ?? 'Нет категории' }}</td>
                                <td>{{ $sparePart->manufacturer ?? 'Нет производителя' }}</td>
                                <td>{{ number_format($sparePart->price, 2) }} ₽</td>
                                <td>{{ $sparePart->stock_quantity }}</td>
                                <td>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input toggle-status" type="checkbox" role="switch" 
                                            id="status-{{ $sparePart->id }}" 
                                            data-id="{{ $sparePart->id }}" 
                                            {{ $sparePart->is_active ? 'checked' : '' }}>
                                        <label class="form-check-label" for="status-{{ $sparePart->id }}">
                                            <span class="status-text">{{ $sparePart->is_active ? 'Активна' : 'Неактивна' }}</span>
                                        </label>
                                    </div>
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('admin.spare-parts.show', $sparePart->id) }}" class="btn btn-sm btn-info">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ route('admin.spare-parts.edit', $sparePart->id) }}" class="btn btn-sm btn-primary">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal{{ $sparePart->id }}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Модальное окно для удаления -->
                                    <div class="modal fade" id="deleteModal{{ $sparePart->id }}" tabindex="-1" aria-labelledby="deleteModalLabel{{ $sparePart->id }}" aria-hidden="true">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="deleteModalLabel{{ $sparePart->id }}">Подтверждение удаления</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <p>Вы уверены, что хотите удалить запчасть "{{ $sparePart->name }}"?</p>
                                                    <p class="text-danger">Это действие невозможно отменить.</p>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                                                    <form action="{{ route('admin.spare-parts.destroy', $sparePart->id) }}" method="POST">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit" class="btn btn-danger">Удалить</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="10" class="text-center">Запчасти не найдены</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-center mt-4">
                {{ $spareParts->links() }}
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Обработка изменения фильтров
        const filterForm = document.querySelector('form');
        const filterInputs = filterForm.querySelectorAll('select, input[type="text"]');
        
        filterInputs.forEach(input => {
            input.addEventListener('change', function() {
                filterForm.submit();
            });
        });
        
        // Обработка переключения статуса
        const toggleStatusSwitches = document.querySelectorAll('.toggle-status');
        
        toggleStatusSwitches.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const sparePartId = this.dataset.id;
                const statusText = this.parentElement.querySelector('.status-text');
                
                fetch(`{{ url('admin/spare-parts') }}/${sparePartId}/toggle-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        statusText.textContent = data.is_active ? 'Активна' : 'Неактивна';
                    } else {
                        this.checked = !this.checked;
                        alert('Произошла ошибка при изменении статуса');
                    }
                })
                .catch(error => {
                    this.checked = !this.checked;
                    console.error('Error:', error);
                    alert('Произошла ошибка при изменении статуса');
                });
            });
        });
    });
</script>
@endpush 