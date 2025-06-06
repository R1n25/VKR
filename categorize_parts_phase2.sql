-- Скрипт для категоризации оставшихся запчастей (фаза 2)

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

-- Дополнительные ключевые слова для категории "Подвеска" (id=4)
UPDATE spare_parts
SET category_id = 4
WHERE category_id IS NULL AND (
    name ILIKE '%балка%' OR
    name ILIKE '%втулк%' OR
    name ILIKE '%рессор%' OR
    name ILIKE '%шасси%' OR
    name ILIKE '%сход развал%' OR
    name ILIKE '%поворотный%' OR
    name ILIKE '%подрамник%' OR
    name ILIKE '%амортизационн%' OR
    name ILIKE '%поперечн%' OR
    name ILIKE '%продольн%' OR
    name ILIKE '%резинка стабил%' OR
    name ILIKE '%резинка подвес%'
);

-- Дополнительные ключевые слова для категории "Рулевое управление" (id=5)
UPDATE spare_parts
SET category_id = 5
WHERE category_id IS NULL AND (
    name ILIKE '%гидроусилитель%' OR
    name ILIKE '%насос гур%' OR
    name ILIKE '%бачок гур%' OR
    name ILIKE '%шкив руле%' OR
    name ILIKE '%шестерня руле%' OR
    name ILIKE '%электроусилитель руля%' OR
    name ILIKE '%крестовина%' OR
    name ILIKE '%рулевой механизм%' OR
    name ILIKE '%рулевой вал%'
);

-- Дополнительные ключевые слова для категории "Электрооборудование" (id=6)
UPDATE spare_parts
SET category_id = 6
WHERE category_id IS NULL AND (
    name ILIKE '%свеч%' OR
    name ILIKE '%блок предохранителей%' OR
    name ILIKE '%датчик%' OR
    name ILIKE '%лампа%' OR
    name ILIKE '%контроллер%' OR
    name ILIKE '%выключатель%' OR
    name ILIKE '%клемм%' OR
    name ILIKE '%розетк%' OR
    name ILIKE '%панель приборов%' OR
    name ILIKE '%бортовой компьютер%' OR
    name ILIKE '%ECU%' OR
    name ILIKE '%коммутатор%' OR
    name ILIKE '%сигнал%' OR
    name ILIKE '%антенн%' OR
    name ILIKE '%магнитол%' OR
    name ILIKE '%регулятор напряж%' OR
    name ILIKE '%катушка зажигания%'
);

-- Дополнительные ключевые слова для категории "Система охлаждения" (id=7)
UPDATE spare_parts
SET category_id = 7
WHERE category_id IS NULL AND (
    name ILIKE '%помпа%' OR
    name ILIKE '%диффузор%' OR
    name ILIKE '%насос водяной%' OR
    name ILIKE '%крыльчатка вентилятор%' OR
    name ILIKE '%муфта вентилятор%' OR
    name ILIKE '%охладитель масл%' OR
    name ILIKE '%расширительный бач%' OR
    name ILIKE '%термомуфт%' OR
    name ILIKE '%радиатор кондиционер%'
);

-- Дополнительные ключевые слова для категории "Топливная система" (id=8)
UPDATE spare_parts
SET category_id = 8
WHERE category_id IS NULL AND (
    name ILIKE '%топливопровод%' OR
    name ILIKE '%топливный датчик%' OR
    name ILIKE '%дроссель%' OR
    name ILIKE '%датчик уровня топлива%' OR
    name ILIKE '%бензобак%' OR
    name ILIKE '%трубка топлив%' OR
    name ILIKE '%шланг топлив%' OR
    name ILIKE '%заливная горловина%' OR
    name ILIKE '%регулятор давления топлив%'
);

-- Дополнительные ключевые слова для категории "Система выпуска" (id=9)
UPDATE spare_parts
SET category_id = 9
WHERE category_id IS NULL AND (
    name ILIKE '%выхлопная труба%' OR
    name ILIKE '%приемная труба%' OR
    name ILIKE '%выхлопная система%' OR
    name ILIKE '%крепление глушител%' OR
    name ILIKE '%прокладка выпускн%' OR
    name ILIKE '%хомут глушител%' OR
    name ILIKE '%лямбда%' OR
    name ILIKE '%кислородный датчик%' OR
    name ILIKE '%сажевый фильтр%'
);

