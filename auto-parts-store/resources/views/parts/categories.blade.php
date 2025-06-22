@extends('layouts.app')

@section('title', 'Категории запчастей для ' . $engine->brand_name . ' ' . $engine->model_name . ' ' . $engine->name)

@section('content')
<div class="container mt-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('home') }}">Главная</a></li>
            <li class="breadcrumb-item"><a href="{{ route('brands.index') }}">Бренды</a></li>
            <li class="breadcrumb-item"><a href="{{ route('brands.show', $engine->brand_id) }}">{{ $engine->brand_name }}</a></li>
            <li class="breadcrumb-item"><a href="{{ route('models.show', ['id' => $engine->model_id]) }}">{{ $engine->model_name }}</a></li>
            <li class="breadcrumb-item"><a href="{{ route('engines.index', ['id' => $engine->model_id]) }}">Двигатели</a></li>
            <li class="breadcrumb-item active" aria-current="page">{{ $engine->name }}</li>
        </ol>
    </nav>

    <div class="row mb-4">
        <div class="col-md-12">
            <h1>Категории запчастей для {{ $engine->brand_name }} {{ $engine->model_name }}</h1>
            <p class="lead">Двигатель: {{ $engine->name }} ({{ $engine->volume }} л, {{ $engine->power }} л.с., {{ $engine->type }})</p>
        </div>
    </div>

    @if($categories->isEmpty())
        <div class="alert alert-warning">
            К сожалению, для данного двигателя пока не добавлены категории запчастей.
        </div>
    @else
        <div class="row">
            @foreach($categories as $category)
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        @if($category->image_url)
                            <img src="{{ asset('storage/' . $category->image_url) }}" class="card-img-top" alt="{{ $category->name }}">
                        @else
                            <div class="card-img-top bg-light text-center pt-4 pb-4">
                                <i class="fas fa-cogs fa-4x text-muted"></i>
                            </div>
                        @endif
                        <div class="card-body">
                            <h5 class="card-title">{{ $category->name }}</h5>
                            <p class="card-text">{{ $category->description ?: 'Запчасти для ' . $engine->brand_name . ' ' . $engine->model_name . ' ' . $engine->name }}</p>
                        </div>
                        <div class="card-footer bg-white border-top-0">
                            <a href="{{ route('categories.show', $category->id) }}?engine_id={{ $engine->id }}" class="btn btn-primary btn-block">Выбрать</a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>
@endsection 