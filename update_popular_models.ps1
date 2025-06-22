# Скрипт для обновления популярных моделей автомобилей

$DatabaseName = "auto_parts_store"
$User = "postgres"
$Password = "postgres"  # Замените на свой пароль
$Host = "localhost"
$Port = "5432"

# Путь к файлу с SQL-запросами
$SqlFilePath = Join-Path $PSScriptRoot "update_popular_models.sql"

# Проверка наличия файла
if (-not (Test-Path $SqlFilePath)) {
    Write-Error "Файл с SQL-запросами не найден по пути: $SqlFilePath"
    exit 1
}

# Формирование команды для запуска psql
$PsqlCmd = "psql -h $Host -p $Port -U $User -d $DatabaseName -f `"$SqlFilePath`""

# Запуск команды через PowerShell
Write-Host "Выполнение SQL-запросов для обновления популярных моделей..."
$env:PGPASSWORD = $Password
try {
    Invoke-Expression $PsqlCmd
    Write-Host "Запросы успешно выполнены!" -ForegroundColor Green
}
catch {
    Write-Error "Ошибка при выполнении SQL-запросов: $_"
    exit 1
}
finally {
    # Очистка переменной с паролем
    $env:PGPASSWORD = ""
}

Write-Host "Популярные модели для брендов обновлены:"
Write-Host "Toyota: Camry, Corolla, RAV4, Land Cruiser" -ForegroundColor Cyan
Write-Host "Honda: Civic, Accord, CR-V, Pilot" -ForegroundColor Cyan
Write-Host "BMW: 3 series, 5 series, X5, X6" -ForegroundColor Cyan
Write-Host "Mercedes-Benz: E-Class, C-Class, S-Class, GLE" -ForegroundColor Cyan
Write-Host "Kia: Sportage, Rio, Sorento, Ceed" -ForegroundColor Cyan
Write-Host "Hyundai: Solaris, Tucson, Santa Fe, Creta" -ForegroundColor Cyan
Write-Host "Audi: A6, A7, Q5, Q7" -ForegroundColor Cyan 