-- Дополнительные ключевые слова для категории "Кузовные детали" (id=10)
UPDATE spare_parts
SET category_id = 10
WHERE category_id IS NULL AND (
    name ILIKE '%петля%' OR
    name ILIKE '%ручка двери%' OR
    name ILIKE '%стеклоподъем%' OR
    name ILIKE '%механизм стеклоподъем%' OR
    name ILIKE '%порог%' OR
    name ILIKE '%крепление%' OR
    name ILIKE '%рейлинг%' OR
    name ILIKE '%защита%' OR
    name ILIKE '%дверной замок%' OR
    name ILIKE '%багажник%' OR
    name ILIKE '%мотор стеклоочистител%' OR
    name ILIKE '%щетка стеклоочистител%' OR
    name ILIKE '%зеркало%' OR
    name ILIKE '%капот%' OR
    name ILIKE '%крыло%' OR
    name ILIKE '%бампер%'
);

-- Дополнительные ключевые слова для категории "Оптика и зеркала" (id=11)
UPDATE spare_parts
SET category_id = 11
WHERE category_id IS NULL AND (
    name ILIKE '%зеркало заднего вида%' OR
    name ILIKE '%габарит%' OR
    name ILIKE '%поворотник%' OR
    name ILIKE '%подсветк%' OR
    name ILIKE '%блок-фара%' OR
    name ILIKE '%рассеиватель%' OR
    name ILIKE '%отражатель%' OR
    name ILIKE '%птф%' OR
    name ILIKE '%корпус фары%' OR
    name ILIKE '%поворотная фара%'
);

-- Дополнительные ключевые слова для категории "Салон" (id=12)
UPDATE spare_parts
SET category_id = 12
WHERE category_id IS NULL AND (
    name ILIKE '%ремень безопасности%' OR
    name ILIKE '%накладка салон%' OR
    name ILIKE '%педаль%' OR
    name ILIKE '%карман%' OR
    name ILIKE '%отделк%' OR
    name ILIKE '%заглушка%' OR
    name ILIKE '%часы%' OR
    name ILIKE '%пепельниц%' OR
    name ILIKE '%радио%' OR
    name ILIKE '%динамик%' OR
    name ILIKE '%кондиционер%' OR
    name ILIKE '%обогрев%' OR
    name ILIKE '%вентиляция салон%' OR
    name ILIKE '%потолок%' OR
    name ILIKE '%солнцезащитный козырек%'
);

-- Дополнительные ключевые слова для категории "Фильтры" (id=13)
UPDATE spare_parts
SET category_id = 13
WHERE category_id IS NULL AND (
    name ILIKE '%очистк%' OR
    name ILIKE '%separator%' OR
    name ILIKE '%элемент фильтр%' OR
    name ILIKE '%фильтрующ%'
);

-- Дополнительные ключевые слова для категории "Прокладки и уплотнители" (id=14)
UPDATE spare_parts
SET category_id = 14
WHERE category_id IS NULL AND (
    name ILIKE '%герметик%' OR
    name ILIKE '%кольцо уплотнител%' OR
    name ILIKE '%манжет%' OR
    name ILIKE '%колпачок%' OR
    name ILIKE '%уплотнительное кольцо%' OR
    name ILIKE '%сальник%' OR
    name ILIKE '%прокладка%'
);

-- Дополнительные ключевые слова для категории "Аксессуары" (id=15)
UPDATE spare_parts
SET category_id = 15
WHERE category_id IS NULL AND (
    name ILIKE '%щетка%' OR
    name ILIKE '%набор%' OR
    name ILIKE '%инструмент%' OR
    name ILIKE '%комплект%' OR
    name ILIKE '%жидкость%' OR
    name ILIKE '%масло%' OR
    name ILIKE '%смазка%' OR
    name ILIKE '%герметик%' OR
    name ILIKE '%средство%' OR
    name ILIKE '%знак%' OR
    name ILIKE '%антифриз%' OR
    name ILIKE '%очиститель%' OR
    name ILIKE '%крышка%' OR
    name ILIKE '%жилет%' OR
    name ILIKE '%таблетк%' OR
    name ILIKE '%ароматизатор%'
);

-- Обновление оставшихся запчастей, которые связаны с двигателем и его системами
UPDATE spare_parts
SET category_id = 1
WHERE 
    category_id IS NULL AND (
    manufacturer IN ('KAMAZ', 'MAZ', 'YaMZ', 'VAZ', 'LADA', 'UAZ') OR
    name ILIKE '%двс%' OR
    name ILIKE '%мотор%'
);

-- Запрос для проверки количества нераспределенных деталей
SELECT COUNT(*) FROM spare_parts WHERE category_id IS NULL;

-- Получаем 200 нераспределенных деталей для дальнейшего анализа
SELECT name, part_number, manufacturer 
FROM spare_parts 
WHERE category_id IS NULL 
ORDER BY manufacturer, name
LIMIT 200; 