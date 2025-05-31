@extends('layouts.admin')

@section('content')
<div class="container-fluid px-4">
    <h1 class="mt-4">Предложения пользователей</h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Панель управления</a></li>
        <li class="breadcrumb-item active">Предложения пользователей</li>
    </ol>
    
    <div class="card mb-4">
        <div class="card-header">
            <i class="fas fa-table me-1"></i>
            Список предложений
        </div>
        <div class="card-body">
            <div class="mb-3">
                <form action="{{ route('admin.suggestions.index') }}" method="GET" class="row g-3">
                    <div class="col-md-3">
                        <select name="status" class="form-select">
                            <option value="">Все статусы</option>
                            <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Ожидает</option>
                            <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Одобрено</option>
                            <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Отклонено</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select name="type" class="form-select">
                            <option value="">Все типы</option>
                            <option value="analog" {{ request('type') == 'analog' ? 'selected' : '' }}>Аналог</option>
                            <option value="compatibility" {{ request('type') == 'compatibility' ? 'selected' : '' }}>Совместимость</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <div class="input-group">
                            <input type="text" name="search" class="form-control" placeholder="Поиск..." value="{{ request('search') }}">
                            <button class="btn btn-primary" type="submit">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <a href="{{ route('admin.suggestions.index') }}" class="btn btn-secondary w-100">Сбросить</a>
                    </div>
                </form>
            </div>
            
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь</th>
                            <th>Тип</th>
                            <th>Запчасть</th>
                            <th>Статус</th>
                            <th>Дата создания</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($suggestions as $suggestion)
                            <tr>
                                <td>{{ $suggestion->id }}</td>
                                <td>{{ $suggestion->user ? $suggestion->user->name : 'Не указан' }}</td>
                                <td>
                                    @if($suggestion->suggestion_type == 'analog')
                                        <span class="badge bg-info">Аналог</span>
                                    @elseif($suggestion->suggestion_type == 'compatibility')
                                        <span class="badge bg-primary">Совместимость</span>
                                    @else
                                        <span class="badge bg-secondary">{{ $suggestion->suggestion_type }}</span>
                                    @endif
                                </td>
                                <td>
                                    @if($suggestion->sparePart)
                                        <div class="text-sm">
                                            <div class="flex items-center">
                                                <span class="badge bg-secondary">{{ $suggestion->sparePart->part_number }}</span>
                                                @if($suggestion->suggestion_type == 'analog' && $suggestion->data && !empty($suggestion->data['analog_article']))
                                                    <i class="fas fa-arrow-right mx-1 text-primary"></i>
                                                    <span class="badge bg-info">{{ $suggestion->data['analog_article'] }}</span>
                                                    <small class="ml-1 text-muted">({{ $suggestion->data['analog_brand'] ?? 'Не указан' }})</small>
                                                @elseif($suggestion->suggestion_type == 'compatibility' && $suggestion->carModel && $suggestion->carModel->brand)
                                                    <i class="fas fa-arrow-right mx-1 text-purple-500"></i>
                                                    <span class="badge bg-purple-100 text-purple-800">{{ $suggestion->carModel->brand->name }} {{ $suggestion->carModel->name }}</span>
                                                @endif
                                            </div>
                                        </div>
                                    @else
                                        <span class="text-muted">Не указано</span>
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
                                <td>{{ $suggestion->created_at->format('d.m.Y H:i') }}</td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <button type="button" class="btn btn-sm btn-info" data-bs-toggle="modal" data-bs-target="#viewModal{{ $suggestion->id }}">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        
                                        @if($suggestion->status == 'pending')
                                            <button type="button" class="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#approveModal{{ $suggestion->id }}">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            
                                            <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#rejectModal{{ $suggestion->id }}">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        @endif
                                        
                                        <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal{{ $suggestion->id }}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Модальное окно для просмотра деталей предложения -->
                                    <div class="modal fade" id="viewModal{{ $suggestion->id }}" tabindex="-1" aria-labelledby="viewModalLabel{{ $suggestion->id }}" aria-hidden="true">
                                        <div class="modal-dialog modal-lg">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="viewModalLabel{{ $suggestion->id }}">Детали предложения #{{ $suggestion->id }}</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="row mb-3">
                                                        <div class="col-md-4 fw-bold">Тип предложения:</div>
                                                        <div class="col-md-8">
                                                            @if($suggestion->suggestion_type == 'analog')
                                                                <span class="badge bg-info">Аналог запчасти</span>
                                                            @elseif($suggestion->suggestion_type == 'compatibility')
                                                                <span class="badge bg-primary">Совместимость с автомобилем</span>
                                                            @else
                                                                <span class="badge bg-secondary">{{ $suggestion->suggestion_type }}</span>
                                                            @endif
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="row mb-3">
                                                        <div class="col-md-4 fw-bold">Пользователь:</div>
                                                        <div class="col-md-8">
                                                            @if($suggestion->user)
                                                                {{ $suggestion->user->name }} ({{ $suggestion->user->email }})
                                                            @else
                                                                <span class="text-muted">Пользователь не указан</span>
                                                            @endif
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="row mb-3">
                                                        <div class="col-md-4 fw-bold">Запчасть:</div>
                                                        <div class="col-md-8">
                                                            <div class="d-flex align-items-center">
                                                                @if($suggestion->sparePart)
                                                                    <span class="badge bg-secondary me-2">{{ $suggestion->sparePart->part_number }}</span>
                                                                    <span>{{ $suggestion->sparePart->manufacturer }}</span>
                                                                @else
                                                                    <span class="text-danger">Запчасть не найдена</span>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    @if($suggestion->suggestion_type == 'analog')
                                                        <div class="row mb-3">
                                                            <div class="col-md-4 fw-bold">Аналог:</div>
                                                            <div class="col-md-8">
                                                                <div class="d-flex align-items-center">
                                                                    @if($suggestion->analogSparePart)
                                                                        <span class="badge bg-success me-2">{{ $suggestion->analogSparePart->part_number }}</span>
                                                                        <span>{{ $suggestion->analogSparePart->manufacturer }}</span>
                                                                    @elseif($suggestion->data && !empty($suggestion->data['analog_article']))
                                                                        <span class="badge bg-info me-2">{{ $suggestion->data['analog_article'] }}</span>
                                                                        <span>{{ $suggestion->data['analog_brand'] ?? 'Не указан' }}</span>
                                                                    @else
                                                                        <span class="badge bg-danger">Не найден</span>
                                                                    @endif
                                                                    
                                                                    @if(isset($suggestion->data['analog_type']))
                                                                        <span class="badge {{ $suggestion->data['analog_type'] == 'direct' ? 'bg-success' : 'bg-warning text-dark' }} ms-3">
                                                                            {{ $suggestion->data['analog_type'] == 'direct' ? 'Прямой аналог' : 'Заменитель' }}
                                                                        </span>
                                                                    @endif
                                                                </div>
                                                                
                                                                @if($suggestion->data && !empty($suggestion->data['analog_description']))
                                                                    <div class="mt-2">
                                                                        <small class="text-muted">Описание:</small>
                                                                        <p class="mb-0">{{ $suggestion->data['analog_description'] }}</p>
                                                                    </div>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    @elseif($suggestion->suggestion_type == 'compatibility')
                                                        <div class="row mb-3">
                                                            <div class="col-md-4 fw-bold">Автомобиль:</div>
                                                            <div class="col-md-8">
                                                                @if($suggestion->carModel && $suggestion->carModel->brand)
                                                                    <span class="badge bg-primary">{{ $suggestion->carModel->brand->name }} {{ $suggestion->carModel->name }}</span>
                                                                    @if($suggestion->data && (!empty($suggestion->data['start_year']) || !empty($suggestion->data['end_year'])))
                                                                        <span class="ms-2">
                                                                            ({{ $suggestion->data['start_year'] ?? '-' }} - {{ $suggestion->data['end_year'] ?? 'н.в.' }})
                                                                        </span>
                                                                    @endif
                                                                @else
                                                                    <span class="text-danger">Не указан</span>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    @endif
                                                    
                                                    <div class="row mb-3">
                                                        <div class="col-md-4 fw-bold">Комментарий:</div>
                                                        <div class="col-md-8">
                                                            {{ $suggestion->comment ?? 'Не указан' }}
                                                        </div>
                                                    </div>
                                                    
                                                    @if($suggestion->status != 'pending')
                                                        <div class="row mb-3">
                                                            <div class="col-md-4 fw-bold">Статус:</div>
                                                            <div class="col-md-8">
                                                                @if($suggestion->status == 'approved')
                                                                    <span class="badge bg-success">Одобрено</span>
                                                                @elseif($suggestion->status == 'rejected')
                                                                    <span class="badge bg-danger">Отклонено</span>
                                                                @endif
                                                                
                                                                @if($suggestion->approved_by)
                                                                    <small class="d-block mt-1">
                                                                        {{ $suggestion->approvedBy->name ?? 'Администратор' }} 
                                                                        ({{ $suggestion->approved_at ? $suggestion->approved_at->format('d.m.Y H:i') : 'Дата не указана' }})
                                                                    </small>
                                                                @endif
                                                                
                                                                @if($suggestion->admin_comment)
                                                                    <div class="mt-2">
                                                                        <small class="text-muted">Комментарий администратора:</small>
                                                                        <p class="mb-0">{{ $suggestion->admin_comment }}</p>
                                                                    </div>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    @endif
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                                                    <a href="{{ route('admin.suggestions.show', $suggestion->id) }}" class="btn btn-primary">Полный просмотр</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Модальное окно для одобрения -->
                                    <div class="modal fade" id="approveModal{{ $suggestion->id }}" tabindex="-1" aria-labelledby="approveModalLabel{{ $suggestion->id }}" aria-hidden="true">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="approveModalLabel{{ $suggestion->id }}">Подтверждение одобрения</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <p>Вы уверены, что хотите одобрить это предложение?</p>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                                                    <form action="{{ route('admin.suggestions.approve', $suggestion->id) }}" method="POST">
                                                        @csrf
                                                        <button type="submit" class="btn btn-success">Одобрить</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Модальное окно для отклонения -->
                                    <div class="modal fade" id="rejectModal{{ $suggestion->id }}" tabindex="-1" aria-labelledby="rejectModalLabel{{ $suggestion->id }}" aria-hidden="true">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="rejectModalLabel{{ $suggestion->id }}">Отклонение предложения</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <form action="{{ route('admin.suggestions.reject', $suggestion->id) }}" method="POST">
                                                    @csrf
                                                    <div class="modal-body">
                                                        <div class="mb-3">
                                                            <label for="admin_comment" class="form-label">Причина отклонения</label>
                                                            <textarea class="form-control" id="admin_comment" name="admin_comment" rows="3" required></textarea>
                                                            <div class="form-text">Укажите причину отклонения предложения, которая будет отправлена пользователю.</div>
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                                                        <button type="submit" class="btn btn-danger">Отклонить</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Модальное окно для удаления -->
                                    <div class="modal fade" id="deleteModal{{ $suggestion->id }}" tabindex="-1" aria-labelledby="deleteModalLabel{{ $suggestion->id }}" aria-hidden="true">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="deleteModalLabel{{ $suggestion->id }}">Подтверждение удаления</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <p class="text-danger">Вы уверены, что хотите удалить это предложение? Это действие нельзя отменить.</p>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                                                    <form action="{{ route('admin.suggestions.destroy', $suggestion->id) }}" method="POST">
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
                                <td colspan="7" class="text-center">Предложений не найдено</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-center mt-4">
                {{ $suggestions->appends(request()->query())->links() }}
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Обработка ошибок при открытии модальных окон
    const viewButtons = document.querySelectorAll('[data-bs-toggle="modal"]');
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            try {
                const targetId = this.getAttribute('data-bs-target');
                console.log('Открытие модального окна:', targetId);
                
                // Задержка, чтобы убедиться, что модальное окно открывается
                setTimeout(() => {
                    const modal = document.querySelector(targetId);
                    if (modal && !modal.classList.contains('show')) {
                        console.error('Модальное окно не открылось:', targetId);
                    }
                }, 500);
            } catch (error) {
                console.error('Ошибка при открытии модального окна:', error);
                alert('Произошла ошибка при открытии данных. Пожалуйста, перезагрузите страницу или обратитесь к администратору.');
                e.preventDefault();
            }
        });
    });
});
</script>
@endpush 