-- SQL-скрипт для более равномерного распределения запчастей из категории "Аксессуары"

-- 1. Распределение по наличию ключевых терминов в названиях запчастей

-- Двигатель (id=1)
UPDATE spare_parts
SET category_id = 1
WHERE category_id = 15 AND (
    name ILIKE '%двига%' OR
    name ILIKE '%мотор%' OR
    name ILIKE '%масл%' OR
    name ILIKE '%цилиндр%' OR
    name ILIKE '%поршн%' OR
    name ILIKE '%колен%' OR
    name ILIKE '%вклад%' OR
    name ILIKE '%кольц%' OR
    name ILIKE '%гбц%' OR
    name ILIKE '%клапан%' OR
    name ILIKE '%грм%' OR
    name ILIKE '%свеч%' OR
    name ILIKE '%зажигани%' OR
    name ILIKE '%волк%' OR
    name ILIKE '%патрубок%' OR
    name ILIKE '%проклад%' OR
    name ILIKE '%крышк%'
);

-- Трансмиссия (id=2)
UPDATE spare_parts
SET category_id = 2
WHERE category_id = 15 AND (
    name ILIKE '%трансмис%' OR
    name ILIKE '%кпп%' OR
    name ILIKE '%акпп%' OR
    name ILIKE '%мкпп%' OR
    name ILIKE '%сцепл%' OR
    name ILIKE '%шестерн%' OR
    name ILIKE '%передача%'
);

-- Рулевое управление (id=5)
UPDATE spare_parts
SET category_id = 5
WHERE category_id = 15 AND (
    name ILIKE '%руль%' OR
    name ILIKE '%рулевой%' OR
    name ILIKE '%руле%' OR
    name ILIKE '%гур%' OR
    name ILIKE '%гидроусил%' OR
    name ILIKE '%рейка%' OR
    name ILIKE '%тяга%' OR
    name ILIKE '%наконечник%' OR
    name ILIKE '%шаров%' OR
    name ILIKE '%подшипник%'
);

-- Система охлаждения (id=7)
UPDATE spare_parts
SET category_id = 7
WHERE category_id = 15 AND (
    name ILIKE '%охлажд%' OR
    name ILIKE '%радиатор%' OR
    name ILIKE '%термостат%' OR
    name ILIKE '%вентил%' OR
    name ILIKE '%кондиц%' OR
    name ILIKE '%патруб%' OR
    name ILIKE '%шланг%' OR
    name ILIKE '%антифриз%' OR
    name ILIKE '%помпа%'
);

-- Топливная система (id=8)
UPDATE spare_parts
SET category_id = 8
WHERE category_id = 15 AND (
    name ILIKE '%топлив%' OR
    name ILIKE '%бензин%' OR
    name ILIKE '%бак%' OR
    name ILIKE '%насос%' OR
    name ILIKE '%форсун%' OR
    name ILIKE '%инжект%' OR
    name ILIKE '%карбюра%'
);

-- Система выпуска (id=9)
UPDATE spare_parts
SET category_id = 9
WHERE category_id = 15 AND (
    name ILIKE '%выпуск%' OR
    name ILIKE '%выхлоп%' OR
    name ILIKE '%глушит%' OR
    name ILIKE '%резона%' OR
    name ILIKE '%катализат%'
);

-- Кузовные детали (id=10)
UPDATE spare_parts
SET category_id = 10
WHERE category_id = 15 AND (
    name ILIKE '%кузов%' OR
    name ILIKE '%бампер%' OR
    name ILIKE '%крыло%' OR
    name ILIKE '%капот%' OR
    name ILIKE '%дверь%' OR
    name ILIKE '%крышка%' OR
    name ILIKE '%багаж%' OR
    name ILIKE '%стекло%' OR
    name ILIKE '%зеркал%' OR
    name ILIKE '%ручка%'
);

-- Оптика и зеркала (id=11)
UPDATE spare_parts
SET category_id = 11
WHERE category_id = 15 AND (
    name ILIKE '%фар%' OR
    name ILIKE '%фонарь%' OR
    name ILIKE '%свет%' OR
    name ILIKE '%лампа%' OR
    name ILIKE '%оптик%' OR
    name ILIKE '%зеркал%' OR
    name ILIKE '%лампочк%'
);

-- Салон (id=12)
UPDATE spare_parts
SET category_id = 12
WHERE category_id = 15 AND (
    name ILIKE '%салон%' OR
    name ILIKE '%сидень%' OR
    name ILIKE '%кресло%' OR
    name ILIKE '%чехол%' OR
    name ILIKE '%накидк%' OR
    name ILIKE '%кондицион%' OR
    name ILIKE '%отопи%' OR
    name ILIKE '%печк%' OR
    name ILIKE '%панель%' OR
    name ILIKE '%торпед%' OR
    name ILIKE '%ручка%' OR
    name ILIKE '%кнопк%'
);

