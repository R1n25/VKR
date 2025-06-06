-- Основной скрипт для распределения запчастей по категориям

-- Фаза 1: Основная категоризация по ключевым словам

-- Обновление запчастей для категории "Двигатель" (id=1)
UPDATE spare_parts
SET category_id = 1
WHERE category_id IS NULL AND (
    name ILIKE '%двигател%' OR
    name ILIKE '%блок цилиндр%' OR
    name ILIKE '%поршн%' OR 
    name ILIKE '%коленвал%' OR
    name ILIKE '%распредвал%' OR
    name ILIKE '%клапан%' OR
    name ILIKE '%ГБЦ%' OR
    name ILIKE '%поддон%' OR
    name ILIKE '%маховик%' OR
    name ILIKE '%грм%' OR
    name ILIKE '%ГРМ%' OR
    name ILIKE '%цепь%' OR
    name ILIKE '%натяжител%' OR
    name ILIKE '%шатун%' OR
    name ILIKE '%впуск%' OR
    name ILIKE '%форсунк%' OR
    name ILIKE '%подшипник коленвал%' OR
    name ILIKE '%масляный насос%'
);

-- Обновление запчастей для категории "Трансмиссия" (id=2)
UPDATE spare_parts
SET category_id = 2
WHERE category_id IS NULL AND (
    name ILIKE '%трансмисси%' OR
    name ILIKE '%коробк%' OR
    name ILIKE '%КПП%' OR
    name ILIKE '%сцеплен%' OR
    name ILIKE '%кардан%' OR
    name ILIKE '%диск сцеплен%' OR
    name ILIKE '%корзин%' OR
    name ILIKE '%выжимной%' OR
    name ILIKE '%АКПП%' OR
    name ILIKE '%подшипник выжимной%' OR
    name ILIKE '%сателлит%' OR
    name ILIKE '%раздаточн%' OR
    name ILIKE '%привод колес%'
);

-- Обновление запчастей для категории "Тормозная система" (id=3)
UPDATE spare_parts
SET category_id = 3
WHERE category_id IS NULL AND (
    name ILIKE '%тормоз%' OR
    name ILIKE '%колодк%' OR
    name ILIKE '%диск тормоз%' OR
    name ILIKE '%суппорт%' OR
    name ILIKE '%тормозн% цилиндр%' OR
    name ILIKE '%шланг тормоз%' OR
    name ILIKE '%барабан%' OR
    name ILIKE '%ABS%' OR
    name ILIKE '%трос ручника%' OR
    name ILIKE '%тормозн% шланг%'
);

-- Обновление запчастей для категории "Подвеска" (id=4)
UPDATE spare_parts
SET category_id = 4
WHERE category_id IS NULL AND (
    name ILIKE '%подвеск%' OR
    name ILIKE '%аморт%' OR
    name ILIKE '%пружин%' OR
    name ILIKE '%рычаг%' OR
    name ILIKE '%стабил%' OR
    name ILIKE '%тяга%' OR
    name ILIKE '%сайлентблок%' OR
    name ILIKE '%стойк%' OR
    name ILIKE '%шаров%' OR
    name ILIKE '%опор%' OR
    name ILIKE '%кулак%' OR
    name ILIKE '%ступиц%'
);

-- Обновление запчастей для категории "Рулевое управление" (id=5)
UPDATE spare_parts
SET category_id = 5
WHERE category_id IS NULL AND (
    name ILIKE '%руле%' OR
    name ILIKE '%ГУР%' OR
    name ILIKE '%насос гидро%' OR
    name ILIKE '%рейк%' OR
    name ILIKE '%тяга рулев%' OR
    name ILIKE '%наконечник руле%' OR
    name ILIKE '%рулевая колонк%'
);

-- Обновление запчастей для категории "Электрооборудование" (id=6)
UPDATE spare_parts
SET category_id = 6
WHERE category_id IS NULL AND (
    name ILIKE '%электр%' OR
    name ILIKE '%генератор%' OR
    name ILIKE '%стартер%' OR
    name ILIKE '%аккумулятор%' OR
    name ILIKE '%блок управлени%' OR
    name ILIKE '%датчик%' OR
    name ILIKE '%лампоч%' OR
    name ILIKE '%фара%' OR
    name ILIKE '%фонар%' OR
    name ILIKE '%провод%' OR
    name ILIKE '%проводк%' OR
    name ILIKE '%реле%' OR
    name ILIKE '%предохранит%' OR
    name ILIKE '%инжектор%' OR
    name ILIKE '%электронн%'
);

