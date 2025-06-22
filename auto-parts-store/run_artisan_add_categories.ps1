# Скрипт для запуска Artisan команды добавления категорий

Write-Host "Запуск Artisan команды для добавления категорий запчастей..." -ForegroundColor Cyan

try {
    # Переходим в директорию проекта
    Set-Location -Path $PSScriptRoot
    
    # Запускаем Artisan команду
    php artisan app:add-part-categories
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nКатегории запчастей успешно добавлены в базу данных." -ForegroundColor Green
    } else {
        Write-Error "Ошибка при выполнении Artisan команды. Код ошибки: $LASTEXITCODE"
    }
} catch {
    Write-Error "Произошла ошибка при выполнении скрипта: $_"
}

Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 