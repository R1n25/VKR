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
                                <td>{{ $suggestion->user->name }}</td>
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
                                        <a href="{{ route('spare-parts.show', $suggestion->sparePart->id) }}" target="_blank">
                                            {{ $suggestion->sparePart->name }}
                                        </a>
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
                                        <a href="{{ route('admin.suggestions.show', $suggestion->id) }}" class="btn btn-sm btn-info">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        
                                        @if($suggestion->status == 'pending')
                                            <button type="button" class="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#approveModal{{ $suggestion->id }}">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            
                                            <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#rejectModal{{ $suggestion->id }}">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        @endif
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