-- Обновление запчастей для категории "Система охлаждения" (id=7)
UPDATE spare_parts
SET category_id = 7
WHERE category_id IS NULL AND (
    name ILIKE '%охлажден%' OR
    name ILIKE '%радиатор%' OR
    name ILIKE '%термостат%' OR
    name ILIKE '%патрубок%' OR
    name ILIKE '%водян% насос%' OR
    name ILIKE '%насос охлаж%' OR
    name ILIKE '%вентилятор%' OR
    name ILIKE '%расширительн%' OR
    name ILIKE '%антифриз%'
);

-- Обновление запчастей для категории "Топливная система" (id=8)
UPDATE spare_parts
SET category_id = 8
WHERE category_id IS NULL AND (
    name ILIKE '%топлив%' OR
    name ILIKE '%бензонасос%' OR
    name ILIKE '%ТНВД%' OR
    name ILIKE '%форсун%' OR
    name ILIKE '%бак%' OR
    name ILIKE '%карбюра%' OR
    name ILIKE '%инжектор%' OR
    name ILIKE '%фильтр топлив%'
);

-- Обновление запчастей для категории "Система выпуска" (id=9)
UPDATE spare_parts
SET category_id = 9
WHERE category_id IS NULL AND (
    name ILIKE '%выпуск%' OR
    name ILIKE '%глушител%' OR
    name ILIKE '%катализатор%' OR
    name ILIKE '%выхлоп%' OR
    name ILIKE '%коллектор выпуск%' OR
    name ILIKE '%резонатор%'
);

-- Обновление запчастей для категории "Кузовные детали" (id=10)
UPDATE spare_parts
SET category_id = 10
WHERE category_id IS NULL AND (
    name ILIKE '%кузов%' OR
    name ILIKE '%капот%' OR
    name ILIKE '%крыло%' OR
    name ILIKE '%бампер%' OR
    name ILIKE '%дверь%' OR
    name ILIKE '%крышка%' OR
    name ILIKE '%решетк%' OR
    name ILIKE '%панель%' OR
    name ILIKE '%стекло%' OR
    name ILIKE '%усилител%' OR
    name ILIKE '%замок%' OR
    name ILIKE '%молдинг%' OR
    name ILIKE '%лобовое%' OR
    name ILIKE '%боковое стекло%' OR
    name ILIKE '%крыша%'
);

-- Обновление запчастей для категории "Оптика и зеркала" (id=11)
UPDATE spare_parts
SET category_id = 11
WHERE category_id IS NULL AND (
    name ILIKE '%фар%' OR
    name ILIKE '%зеркало%' OR
    name ILIKE '%фонар%' OR
    name ILIKE '%оптик%' OR
    name ILIKE '%лампа%' OR
    name ILIKE '%противотуман%' OR
    name ILIKE '%поворотник%' OR
    name ILIKE '%стекло фар%'
);

-- Обновление запчастей для категории "Салон" (id=12)
UPDATE spare_parts
SET category_id = 12
WHERE category_id IS NULL AND (
    name ILIKE '%салон%' OR
    name ILIKE '%сиден%' OR
    name ILIKE '%торпед%' OR
    name ILIKE '%руль%' OR
    name ILIKE '%обивк%' OR
    name ILIKE '%консоль%' OR
    name ILIKE '%ковр%' OR
    name ILIKE '%приборн%' OR
    name ILIKE '%щиток%' OR
    name ILIKE '%дверн% карт%' OR
    name ILIKE '%бардачок%' OR
    name ILIKE '%климат%' OR
    name ILIKE '%печк%'
);

-- Обновление запчастей для категории "Фильтры" (id=13)
UPDATE spare_parts
SET category_id = 13
WHERE category_id IS NULL AND (
    name ILIKE '%фильтр%' OR
    name ILIKE '%воздушный фильтр%' OR
    name ILIKE '%салонный фильтр%' OR
    name ILIKE '%топливный фильтр%' OR
    name ILIKE '%масляный фильтр%'
);

