-- Очистка таблицы категорий (если нужно)
-- TRUNCATE TABLE part_categories;

-- Добавление основных категорий
INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Двигатель', 'dvigatel', 'Запчасти для двигателя автомобиля', NOW(), NOW()),
('Трансмиссия', 'transmissiya', 'Запчасти для трансмиссии автомобиля', NOW(), NOW()),
('Подвеска', 'podveska', 'Запчасти для подвески автомобиля', NOW(), NOW()),
('Рулевое управление', 'rulevoe-upravlenie', 'Запчасти для рулевого управления', NOW(), NOW()),
('Тормозная система', 'tormoznaya-sistema', 'Запчасти для тормозной системы', NOW(), NOW()),
('Электрооборудование', 'elektrooborudovanie', 'Электрические компоненты автомобиля', NOW(), NOW()),
('Кузовные детали', 'kuzovnye-detali', 'Запчасти для кузова автомобиля', NOW(), NOW()),
('Салон', 'salon', 'Запчасти для салона автомобиля', NOW(), NOW()),
('Расходные материалы', 'rashodnye-materialy', 'Расходные материалы для обслуживания', NOW(), NOW()),
('Аксессуары', 'aksessuary', 'Автомобильные аксессуары', NOW(), NOW());

-- Получаем ID основных категорий для создания подкатегорий
SET @dvigatel_id = (SELECT id FROM part_categories WHERE slug = 'dvigatel');
SET @transmissiya_id = (SELECT id FROM part_categories WHERE slug = 'transmissiya');
SET @podveska_id = (SELECT id FROM part_categories WHERE slug = 'podveska');
SET @rulevoe_id = (SELECT id FROM part_categories WHERE slug = 'rulevoe-upravlenie');
SET @tormoznaya_id = (SELECT id FROM part_categories WHERE slug = 'tormoznaya-sistema');
SET @elektro_id = (SELECT id FROM part_categories WHERE slug = 'elektrooborudovanie');
SET @kuzov_id = (SELECT id FROM part_categories WHERE slug = 'kuzovnye-detali');
SET @salon_id = (SELECT id FROM part_categories WHERE slug = 'salon');
SET @rashodnye_id = (SELECT id FROM part_categories WHERE slug = 'rashodnye-materialy');
SET @aksessuary_id = (SELECT id FROM part_categories WHERE slug = 'aksessuary');

-- Подкатегории для Двигателя
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Блок цилиндров', 'blok-cilindrov', 'Блоки цилиндров и комплектующие', @dvigatel_id, NOW(), NOW()),
('Головка блока цилиндров', 'golovka-bloka-cilindrov', 'ГБЦ и комплектующие', @dvigatel_id, NOW(), NOW()),
('Поршневая группа', 'porshnevaya-gruppa', 'Поршни, кольца, пальцы', @dvigatel_id, NOW(), NOW()),
('Система смазки', 'sistema-smazki', 'Масляные насосы, фильтры, радиаторы', @dvigatel_id, NOW(), NOW()),
('Система охлаждения', 'sistema-ohlazhdeniya', 'Радиаторы, термостаты, помпы', @dvigatel_id, NOW(), NOW()),
('Система питания', 'sistema-pitaniya', 'Топливные насосы, форсунки, фильтры', @dvigatel_id, NOW(), NOW()),
('Система выпуска', 'sistema-vypuska', 'Глушители, катализаторы, резонаторы', @dvigatel_id, NOW(), NOW());

-- Подкатегории для Трансмиссии
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Сцепление', 'sceplenie', 'Корзины, диски, выжимные подшипники', @transmissiya_id, NOW(), NOW()),
('Коробка передач', 'korobka-peredach', 'Запчасти для МКПП и АКПП', @transmissiya_id, NOW(), NOW()),
('Карданная передача', 'kardannaya-peredacha', 'Карданные валы и крестовины', @transmissiya_id, NOW(), NOW()),
('Главная передача', 'glavnaya-peredacha', 'Редукторы, дифференциалы', @transmissiya_id, NOW(), NOW()),
('Приводы колес', 'privody-koles', 'ШРУСы, полуоси, пыльники', @transmissiya_id, NOW(), NOW());

-- Подкатегории для Подвески
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Передняя подвеска', 'perednyaya-podveska', 'Амортизаторы, пружины, рычаги', @podveska_id, NOW(), NOW()),
('Задняя подвеска', 'zadnyaya-podveska', 'Амортизаторы, пружины, рычаги', @podveska_id, NOW(), NOW()),
('Ступицы и подшипники', 'stupicy-i-podshipniki', 'Ступичные узлы и подшипники', @podveska_id, NOW(), NOW()),
('Стабилизаторы', 'stabilizatory', 'Стабилизаторы поперечной устойчивости', @podveska_id, NOW(), NOW());

