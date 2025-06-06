## PowerShell скрипт для выполнения SQL-скрипта категоризации запчастей

# Устанавливаем переменные окружения для подключения к БД
$env:PGPASSWORD = "rinatik17"
$db_host = "127.0.0.1"
$db_port = "5432"
$db_name = "auto_parts_store"
$db_user = "postgres"

Write-Host "Начинаю процесс категоризации запчастей..."

# Проверка текущего состояния категорий запчастей
Write-Host "`nТекущее распределение запчастей по категориям:"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT COUNT(*) as total FROM spare_parts;"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT COUNT(*) as uncategorized FROM spare_parts WHERE category_id IS NULL;"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT COUNT(*) as categorized FROM spare_parts WHERE category_id IS NOT NULL;"

# Запускаем скрипт категоризации
Write-Host "`nЗапускаю скрипт категоризации..."
psql -h $db_host -p $db_port -U $db_user -d $db_name -f run_categorization.sql

# Проверка результатов категоризации
Write-Host "`nРезультаты категоризации:"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT pc.id, pc.name, COUNT(sp.id) as parts_count 
                                                        FROM part_categories pc
                                                        LEFT JOIN spare_parts sp ON pc.id = sp.category_id
                                                        GROUP BY pc.id, pc.name
                                                        ORDER BY pc.id;"
                                                        
Write-Host "`nПроцесс категоризации завершен!" 