-- Фильтры (id=13)
UPDATE spare_parts
SET category_id = 13
WHERE category_id = 15 AND (
    name ILIKE '%фильтр%' OR
    name ILIKE '%очист%'
);

-- Прокладки и уплотнители (id=14)
UPDATE spare_parts
SET category_id = 14
WHERE category_id = 15 AND (
    name ILIKE '%проклад%' OR
    name ILIKE '%уплотн%' OR
    name ILIKE '%сальник%' OR
    name ILIKE '%герметик%'
);

-- 2. Дополнительное распределение на основе артикулов

-- Распределение на основе артикулов для всех категорий
UPDATE spare_parts
SET category_id = 1 -- Двигатель
WHERE category_id = 15 AND part_number SIMILAR TO '[a-zA-Z]*0[0-9]{3}[0-9]*'; -- Артикулы, начинающиеся с нуля

UPDATE spare_parts
SET category_id = 3 -- Тормозная система
WHERE category_id = 15 AND part_number SIMILAR TO '[a-zA-Z]*1[0-9]{3}[0-9]*'; -- Артикулы, начинающиеся с 1

UPDATE spare_parts
SET category_id = 4 -- Подвеска
WHERE category_id = 15 AND part_number SIMILAR TO '[a-zA-Z]*2[0-9]{3}[0-9]*'; -- Артикулы, начинающиеся с 2

UPDATE spare_parts
SET category_id = 5 -- Рулевое управление
WHERE category_id = 15 AND part_number SIMILAR TO '[a-zA-Z]*3[0-9]{3}[0-9]*'; -- Артикулы, начинающиеся с 3

UPDATE spare_parts
SET category_id = 6 -- Электрооборудование
WHERE category_id = 15 AND part_number SIMILAR TO '[a-zA-Z]*4[0-9]{3}[0-9]*'; -- Артикулы, начинающиеся с 4

UPDATE spare_parts
SET category_id = 7 -- Система охлаждения
WHERE category_id = 15 AND part_number SIMILAR TO '[a-zA-Z]*5[0-9]{3}[0-9]*'; -- Артикулы, начинающиеся с 5

-- 3. Распределение по производителю запчастей

UPDATE spare_parts
SET category_id = 1 -- Двигатель
WHERE category_id = 15 AND manufacturer IN ('TOYOTA', 'HONDA', 'MITSUBISHI', 'MAZDA', 'NISSAN', 'HYUNDAI', 'KIA', 'SUBARU');

UPDATE spare_parts
SET category_id = 6 -- Электрооборудование
WHERE category_id = 15 AND manufacturer IN ('BOSCH', 'VARTA', 'DENSO', 'FEBI', 'GATES');

-- Оставляем 1000 запчастей в категории аксессуаров, остальные распределяем по двигателю, электрике и подвеске

-- Получаем общее число запчастей, оставшихся в категории аксессуаров
CREATE OR REPLACE FUNCTION redistribute_accessories() RETURNS void AS $$
DECLARE
    accessories_count INTEGER;
    excess_count INTEGER;
    third INTEGER;
BEGIN
    -- Получаем количество запчастей в категории "Аксессуары"
    SELECT COUNT(*) INTO accessories_count FROM spare_parts WHERE category_id = 15;
    
    -- Рассчитываем избыток запчастей, которые нужно распределить
    IF accessories_count > 1000 THEN
        excess_count := accessories_count - 1000;
        third := excess_count / 3;
        
        -- Распределяем первую треть в двигатель
        WITH to_move AS (
            SELECT id FROM spare_parts 
            WHERE category_id = 15
            ORDER BY RANDOM()
            LIMIT third
        )
        UPDATE spare_parts 
        SET category_id = 1
        WHERE id IN (SELECT id FROM to_move);
        
        -- Распределяем вторую треть в электрику
        WITH to_move AS (
            SELECT id FROM spare_parts 
            WHERE category_id = 15
            ORDER BY RANDOM()
            LIMIT third
        )
        UPDATE spare_parts 
        SET category_id = 6
        WHERE id IN (SELECT id FROM to_move);
        
        -- Распределяем третью треть в подвеску
        WITH to_move AS (
            SELECT id FROM spare_parts 
            WHERE category_id = 15
            ORDER BY RANDOM()
            LIMIT third
        )
        UPDATE spare_parts 
        SET category_id = 4
        WHERE id IN (SELECT id FROM to_move);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Вызываем функцию для распределения избыточных аксессуаров
SELECT redistribute_accessories();

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