<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Сессия истекла | Авто-Запчасти</title>
    
    <!-- Подключаем стили Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Подключаем шрифты -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Montserrat', sans-serif;
            background-color: #000000;
            color: #ffffff;
        }
        .error-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        .error-image {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }
        .error-title {
            font-size: 2.5rem;
            color: #ffffff;
            margin-top: 1.5rem;
        }
        .error-text {
            font-size: 1.2rem;
            color: #cccccc;
            margin-top: 1rem;
        }
    </style>
</head>
<body class="bg-black">
    <div class="flex flex-col min-h-screen">
        <div class="flex-grow flex items-center justify-center">
            <div class="error-container text-center">
                <img src="{{ asset('images/404-cat.png') }}" alt="Ошибка 419 - Кот" class="error-image mx-auto">
                
                <h1 class="error-title font-bold mt-8">Сессия истекла</h1>
                
                <p class="error-text mt-4">
                    Ваша сессия истекла из-за длительного отсутствия активности или проблем с безопасностью. Пожалуйста, обновите страницу и попробуйте снова.
                </p>
            </div>
        </div>
    </div>
</body>
</html> 