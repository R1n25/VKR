-- Скрипт для категоризации оставшихся запчастей (фаза 3)

-- Распределение по производителю
-- Запчасти от производителя KNECHT/MAHLE - обычно фильтры
UPDATE spare_parts
SET category_id = 13
WHERE category_id IS NULL AND manufacturer IN ('KNECHT', 'MAHLE');

-- Запчасти от производителей свечей
UPDATE spare_parts
SET category_id = 6
WHERE category_id IS NULL AND manufacturer IN ('NGK', 'DENSO', 'CHAMPION', 'BOSCH');

-- Запчасти от производителей тормозных систем
UPDATE spare_parts
SET category_id = 3
WHERE category_id IS NULL AND manufacturer IN ('BREMBO', 'FERODO', 'ATE', 'TRW');

-- Запчасти от производителей амортизаторов и подвески
UPDATE spare_parts
SET category_id = 4
WHERE category_id IS NULL AND manufacturer IN ('KYB', 'MONROE', 'SACHS', 'BILSTEIN');

-- Определение категории по названию производителя или специализации
UPDATE spare_parts
SET category_id = 6 -- Электрооборудование
WHERE category_id IS NULL AND manufacturer IN ('HELLA', 'VALEO', 'BERU', 'VARTA');

UPDATE spare_parts
SET category_id = 10 -- Кузовные детали
WHERE category_id IS NULL AND manufacturer IN ('3M', 'NOVOL', 'BODY', 'KERRY');

-- Распределение по наиболее вероятным категориям на основе общих ключевых слов

-- Все "комплекты", "наборы", "жидкости" отнесем к аксессуарам
UPDATE spare_parts
SET category_id = 15
WHERE category_id IS NULL AND (
    name ILIKE '%комплект%' OR 
    name ILIKE '%набор%' OR
    name ILIKE '%жидкость%'
);

-- Все запчасти с номерами в названии, скорее всего относятся к двигателю или трансмиссии
UPDATE spare_parts
SET category_id = 1
WHERE category_id IS NULL AND (
    name ~ '[0-9]{3,}'
);

-- Запчасти, связанные с подшипниками - сложно однозначно определить категорию
-- Распределим их между подвеской и трансмиссией
UPDATE spare_parts
SET category_id = 4
WHERE category_id IS NULL AND (
    name ILIKE '%подшипник%' OR
    name ILIKE '%ступица%'
);

-- Распределение деталей системы зажигания 
UPDATE spare_parts
SET category_id = 6
WHERE category_id IS NULL AND (
    name ILIKE '%зажиган%' OR 
    name ILIKE '%высоковольт%' OR
    name ILIKE '%проводк%'
);

-- Детали крепления
UPDATE spare_parts
SET category_id = 15
WHERE category_id IS NULL AND (
    name ILIKE '%болт%' OR
    name ILIKE '%гайка%' OR
    name ILIKE '%винт%' OR
    name ILIKE '%кронштейн%' OR
    name ILIKE '%хомут%'
);

-- Распределение оставшихся запчастей по умолчанию в категорию аксессуаров
UPDATE spare_parts
SET category_id = 15
WHERE category_id IS NULL;

-- Проверяем количество распределенных деталей по категориям
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

-- Проверяем окончательное количество нераспределенных деталей
SELECT COUNT(*) FROM spare_parts WHERE category_id IS NULL; 