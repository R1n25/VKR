-- Скрипт для более детальной категоризации запчастей, которые попали в категорию "Аксессуары"

-- Создаем временную таблицу с запчастями в категории "Аксессуары"
CREATE TEMPORARY TABLE temp_accessories AS
SELECT * FROM spare_parts WHERE category_id = 15;

-- Сбрасываем категорию для всех запчастей в категории "Аксессуары"
UPDATE spare_parts SET category_id = NULL WHERE category_id = 15;

-- Категория "Двигатель" (id=1)
UPDATE spare_parts
SET category_id = 1
WHERE category_id IS NULL AND (
    name ILIKE '%двигат%' OR
    name ILIKE '%бензин%' OR
    name ILIKE '%дизел%' OR
    name ILIKE '%порш%' OR
    name ILIKE '%свеч%' OR
    name ILIKE '%масл%' OR
    name ILIKE '%газ%' OR
    name ILIKE '%цилиндр%' OR
    name ILIKE '%помп%' OR
    name ILIKE '%крышк%' OR
    name ILIKE '%мотор%' OR
    name ILIKE '%кольц%' OR
    name ILIKE '%болт%' OR
    name ILIKE '%шпильк%' OR
    name ILIKE '%колпач%' OR
    name ILIKE '%прокладк%' OR
    name ILIKE '%шайб%' OR
    name ILIKE '%горловин%' OR
    name ILIKE '%клапан%' OR
    name ILIKE '%ремен%'
);

-- Категория "Трансмиссия" (id=2)
UPDATE spare_parts
SET category_id = 2
WHERE category_id IS NULL AND (
    name ILIKE '%трансмисс%' OR
    name ILIKE '%коробк%' OR
    name ILIKE '%кпп%' OR
    name ILIKE '%сцепл%' OR
    name ILIKE '%шестерн%' OR
    name ILIKE '%редукт%' OR
    name ILIKE '%диск%' OR
    name ILIKE '%фрикцион%' OR
    name ILIKE '%кардан%' OR
    name ILIKE '%дифференциал%' OR
    name ILIKE '%полуос%' OR
    name ILIKE '%шрус%' OR
    name ILIKE '%передач%'
);

-- Категория "Тормозная система" (id=3)
UPDATE spare_parts
SET category_id = 3
WHERE category_id IS NULL AND (
    name ILIKE '%тормоз%' OR
    name ILIKE '%колодк%' OR
    name ILIKE '%суппорт%' OR
    name ILIKE '%abs%' OR
    name ILIKE '%барабан%' OR
    name ILIKE '%шланг%' OR
    name ILIKE '%диск%' OR
    name ILIKE '%гидравлич%' OR
    name ILIKE '%тормозн%' OR
    name ILIKE '%мph%' OR
    name ILIKE '%тц%'
);

-- Категория "Подвеска" (id=4)
UPDATE spare_parts
SET category_id = 4
WHERE category_id IS NULL AND (
    name ILIKE '%подвеск%' OR
    name ILIKE '%аморт%' OR
    name ILIKE '%пружин%' OR
    name ILIKE '%стойк%' OR
    name ILIKE '%стабил%' OR
    name ILIKE '%втулк%' OR
    name ILIKE '%сайлентбл%' OR
    name ILIKE '%рычаг%' OR
    name ILIKE '%шаров%' OR
    name ILIKE '%тяг%' OR
    name ILIKE '%опор%' OR
    name ILIKE '%болт%' OR
    name ILIKE '%гайк%' OR
    name ILIKE '%подшипник%' OR
    name ILIKE '%ступиц%' OR
    name ILIKE '%балк%' OR
    name ILIKE '%растяжк%'
);

