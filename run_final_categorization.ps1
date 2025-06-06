## PowerShell скрипт для выполнения финальной категоризации запчастей

# Устанавливаем переменные окружения для подключения к БД
$env:PGPASSWORD = "rinatik17"
$db_host = "127.0.0.1"
$db_port = "5432"
$db_name = "auto_parts_store"
$db_user = "postgres"

Write-Host "Начинаю процесс финальной категоризации запчастей..."

# Проверка текущего состояния категорий запчастей
Write-Host "`nТекущее распределение запчастей по категориям:"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT pc.id, pc.name, COUNT(sp.id) as parts_count 
                                                        FROM part_categories pc
                                                        LEFT JOIN spare_parts sp ON pc.id = sp.category_id
                                                        GROUP BY pc.id, pc.name
                                                        ORDER BY pc.id;"

# Запускаем скрипт финальной категоризации
Write-Host "`nЗапускаю скрипт финальной категоризации..."
psql -h $db_host -p $db_port -U $db_user -d $db_name -f final_categorization.sql

# Проверка результатов категоризации
Write-Host "`nРезультаты финальной категоризации:"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT pc.id, pc.name, COUNT(sp.id) as parts_count 
                                                        FROM part_categories pc
                                                        LEFT JOIN spare_parts sp ON pc.id = sp.category_id
                                                        GROUP BY pc.id, pc.name
                                                        ORDER BY pc.id;"
                                                        
Write-Host "`nРаспределение запчастей завершено!"

# Создаем таблицу статистики категоризации
Write-Host "`nПроцент запчастей в каждой категории:"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT 
                                                        pc.id,
                                                        pc.name, 
                                                        COUNT(sp.id) as parts_count,
                                                        ROUND(COUNT(sp.id)::numeric / (SELECT COUNT(*) FROM spare_parts)::numeric * 100, 2) as percentage
                                                        FROM 
                                                        part_categories pc
                                                        LEFT JOIN 
                                                        spare_parts sp ON pc.id = sp.category_id
                                                        GROUP BY 
                                                        pc.id, pc.name
                                                        ORDER BY 
                                                        parts_count DESC;" 