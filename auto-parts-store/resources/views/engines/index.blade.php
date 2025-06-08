@extends('layouts.app')

@section('title', 'Выбор двигателя для ' . $model->brand_name . ' ' . $model->name)

@section('content')
<div class="container mt-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('home') }}">Главная</a></li>
            <li class="breadcrumb-item"><a href="{{ route('brands.index') }}">Бренды</a></li>
            <li class="breadcrumb-item"><a href="{{ route('brands.show', $model->brand_id) }}">{{ $model->brand_name }}</a></li>
            <li class="breadcrumb-item active" aria-current="page">{{ $model->name }}</li>
        </ol>
    </nav>

    <div class="row mb-4">
        <div class="col-md-12">
            <h1>Выбор двигателя для {{ $model->brand_name }} {{ $model->name }}</h1>
            <p class="lead">Выберите двигатель вашего автомобиля, чтобы найти подходящие запчасти</p>
        </div>
    </div>

    @if($engines->isEmpty())
        <div class="alert alert-warning">
            К сожалению, для данной модели пока не добавлены двигатели. Пожалуйста, выберите другую модель.
        </div>
    @else
        <div class="row">
            @foreach($groupedEngines as $type => $typeEngines)
                <div class="col-md-12 mb-4">
                    <h2>{{ ucfirst($type) }}</h2>
                    <div class="row">
                        @foreach($typeEngines as $engine)
                            <div class="col-md-4 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">{{ $engine->name }}</h5>
                                        <p class="card-text">
                                            <strong>Объем:</strong> {{ $engine->volume }} л<br>
                                            <strong>Мощность:</strong> {{ $engine->power }} л.с.<br>
                                            <strong>Годы выпуска:</strong> {{ $engine->year_start }} - {{ $engine->year_end ?: 'н.в.' }}
                                        </p>
                                        <p class="card-text text-muted">{{ $engine->description }}</p>
                                    </div>
                                    <div class="card-footer bg-white border-top-0">
                                        <a href="{{ route('engines.parts', $engine->id) }}" class="btn btn-primary btn-block">Выбрать</a>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>
@endsection 