-- Категория "Рулевое управление" (id=5)
UPDATE spare_parts
SET category_id = 5
WHERE category_id IS NULL AND (
    name ILIKE '%руле%' OR
    name ILIKE '%рулевое%' OR
    name ILIKE '%рулевая%' OR
    name ILIKE '%гидроусил%' OR
    name ILIKE '%наконеч%' OR
    name ILIKE '%тяга%' OR
    name ILIKE '%рейка%' OR
    name ILIKE '%редуктор%' OR
    name ILIKE '%насос ГУР%' OR
    name ILIKE '%гур%' OR
    name ILIKE '%эур%' OR
    name ILIKE '%электроусил%'
);

-- Категория "Электрооборудование" (id=6)
UPDATE spare_parts
SET category_id = 6
WHERE category_id IS NULL AND (
    name ILIKE '%электр%' OR
    name ILIKE '%акб%' OR
    name ILIKE '%генератор%' OR
    name ILIKE '%стартер%' OR
    name ILIKE '%датчик%' OR
    name ILIKE '%реле%' OR
    name ILIKE '%выключ%' OR
    name ILIKE '%предохран%' OR
    name ILIKE '%блок предохран%' OR
    name ILIKE '%провод%' OR
    name ILIKE '%проводк%' OR
    name ILIKE '%свеч%' OR
    name ILIKE '%лампа%' OR
    name ILIKE '%свет%' OR
    name ILIKE '%фонарь%'
);

-- Категория "Система охлаждения" (id=7)
UPDATE spare_parts
SET category_id = 7
WHERE category_id IS NULL AND (
    name ILIKE '%радиатор%' OR
    name ILIKE '%охлаж%' OR
    name ILIKE '%помпа%' OR
    name ILIKE '%термостат%' OR
    name ILIKE '%вентилятор%' OR
    name ILIKE '%патрубок%' OR
    name ILIKE '%бачок%' OR
    name ILIKE '%расширител%' OR
    name ILIKE '%антифриз%' OR
    name ILIKE '%кондиционер%' OR
    name ILIKE '%водяной%'
);

-- Категория "Топливная система" (id=8)
UPDATE spare_parts
SET category_id = 8
WHERE category_id IS NULL AND (
    name ILIKE '%топлив%' OR
    name ILIKE '%бензобак%' OR
    name ILIKE '%бак%' OR
    name ILIKE '%насос%' OR
    name ILIKE '%форсунк%' OR
    name ILIKE '%карбюратор%' OR
    name ILIKE '%инжектор%' OR
    name ILIKE '%бензонасос%' OR
    name ILIKE '%дизел%' OR
    name ILIKE '%заслонк%' OR
    name ILIKE '%дроссель%' OR
    name ILIKE '%трубк%'
);

-- Категория "Система выпуска" (id=9)
UPDATE spare_parts
SET category_id = 9
WHERE category_id IS NULL AND (
    name ILIKE '%выпуск%' OR
    name ILIKE '%катализатор%' OR
    name ILIKE '%глушител%' OR
    name ILIKE '%труба%' OR
    name ILIKE '%выхлоп%' OR
    name ILIKE '%резонатор%'
);

-- Категория "Кузовные детали" (id=10)
UPDATE spare_parts
SET category_id = 10
WHERE category_id IS NULL AND (
    name ILIKE '%крыл%' OR
    name ILIKE '%капот%' OR
    name ILIKE '%дверь%' OR
    name ILIKE '%багажник%' OR
    name ILIKE '%бампер%' OR
    name ILIKE '%решетк%' OR
    name ILIKE '%молдинг%' OR
    name ILIKE '%панель%' OR
    name ILIKE '%порог%' OR
    name ILIKE '%домкрат%' OR
    name ILIKE '%крыш%' OR
    name ILIKE '%ручк%' OR
    name ILIKE '%петл%' OR
    name ILIKE '%привод%'
);

