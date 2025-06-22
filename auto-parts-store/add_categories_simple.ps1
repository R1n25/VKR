# Скрипт для добавления категорий запчастей (упрощенная версия)

# Параметры подключения к базе данных
$dbHost = "localhost"
$dbPort = "3306"
$dbName = "auto_parts_store"
$dbUser = "root"
$dbPass = ""

# Путь к файлу SQL-запросов
$sqlFile = Join-Path $PSScriptRoot "add_categories_simple.sql"

# Проверка наличия файла SQL
if (-not (Test-Path $sqlFile)) {
    Write-Error "Файл SQL-запросов не найден: $sqlFile"
    exit 1
}

# Формирование команды для выполнения SQL-запросов
$mysqlCommand = "mysql -h $dbHost -P $dbPort -u $dbUser"
if ($dbPass) {
    $mysqlCommand += " -p`"$dbPass`""
}
$mysqlCommand += " $dbName < `"$sqlFile`""

Write-Host "Выполнение SQL-запросов для добавления категорий запчастей..."

try {
    # Выполнение команды
    Invoke-Expression "cmd /c $mysqlCommand"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Категории запчастей успешно добавлены в базу данных." -ForegroundColor Green
    } else {
        Write-Error "Ошибка при выполнении SQL-запросов. Код ошибки: $LASTEXITCODE"
    }
} catch {
    Write-Error "Произошла ошибка при выполнении SQL-запросов: $_"
}

# Проверка результата
Write-Host "Проверка добавленных категорий..."
$checkCommand = "mysql -h $dbHost -P $dbPort -u $dbUser"
if ($dbPass) {
    $checkCommand += " -p`"$dbPass`""
}
$checkCommand += " $dbName -e `"SELECT COUNT(*) AS total_categories FROM part_categories;`""

try {
    Invoke-Expression "cmd /c $checkCommand"
} catch {
    Write-Error "Ошибка при проверке результата: $_"
}

Write-Host "Готово!" -ForegroundColor Green 