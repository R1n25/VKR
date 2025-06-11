@extends('layouts.admin')

@section('content')
<div class="container-fluid">
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Важно!</strong> Мы переходим на новую версию интерфейса. 
        <a href="{{ route('admin.spare-parts.show', $sparePart->id) }}" class="btn btn-primary btn-sm">Перейти на новую версию</a>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Просмотр запчасти</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="name">Название запчасти</label>
                                <input type="text" class="form-control" id="name" name="name" value="{{ $sparePart->name }}" readonly>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="price">Цена</label>
                                <input type="text" class="form-control" id="price" name="price" value="{{ $sparePart->price }}" readonly>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="quantity">Количество</label>
                                <input type="text" class="form-control" id="quantity" name="quantity" value="{{ $sparePart->quantity }}" readonly>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="category">Категория</label>
                                <input type="text" class="form-control" id="category" name="category" value="{{ $sparePart->category }}" readonly>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="supplier">Поставщик</label>
                                <input type="text" class="form-control" id="supplier" name="supplier" value="{{ $sparePart->supplier }}" readonly>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
 