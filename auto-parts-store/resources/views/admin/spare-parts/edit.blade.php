@extends('layouts.admin')

@section('content')
<div class="container-fluid">
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Важно!</strong> Мы переходим на новую версию интерфейса. 
        <a href="{{ route('admin.spare-parts.edit', $sparePart->id) }}" class="btn btn-primary btn-sm">Перейти на новую версию</a>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Редактирование запчасти</h4>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.spare-parts.update', $sparePart->id) }}" method="POST">
                        @csrf
                        @method('PUT')

                        <div class="form-group">
                            <label for="name">Название запчасти</label>
                            <input type="text" name="name" id="name" class="form-control" value="{{ $sparePart->name }}" required>
                        </div>

                        <div class="form-group">
                            <label for="description">Описание запчасти</label>
                            <textarea name="description" id="description" class="form-control" rows="3">{{ $sparePart->description }}</textarea>
                        </div>

                        <div class="form-group">
                            <label for="price">Цена запчасти</label>
                            <input type="number" name="price" id="price" class="form-control" value="{{ $sparePart->price }}" required>
                        </div>

                        <div class="form-group">
                            <label for="quantity">Количество запчасти</label>
                            <input type="number" name="quantity" id="quantity" class="form-control" value="{{ $sparePart->quantity }}" required>
                        </div>

                        <div class="form-group">
                            <label for="category_id">Категория запчасти</label>
                            <select name="category_id" id="category_id" class="form-control" required>
                                @foreach ($categories as $category)
                                    <option value="{{ $category->id }}" {{ $sparePart->category_id == $category->id ? 'selected' : '' }}>{{ $category->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="supplier_id">Поставщик запчасти</label>
                            <select name="supplier_id" id="supplier_id" class="form-control" required>
                                @foreach ($suppliers as $supplier)
                                    <option value="{{ $supplier->id }}" {{ $sparePart->supplier_id == $supplier->id ? 'selected' : '' }}>{{ $supplier->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="image">Изображение запчасти</label>
                            <input type="file" name="image" id="image" class="form-control">
                        </div>

                        <button type="submit" class="btn btn-primary">Сохранить</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 