-- Подкатегории для Рулевого управления
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Рулевые механизмы', 'rulevye-mehanizmy', 'Рулевые рейки, редукторы', @rulevoe_id, NOW(), NOW()),
('Рулевые тяги', 'rulevye-tyagi', 'Рулевые тяги и наконечники', @rulevoe_id, NOW(), NOW()),
('Насосы ГУР', 'nasosy-gur', 'Насосы гидроусилителя руля', @rulevoe_id, NOW(), NOW());

-- Подкатегории для Тормозной системы
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Тормозные диски', 'tormoznye-diski', 'Передние и задние тормозные диски', @tormoznaya_id, NOW(), NOW()),
('Тормозные колодки', 'tormoznye-kolodki', 'Передние и задние тормозные колодки', @tormoznaya_id, NOW(), NOW()),
('Тормозные суппорты', 'tormoznye-supporty', 'Тормозные суппорты и ремкомплекты', @tormoznaya_id, NOW(), NOW()),
('Тормозные цилиндры', 'tormoznye-cilindry', 'Главные и рабочие тормозные цилиндры', @tormoznaya_id, NOW(), NOW()),
('Тормозные шланги', 'tormoznye-shlangi', 'Тормозные шланги и трубки', @tormoznaya_id, NOW(), NOW());

-- Подкатегории для Электрооборудования
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Система зажигания', 'sistema-zazhiganiya', 'Свечи, катушки, провода зажигания', @elektro_id, NOW(), NOW()),
('Генераторы и стартеры', 'generatory-i-startery', 'Генераторы, стартеры и комплектующие', @elektro_id, NOW(), NOW()),
('Аккумуляторы', 'akkumulyatory', 'Аккумуляторные батареи', @elektro_id, NOW(), NOW()),
('Освещение', 'osveschenie', 'Фары, фонари, лампы', @elektro_id, NOW(), NOW()),
('Датчики', 'datchiki', 'Различные датчики автомобиля', @elektro_id, NOW(), NOW());

-- Подкатегории для Кузовных деталей
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Капот и крылья', 'kapot-i-krylya', 'Капоты, крылья, бамперы', @kuzov_id, NOW(), NOW()),
('Двери', 'dveri', 'Двери и комплектующие', @kuzov_id, NOW(), NOW()),
('Стекла', 'stekla', 'Лобовые, боковые и задние стекла', @kuzov_id, NOW(), NOW()),
('Зеркала', 'zerkala', 'Зеркала заднего вида', @kuzov_id, NOW(), NOW()),
('Оптика', 'optika', 'Фары, фонари, поворотники', @kuzov_id, NOW(), NOW());

-- Подкатегории для Салона
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Сиденья', 'sidenya', 'Сиденья и комплектующие', @salon_id, NOW(), NOW()),
('Панель приборов', 'panel-priborov', 'Панели приборов и накладки', @salon_id, NOW(), NOW()),
('Климат-контроль', 'klimat-kontrol', 'Компоненты системы отопления и кондиционирования', @salon_id, NOW(), NOW()),
('Мультимедиа', 'multimedia', 'Аудиосистемы, навигация, мультимедиа', @salon_id, NOW(), NOW());

-- Подкатегории для Расходных материалов
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Масла и жидкости', 'masla-i-zhidkosti', 'Моторные масла, трансмиссионные масла, тормозные жидкости', @rashodnye_id, NOW(), NOW()),
('Фильтры', 'filtry', 'Масляные, воздушные, топливные, салонные фильтры', @rashodnye_id, NOW(), NOW()),
('Щетки стеклоочистителя', 'schetki-stekloochistitelya', 'Дворники для лобового и заднего стекла', @rashodnye_id, NOW(), NOW());

-- Подкатегории для Аксессуаров
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Коврики', 'kovriki', 'Салонные и багажные коврики', @aksessuary_id, NOW(), NOW()),
('Чехлы', 'chehly', 'Чехлы для сидений', @aksessuary_id, NOW(), NOW()),
('Дефлекторы', 'deflektory', 'Дефлекторы окон и капота', @aksessuary_id, NOW(), NOW()),
('Брызговики', 'bryzgoviki', 'Брызговики для колесных арок', @aksessuary_id, NOW(), NOW()); 