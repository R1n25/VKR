$server = "localhost"
$database = "auto_parts_store"
$username = "postgres"
$password = "postgres"

$connectionString = "Host=$server;Database=$database;Username=$username;Password=$password"

Write-Host "РџРѕРґРєР»СЋС‡РµРЅРёРµ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С… PostgreSQL..."
try {
    # РџРѕРґРєР»СЋС‡РµРЅРёРµ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
    $env:PGPASSWORD = $password
    
    Write-Host "Р—Р°РїСѓСЃРє РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕР№ РєР°С‚РµРіРѕСЂРёР·Р°С†РёРё РїРѕ РєР»СЋС‡РµРІС‹Рј СЃР»РѕРІР°Рј..."
    
    # Р’С‹РїРѕР»РЅРµРЅРёРµ SQL-СЃРєСЂРёРїС‚Р°
    psql -h $server -U $username -d $database -f "additional_keywords_categorization.sql"
    
    Write-Host "Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ РєР°С‚РµРіРѕСЂРёР·Р°С†РёСЏ Р·Р°РїС‡Р°СЃС‚РµР№ РїРѕ РєР»СЋС‡РµРІС‹Рј СЃР»РѕРІР°Рј СѓСЃРїРµС€РЅРѕ РІС‹РїРѕР»РЅРµРЅР°!"
    
} catch {
    Write-Host "РћС€РёР±РєР° РїСЂРё РІС‹РїРѕР»РЅРµРЅРёРё SQL-СЃРєСЂРёРїС‚Р°: $_"
    exit 1
} finally {
    $env:PGPASSWORD = ""
}

Write-Host "РџСЂРѕС†РµСЃСЃ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕР№ РєР°С‚РµРіРѕСЂРёР·Р°С†РёРё Р·Р°РІРµСЂС€РµРЅ." 
