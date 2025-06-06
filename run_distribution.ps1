## PowerShell скрипт для выполнения распределения запчастей из категории "Аксессуары"

# Устанавливаем переменные окружения для подключения к БД
$env:PGPASSWORD = "rinatik17"
$db_host = "127.0.0.1"
$db_port = "5432"
$db_name = "auto_parts_store"
$db_user = "postgres"

Write-Host "Начинаю процесс распределения запчастей из категории 'Аксессуары'..."

# Проверка текущего состояния категорий запчастей
Write-Host "`nТекущее распределение запчастей по категориям:"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT pc.id, pc.name, COUNT(sp.id) as parts_count 
                                                         FROM part_categories pc
                                                         LEFT JOIN spare_parts sp ON pc.id = sp.category_id
                                                         GROUP BY pc.id, pc.name
                                                         ORDER BY parts_count DESC;"

# Запускаем скрипт распределения запчастей из категории "Аксессуары"
Write-Host "`nЗапускаю скрипт распределения запчастей из категории 'Аксессуары'..."
psql -h $db_host -p $db_port -U $db_user -d $db_name -f distribute_accessories.sql

# Проверка результатов распределения
Write-Host "`nРезультаты распределения запчастей по категориям:"
psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT pc.id, pc.name, COUNT(sp.id) as parts_count 
                                                         FROM part_categories pc
                                                         LEFT JOIN spare_parts sp ON pc.id = sp.category_id
                                                         GROUP BY pc.id, pc.name
                                                         ORDER BY parts_count DESC;"
                                                         
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
                                                        
Write-Host "`nПроцесс распределения запчастей завершен!" 