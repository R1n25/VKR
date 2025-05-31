@extends('layouts.admin')

@section('content')
<div class="container-fluid px-4">
    <h1 class="mt-4">Просмотр предложения #{{ $suggestion->id }}</h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Панель управления</a></li>
        <li class="breadcrumb-item"><a href="{{ route('admin.suggestions.index') }}">Предложения пользователей</a></li>
        <li class="breadcrumb-item active">Предложение #{{ $suggestion->id }}</li>
    </ol>
    
    <div class="row">
        <div class="col-xl-8">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-info-circle me-1"></i>
                    Информация о предложении
                </div>
                <div class="card-body">
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
                        <div class="col-md-4 fw-bold">Статус:</div>
                        <div class="col-md-8">
                            @if($suggestion->status == 'pending')
                                <span class="badge bg-warning">Ожидает рассмотрения</span>
                            @elseif($suggestion->status == 'approved')
                                <span class="badge bg-success">Одобрено</span>
                            @elseif($suggestion->status == 'rejected')
                                <span class="badge bg-danger">Отклонено</span>
                            @endif
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Дата создания:</div>
                        <div class="col-md-8">{{ $suggestion->created_at->format('d.m.Y H:i') }}</div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Пользователь:</div>
                        <div class="col-md-8">
                            <strong>{{ $suggestion->user->name }}</strong> ({{ $suggestion->user->email }})
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Запчасть:</div>
                        <div class="col-md-8">
                            @if($suggestion->sparePart)
                                <div class="d-flex align-items-center">
                                    <span class="badge bg-secondary me-2">{{ $suggestion->sparePart->part_number }}</span>
                                    <span>{{ $suggestion->sparePart->manufacturer }}</span>
                                </div>
                            @else
                                <span class="text-muted">Не указано</span>
                            @endif
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
                                    
                                    <span class="badge {{ strpos($analogTypeText, 'Прямой') !== false ? 'bg-success' : 'bg-warning text-dark' }} ms-3">
                                        {{ $analogTypeText }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-4 fw-bold">Тип аналога:</div>
                            <div class="col-md-8">
                                @if(isset($analogTypeText))
                                    @if(strpos($analogTypeText, 'Прямой') !== false)
                                        <span class="badge bg-success">{{ $analogTypeText }}</span>
                                        <small class="text-muted d-block mt-1">Полностью заменяет оригинальную деталь</small>
                                    @else
                                        <span class="badge bg-warning text-dark">{{ $analogTypeText }}</span>
                                        <small class="text-muted d-block mt-1">Подходит с некоторыми ограничениями</small>
                                    @endif
                                @else
                                    <span class="badge bg-secondary">Не указан</span>
                                @endif
                            </div>
                        </div>
                    @elseif($suggestion->suggestion_type == 'compatibility')
                        <div class="row mb-3">
                            <div class="col-md-4 fw-bold">Совместимый автомобиль:</div>
                            <div class="col-md-8">
                                @if($carModel)
                                    {{ $carModel->brand }} {{ $carModel->name }} ({{ $carModel->year_from }} - {{ $carModel->year_to ?? 'настоящее время' }})
                                @else
                                    <span class="text-danger">Автомобиль не найден</span>
                                @endif
                            </div>
                        </div>
                    @endif
                    
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Комментарий пользователя:</div>
                        <div class="col-md-8">
                            {{ $suggestion->comment ?? 'Нет комментария' }}
                        </div>
                    </div>
                    
                    @if($suggestion->status == 'rejected')
                        <div class="row mb-3">
                            <div class="col-md-4 fw-bold">Причина отклонения:</div>
                            <div class="col-md-8">
                                {{ $suggestion->admin_comment ?? 'Не указана' }}
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-4 fw-bold">Отклонено администратором:</div>
                            <div class="col-md-8">
                                {{ $suggestion->approvedByUser->name ?? 'Неизвестно' }}
                                ({{ $suggestion->approved_at ? $suggestion->approved_at->format('d.m.Y H:i') : 'Дата не указана' }})
                            </div>
                        </div>
                    @elseif($suggestion->status == 'approved')
                        <div class="row mb-3">
                            <div class="col-md-4 fw-bold">Одобрено администратором:</div>
                            <div class="col-md-8">
                                {{ $suggestion->approvedByUser->name ?? 'Неизвестно' }}
                                ({{ $suggestion->approved_at ? $suggestion->approved_at->format('d.m.Y H:i') : 'Дата не указана' }})
                            </div>
                        </div>
                    @endif
                    
                    @if($suggestion->data)
                        <div class="row mb-3">
                            <div class="col-md-4 fw-bold">Дополнительные данные:</div>
                            <div class="col-md-8">
                                <pre class="bg-light p-2 rounded">{{ json_encode(json_decode($suggestion->data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
        
        <div class="col-xl-4">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-cog me-1"></i>
                    Действия
                </div>
                <div class="card-body">
                    @if($suggestion->status == 'pending')
                        <div class="d-grid gap-2 mb-3">
                            <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#approveModal">
                                <i class="fas fa-check me-1"></i> Одобрить предложение
                            </button>
                            
                            <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#rejectModal">
                                <i class="fas fa-times me-1"></i> Отклонить предложение
                            </button>
                        </div>
                    @else
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-info-circle me-1"></i>
                            Предложение уже обработано и имеет статус 
                            @if($suggestion->status == 'approved')
                                <strong>одобрено</strong>
                            @elseif($suggestion->status == 'rejected')
                                <strong>отклонено</strong>
                            @endif
                        </div>
                    @endif
                    
                    <hr>
                    
                    <div class="d-grid gap-2">
                        <a href="{{ route('admin.suggestions.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Вернуться к списку
                        </a>
                        
                        <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">
                            <i class="fas fa-trash-alt me-1"></i> Удалить предложение
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Модальное окно для одобрения -->
<div class="modal fade" id="approveModal" tabindex="-1" aria-labelledby="approveModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="approveModalLabel">Подтверждение одобрения</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Вы уверены, что хотите одобрить это предложение?</p>
                
                @if($suggestion->suggestion_type == 'analog')
                    <div class="alert alert-info">
                        <strong>Внимание!</strong> После одобрения будет создана связь между запчастями как аналогов.
                    </div>
                @elseif($suggestion->suggestion_type == 'compatibility')
                    <div class="alert alert-info">
                        <strong>Внимание!</strong> После одобрения будет создана связь совместимости между запчастью и автомобилем.
                    </div>
                @endif
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
<div class="modal fade" id="rejectModal" tabindex="-1" aria-labelledby="rejectModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="rejectModalLabel">Отклонение предложения</h5>
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
<div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteModalLabel">Подтверждение удаления</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Вы уверены, что хотите удалить это предложение?</p>
                <div class="alert alert-danger">
                    <strong>Внимание!</strong> Это действие нельзя отменить. Предложение будет безвозвратно удалено.
                </div>
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
@endsection 