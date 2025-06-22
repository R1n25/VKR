# Скрипт для запуска PHP-скрипта добавления категорий

Write-Host "Запуск скрипта добавления категорий запчастей..." -ForegroundColor Cyan

try {
    # Переходим в директорию проекта
    Set-Location -Path $PSScriptRoot
    
    # Запускаем PHP-скрипт
    php add_categories.php
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nКатегории запчастей успешно добавлены в базу данных." -ForegroundColor Green
    } else {
        Write-Error "Ошибка при выполнении PHP-скрипта. Код ошибки: $LASTEXITCODE"
    }
} catch {
    Write-Error "Произошла ошибка при выполнении скрипта: $_"
}

Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 