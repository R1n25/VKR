@extends('layouts.admin')

@section('title', 'Категории запчастей')

@section('content')
<div class="container-fluid px-4">
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Важно!</strong> Мы переходим на новую версию интерфейса. 
        <a href="{{ route('admin.part-categories.index') }}" class="btn btn-primary btn-sm">Перейти на новую версию</a>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>

    <h1 class="mt-4">Категории запчастей</h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Панель управления</a></li>
        <li class="breadcrumb-item active">Категории запчастей</li>
    </ol>
    
    <div class="mb-4">
        <a href="{{ route('admin.part-categories.create') }}" class="btn btn-primary">
            <i class="fas fa-plus"></i> Добавить категорию
        </a>
        
        <a href="{{ route('admin.part-categories.inertia') }}" class="btn btn-success ms-2">
            <i class="fas fa-code"></i> Перейти на Inertia-версию
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger">
            {{ session('error') }}
        </div>
    @endif

    <div class="card mb-4">
        <div class="card-header">
            <i class="fas fa-table me-1"></i>
            Список категорий
        </div>
        <div class="card-body">
            <table id="categoriesTable" class="table table-striped table-hover">
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
                    @foreach($categories as $category)
                        <tr>
                            <td>{{ $category->id }}</td>
                            <td>{{ $category->name }}</td>
                            <td>
                                @if($category->parent)
                                    <a href="{{ route('admin.part-categories.show', $category->parent->id) }}">
                                        {{ $category->parent->name }}
                                    </a>
                                @else
                                    <span class="text-muted">Корневая категория</span>
                                @endif
                            </td>
                            <td>{{ $category->spareParts->count() }}</td>
                            <td>
                                <div class="btn-group" role="group">
                                    <a href="{{ route('admin.part-categories.show', $category->id) }}" class="btn btn-sm btn-info">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('admin.part-categories.edit', $category->id) }}" class="btn btn-sm btn-primary">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ route('admin.part-categories.destroy', $category->id) }}" method="POST" class="d-inline delete-form">
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Вы уверены, что хотите удалить эту категорию?')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(document).ready(function() {
        $('#categoriesTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Russian.json'
            }
        });
    });
</script>
@endsection 