-- Категория "Оптика и зеркала" (id=11)
UPDATE spare_parts
SET category_id = 11
WHERE category_id IS NULL AND (
    name ILIKE '%фара%' OR
    name ILIKE '%фонарь%' OR
    name ILIKE '%зеркал%' OR
    name ILIKE '%лампа%' OR
    name ILIKE '%противотум%' OR
    name ILIKE '%фонарь%' OR
    name ILIKE '%подсветк%' OR
    name ILIKE '%осветит%' OR
    name ILIKE '%поворот%' OR
    name ILIKE '%оптика%'
);

-- Категория "Салон" (id=12)
UPDATE spare_parts
SET category_id = 12
WHERE category_id IS NULL AND (
    name ILIKE '%сидень%' OR
    name ILIKE '%чехол%' OR
    name ILIKE '%руль%' OR
    name ILIKE '%панель%' OR
    name ILIKE '%торпед%' OR
    name ILIKE '%ковер%' OR
    name ILIKE '%ручк%' OR
    name ILIKE '%педал%' OR
    name ILIKE '%консоль%' OR
    name ILIKE '%стеклоподъем%' OR
    name ILIKE '%перчат%' OR
    name ILIKE '%обивк%' OR
    name ILIKE '%накладк%'
);

-- Категория "Фильтры" (id=13)
UPDATE spare_parts
SET category_id = 13
WHERE category_id IS NULL AND (
    name ILIKE '%фильтр%' OR
    name ILIKE '%очист%' OR
    name ILIKE '%воздушн%' OR
    name ILIKE '%масля%' OR
    name ILIKE '%топливн%' OR
    name ILIKE '%салон%'
);

-- Категория "Прокладки и уплотнители" (id=14)
UPDATE spare_parts
SET category_id = 14
WHERE category_id IS NULL AND (
    name ILIKE '%прокладк%' OR
    name ILIKE '%уплотнит%' OR
    name ILIKE '%сальник%' OR
    name ILIKE '%манжет%' OR
    name ILIKE '%кольц%' OR
    name ILIKE '%герметик%' OR
    name ILIKE '%изоля%' OR
    name ILIKE '%заглуш%'
);

-- Распределение по производителю
UPDATE spare_parts
SET category_id = 13 -- Фильтры
WHERE category_id IS NULL AND manufacturer IN ('GOODWILL', 'MANN', 'WIX', 'FILTRON', 'SCT', 'NAKAYAMA');

UPDATE spare_parts
SET category_id = 3 -- Тормозная система
WHERE category_id IS NULL AND manufacturer IN ('ABE', 'ABS', 'ADVICS', 'MANDO', 'ADR', 'A.B.S');

UPDATE spare_parts
SET category_id = 4 -- Подвеска
WHERE category_id IS NULL AND manufacturer IN ('BTA', 'CTR', 'FEBEST');

UPDATE spare_parts
SET category_id = 11 -- Оптика
WHERE category_id IS NULL AND manufacturer IN ('FK', 'DEPO');

UPDATE spare_parts
SET category_id = 5 -- Рулевое
WHERE category_id IS NULL AND manufacturer IN ('RTS', 'OPTIMAL');

UPDATE spare_parts
SET category_id = 6 -- Электрооборудование
WHERE category_id IS NULL AND manufacturer IN ('TESLA', 'KRAFT', 'MASUMA');

UPDATE spare_parts
SET category_id = 1 -- Двигатель
WHERE category_id IS NULL AND manufacturer IN ('MOBIS', 'HONDA', 'TOYOTA', 'MAZDA', 'NISSAN', 'GMB', 'MITSUBISHI');

-- Возвращаем в категорию "Аксессуары" то, что не распределилось
UPDATE spare_parts
SET category_id = 15
WHERE category_id IS NULL;

-- Проверяем финальное распределение
SELECT 
    pc.id,
    pc.name, 
    COUNT(sp.id) as parts_count 
FROM 
    part_categories pc
LEFT JOIN 
    spare_parts sp ON pc.id = sp.category_id
GROUP BY 
    pc.id, pc.name
ORDER BY 
    pc.id; 