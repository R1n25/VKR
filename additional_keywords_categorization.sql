-- Скрипт для дополнительной категоризации на основе предоставленных ключевых слов

-- Обновление запчастей для категории "Двигатель" (id=1)
UPDATE spare_parts
SET category_id = 1
WHERE category_id IS NULL AND (
    name ILIKE '%вкладыш%' OR
    name ILIKE '%коренной%' OR
    name ILIKE '%шатунный%' OR
    name ILIKE '%шатун%' OR
    name ILIKE '%гильза%' OR
    name ILIKE '%поршень%'
);

-- Обновление запчастей для категории "Трансмиссия" (id=2)
UPDATE spare_parts
SET category_id = 2
WHERE category_id IS NULL AND (
    name ILIKE '%сцепления%' OR
    name ILIKE '%выжимной%' OR
    name ILIKE '%цилиндр сцепления%'
);

-- Обновление запчастей для категории "Тормозная система" (id=3)
UPDATE spare_parts
SET category_id = 3
WHERE category_id IS NULL AND (
    name ILIKE '%тормозной%' OR
    name ILIKE '%колодки%' OR
    name ILIKE '%колодка%' OR
    name ILIKE '%суппорт%' OR
    name ILIKE '%суппорта%'
);

-- Обновление запчастей для категории "Подвеска" (id=4)
UPDATE spare_parts
SET category_id = 4
WHERE category_id IS NULL AND (
    name ILIKE '%амортизатор%' OR
    name ILIKE '%стойка%' OR
    name ILIKE '%пружины%' OR
    name ILIKE '%стабилизатора%'
);

-- Обновление запчастей для категории "Рулевое управление" (id=5)
UPDATE spare_parts
SET category_id = 5
WHERE category_id IS NULL AND (
    name ILIKE '%рулевая гидроусилителя%' OR
    name ILIKE '%тяга%' OR
    name ILIKE '%наконечник%' OR
    name ILIKE '%гур%'
);

-- Обновление запчастей для категории "Система охлаждения" (id=7)
UPDATE spare_parts
SET category_id = 7
WHERE category_id IS NULL AND (
    name ILIKE '%радиатор%' OR
    name ILIKE '%термостат%' OR
    name ILIKE '%расширительный бачок%' OR
    name ILIKE '%помпа%'
);

-- Обновление запчастей для категории "Топливная система" (id=8)
UPDATE spare_parts
SET category_id = 8
WHERE category_id IS NULL AND (
    name ILIKE '%топливная%' OR
    name ILIKE '%форсунка%' OR
    name ILIKE '%насос топливный%' OR
    name ILIKE '%бак%' OR
    name ILIKE '%погружной%'
);

-- Обновление запчастей для категории "Система выпуска" (id=9)
UPDATE spare_parts
SET category_id = 9
WHERE category_id IS NULL AND (
    name ILIKE '%глушитель%' OR
    name ILIKE '%катализатор%' OR
    name ILIKE '%выпуск%' OR
    name ILIKE '%впуск%'
);

-- Обновление запчастей для категории "Фильтры" (id=13)
UPDATE spare_parts
SET category_id = 13
WHERE category_id IS NULL AND (
    name ILIKE '%фильтр%' OR
    name ILIKE '%фильтры%' OR
    name ILIKE '%пылевой%' OR
    name ILIKE '%воздушный%' OR
    name ILIKE '%масляный%'
);

-- Вывод статистики по категоризации
SELECT 
    pc.name AS "Категория", 
    COUNT(sp.id) AS "Количество запчастей",
    ROUND(COUNT(sp.id) * 100.0 / (SELECT COUNT(*) FROM spare_parts), 2) AS "Процент"
FROM 
    part_categories pc
LEFT JOIN 
    spare_parts sp ON pc.id = sp.category_id
GROUP BY 
    pc.id, pc.name
ORDER BY 
    "Количество запчастей" DESC;

-- Подсчет оставшихся некатегоризированных запчастей
SELECT 
    'Без категории' AS "Категория", 
    COUNT(*) AS "Количество запчастей",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM spare_parts), 2) AS "Процент"
FROM 
    spare_parts
WHERE 
    category_id IS NULL; 