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
            <div class="card bg-danger text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>Предложения</div>
                        <div><strong>{{ $stats['pending_suggestions_count'] }}</strong></div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="{{ route('admin.suggestions.index') }}">Рассмотреть предложения</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row">
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