-- Обновление запчастей для категории "Прокладки и уплотнители" (id=14)
UPDATE spare_parts
SET category_id = 14
WHERE category_id IS NULL AND (
    name ILIKE '%прокладк%' OR
    name ILIKE '%уплотнит%' OR
    name ILIKE '%сальник%' OR
    name ILIKE '%прокладка гбц%' OR
    name ILIKE '%прокладка клапанн%'
);

-- Обновление запчастей для категории "Аксессуары" (id=15)
UPDATE spare_parts
SET category_id = 15
WHERE category_id IS NULL AND (
    name ILIKE '%аксессуар%' OR
    name ILIKE '%коврик%' OR
    name ILIKE '%брызговик%' OR
    name ILIKE '%чехол%' OR
    name ILIKE '%накладк%' OR
    name ILIKE '%дефлектор%' OR
    name ILIKE '%подлокотник%' OR
    name ILIKE '%держатель%' OR
    name ILIKE '%автомобильн% знак%'
);

-- Добавление оставшихся запчастей в категорию КПП (id=16)
UPDATE spare_parts
SET category_id = 16
WHERE category_id IS NULL AND (
    name ILIKE '%КПП%' OR
    name ILIKE '%коробка пере%' OR
    name ILIKE '%АКПП%' OR
    name ILIKE '%МКПП%' OR
    name ILIKE '%вариатор%' OR
    name ILIKE '%робот%'
);

-- Проверяем количество категоризированных и некатегоризированных запчастей после фазы 1
SELECT 'После фазы 1' as phase, 
       COUNT(*) as total_parts, 
       COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as categorized, 
       COUNT(CASE WHEN category_id IS NULL THEN 1 END) as uncategorized 
FROM spare_parts;

-- Фаза 2: Дополнительные ключевые слова для категоризации

-- Дополнительные ключевые слова для категории "Двигатель" (id=1)
UPDATE spare_parts
SET category_id = 1
WHERE category_id IS NULL AND (
    name ILIKE '%вкладыш%' OR
    name ILIKE '%прокладка двигател%' OR
    name ILIKE '%масляная система%' OR
    name ILIKE '%коллектор впуск%' OR
    name ILIKE '%вентиляция картер%' OR
    name ILIKE '%турбин%' OR
    name ILIKE '%турбо%' OR
    name ILIKE '%компрессор%' OR
    name ILIKE '%гильз%' OR
    name ILIKE '%впускной клапан%' OR
    name ILIKE '%выпускной клапан%' OR
    name ILIKE '%масляный щуп%' OR
    name ILIKE '%масляный радиатор%' OR
    name ILIKE '%датчик давления масла%'
);

-- Дополнительные ключевые слова для категории "Трансмиссия" (id=2)
UPDATE spare_parts
SET category_id = 2
WHERE category_id IS NULL AND (
    name ILIKE '%дифференциал%' OR
    name ILIKE '%шрус%' OR
    name ILIKE '%полуось%' OR
    name ILIKE '%шестерн%' OR
    name ILIKE '%подшипник ступицы%' OR
    name ILIKE '%шарнир%' OR
    name ILIKE '%синхронизатор%' OR
    name ILIKE '%привод спидометр%' OR
    name ILIKE '%вилка сцепления%' OR
    name ILIKE '%трос сцепления%' OR
    name ILIKE '%масло трансмиссион%' OR
    name ILIKE '%герметик коробк%'
);

-- Дополнительные ключевые слова для категории "Тормозная система" (id=3)
UPDATE spare_parts
SET category_id = 3
WHERE category_id IS NULL AND (
    name ILIKE '%тормозная жидкость%' OR
    name ILIKE '%ABS%' OR
    name ILIKE '%ступица тормозная%' OR
    name ILIKE '%регулятор тормоз%' OR
    name ILIKE '%троси%' OR
    name ILIKE '%педаль тормоз%' OR
    name ILIKE '%цилиндр%' OR
    name ILIKE '%вакуумный усилитель%'
);

-- Проверяем количество категоризированных и некатегоризированных запчастей после фазы 2
SELECT 'После фазы 2' as phase, 
       COUNT(*) as total_parts, 
       COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as categorized, 
       COUNT(CASE WHEN category_id IS NULL THEN 1 END) as uncategorized 
FROM spare_parts;

-- Фаза 3: Распределение по производителю и другим признакам

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

-- Финальная проверка распределения запчастей по категориям
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