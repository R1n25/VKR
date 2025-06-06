-- Очистка таблицы категорий (если нужно)
-- TRUNCATE TABLE part_categories;

-- Добавление основных категорий
INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Двигатель', 'dvigatel', 'Запчасти для двигателя автомобиля', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Трансмиссия', 'transmissiya', 'Запчасти для трансмиссии автомобиля', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Подвеска', 'podveska', 'Запчасти для подвески автомобиля', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Рулевое управление', 'rulevoe-upravlenie', 'Запчасти для рулевого управления', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Тормозная система', 'tormoznaya-sistema', 'Запчасти для тормозной системы', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Электрооборудование', 'elektrooborudovanie', 'Электрические компоненты автомобиля', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Кузовные детали', 'kuzovnye-detali', 'Запчасти для кузова автомобиля', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Салон', 'salon', 'Запчасти для салона автомобиля', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Расходные материалы', 'rashodnye-materialy', 'Расходные материалы для обслуживания', NOW(), NOW());

INSERT INTO part_categories (name, slug, description, created_at, updated_at) VALUES
('Аксессуары', 'aksessuary', 'Автомобильные аксессуары', NOW(), NOW());

-- Подкатегории для Двигателя
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Блок цилиндров', 'blok-cilindrov', 'Блоки цилиндров и комплектующие', 
 (SELECT id FROM part_categories WHERE slug = 'dvigatel'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Головка блока цилиндров', 'golovka-bloka-cilindrov', 'ГБЦ и комплектующие', 
 (SELECT id FROM part_categories WHERE slug = 'dvigatel'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Поршневая группа', 'porshnevaya-gruppa', 'Поршни, кольца, пальцы', 
 (SELECT id FROM part_categories WHERE slug = 'dvigatel'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Система смазки', 'sistema-smazki', 'Масляные насосы, фильтры, радиаторы', 
 (SELECT id FROM part_categories WHERE slug = 'dvigatel'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Система охлаждения', 'sistema-ohlazhdeniya', 'Радиаторы, термостаты, помпы', 
 (SELECT id FROM part_categories WHERE slug = 'dvigatel'), NOW(), NOW());

-- Подкатегории для Трансмиссии
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Сцепление', 'sceplenie', 'Корзины, диски, выжимные подшипники', 
 (SELECT id FROM part_categories WHERE slug = 'transmissiya'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Коробка передач', 'korobka-peredach', 'Запчасти для МКПП и АКПП', 
 (SELECT id FROM part_categories WHERE slug = 'transmissiya'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Карданная передача', 'kardannaya-peredacha', 'Карданные валы и крестовины', 
 (SELECT id FROM part_categories WHERE slug = 'transmissiya'), NOW(), NOW());

-- Подкатегории для Подвески
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Передняя подвеска', 'perednyaya-podveska', 'Амортизаторы, пружины, рычаги', 
 (SELECT id FROM part_categories WHERE slug = 'podveska'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Задняя подвеска', 'zadnyaya-podveska', 'Амортизаторы, пружины, рычаги', 
 (SELECT id FROM part_categories WHERE slug = 'podveska'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Ступицы и подшипники', 'stupicy-i-podshipniki', 'Ступичные узлы и подшипники', 
 (SELECT id FROM part_categories WHERE slug = 'podveska'), NOW(), NOW());

-- Подкатегории для Рулевого управления
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Рулевые механизмы', 'rulevye-mehanizmy', 'Рулевые рейки, редукторы', 
 (SELECT id FROM part_categories WHERE slug = 'rulevoe-upravlenie'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Рулевые тяги', 'rulevye-tyagi', 'Рулевые тяги и наконечники', 
 (SELECT id FROM part_categories WHERE slug = 'rulevoe-upravlenie'), NOW(), NOW());

-- Подкатегории для Тормозной системы
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Тормозные диски', 'tormoznye-diski', 'Передние и задние тормозные диски', 
 (SELECT id FROM part_categories WHERE slug = 'tormoznaya-sistema'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Тормозные колодки', 'tormoznye-kolodki', 'Передние и задние тормозные колодки', 
 (SELECT id FROM part_categories WHERE slug = 'tormoznaya-sistema'), NOW(), NOW());

-- Подкатегории для Электрооборудования
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Система зажигания', 'sistema-zazhiganiya', 'Свечи, катушки, провода зажигания', 
 (SELECT id FROM part_categories WHERE slug = 'elektrooborudovanie'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Генераторы и стартеры', 'generatory-i-startery', 'Генераторы, стартеры и комплектующие', 
 (SELECT id FROM part_categories WHERE slug = 'elektrooborudovanie'), NOW(), NOW());

-- Подкатегории для Кузовных деталей
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Капот и крылья', 'kapot-i-krylya', 'Капоты, крылья, бамперы', 
 (SELECT id FROM part_categories WHERE slug = 'kuzovnye-detali'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Двери', 'dveri', 'Двери и комплектующие', 
 (SELECT id FROM part_categories WHERE slug = 'kuzovnye-detali'), NOW(), NOW());

-- Подкатегории для Салона
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Сиденья', 'sidenya', 'Сиденья и комплектующие', 
 (SELECT id FROM part_categories WHERE slug = 'salon'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Панель приборов', 'panel-priborov', 'Панели приборов и накладки', 
 (SELECT id FROM part_categories WHERE slug = 'salon'), NOW(), NOW());

-- Подкатегории для Расходных материалов
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Масла и жидкости', 'masla-i-zhidkosti', 'Моторные масла, трансмиссионные масла, тормозные жидкости', 
 (SELECT id FROM part_categories WHERE slug = 'rashodnye-materialy'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Фильтры', 'filtry', 'Масляные, воздушные, топливные, салонные фильтры', 
 (SELECT id FROM part_categories WHERE slug = 'rashodnye-materialy'), NOW(), NOW());

-- Подкатегории для Аксессуаров
INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Коврики', 'kovriki', 'Салонные и багажные коврики', 
 (SELECT id FROM part_categories WHERE slug = 'aksessuary'), NOW(), NOW());

INSERT INTO part_categories (name, slug, description, parent_id, created_at, updated_at) VALUES
('Чехлы', 'chehly', 'Чехлы для сидений', 
 (SELECT id FROM part_categories WHERE slug = 'aksessuary'), NOW(), NOW()); 