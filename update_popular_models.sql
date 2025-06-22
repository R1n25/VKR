-- Сначала сбросим флаги популярности для всех моделей
UPDATE car_models SET is_popular = false;

-- Toyota
UPDATE car_models SET is_popular = true WHERE name = 'Camry' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota');
UPDATE car_models SET is_popular = true WHERE name = 'Corolla' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota');
UPDATE car_models SET is_popular = true WHERE name = 'RAV4' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota');
UPDATE car_models SET is_popular = true WHERE name = 'Land Cruiser' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota');
UPDATE car_models SET is_popular = true WHERE name = 'Camry' AND brand_id = 1822;
UPDATE car_models SET is_popular = true WHERE name = 'Corolla' AND brand_id = 1822;
UPDATE car_models SET is_popular = true WHERE name = 'RAV4' AND brand_id = 1822;
UPDATE car_models SET is_popular = true WHERE name = 'Land Cruiser' AND brand_id = 1822;

-- Honda
UPDATE car_models SET is_popular = true WHERE name = 'Civic' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Honda');
UPDATE car_models SET is_popular = true WHERE name = 'Accord' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Honda');
UPDATE car_models SET is_popular = true WHERE name = 'CR-V' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Honda');
UPDATE car_models SET is_popular = true WHERE name = 'Pilot' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Honda');
UPDATE car_models SET is_popular = true WHERE name = 'Civic' AND brand_id = 1823;
UPDATE car_models SET is_popular = true WHERE name = 'Accord' AND brand_id = 1823;
UPDATE car_models SET is_popular = true WHERE name = 'CR-V' AND brand_id = 1823;
UPDATE car_models SET is_popular = true WHERE name = 'Pilot' AND brand_id = 1823;

-- BMW
UPDATE car_models SET is_popular = true WHERE name = '3 series' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW');
UPDATE car_models SET is_popular = true WHERE name = '5 series' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW');
UPDATE car_models SET is_popular = true WHERE name = 'X5' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW');
UPDATE car_models SET is_popular = true WHERE name = 'X6' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW');
UPDATE car_models SET is_popular = true WHERE name = '3 series' AND brand_id = 1824;
UPDATE car_models SET is_popular = true WHERE name = '5 series' AND brand_id = 1824;
UPDATE car_models SET is_popular = true WHERE name = 'X5' AND brand_id = 1824;
UPDATE car_models SET is_popular = true WHERE name = 'X6' AND brand_id = 1824;

-- Mercedes-Benz
UPDATE car_models SET is_popular = true WHERE name = 'E-Class' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mercedes-Benz');
UPDATE car_models SET is_popular = true WHERE name = 'C-Class' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mercedes-Benz');
UPDATE car_models SET is_popular = true WHERE name = 'S-Class' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mercedes-Benz');
UPDATE car_models SET is_popular = true WHERE name = 'GLE' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mercedes-Benz');
UPDATE car_models SET is_popular = true WHERE name = 'E-Class' AND brand_id = 1825;
UPDATE car_models SET is_popular = true WHERE name = 'C-Class' AND brand_id = 1825;
UPDATE car_models SET is_popular = true WHERE name = 'S-Class' AND brand_id = 1825;
UPDATE car_models SET is_popular = true WHERE name = 'GLE' AND brand_id = 1825;

-- Kia
UPDATE car_models SET is_popular = true WHERE name = 'Sportage' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia');
UPDATE car_models SET is_popular = true WHERE name = 'Rio' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia');
UPDATE car_models SET is_popular = true WHERE name = 'Sorento' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia');
UPDATE car_models SET is_popular = true WHERE name = 'Ceed' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia');
UPDATE car_models SET is_popular = true WHERE name = 'Sportage' AND brand_id = 1877;
UPDATE car_models SET is_popular = true WHERE name = 'Rio' AND brand_id = 1877;
UPDATE car_models SET is_popular = true WHERE name = 'Sorento' AND brand_id = 1877;
UPDATE car_models SET is_popular = true WHERE name = 'Ceed' AND brand_id = 1877;

-- Hyundai
UPDATE car_models SET is_popular = true WHERE name = 'Solaris' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai');
UPDATE car_models SET is_popular = true WHERE name = 'Tucson' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai');
UPDATE car_models SET is_popular = true WHERE name = 'Santa Fe' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai');
UPDATE car_models SET is_popular = true WHERE name = 'Creta' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai');
UPDATE car_models SET is_popular = true WHERE name = 'Solaris' AND brand_id = 1867;
UPDATE car_models SET is_popular = true WHERE name = 'Tucson' AND brand_id = 1867;
UPDATE car_models SET is_popular = true WHERE name = 'Santa Fe' AND brand_id = 1867;
UPDATE car_models SET is_popular = true WHERE name = 'Creta' AND brand_id = 1867;

-- Audi
UPDATE car_models SET is_popular = true WHERE name = 'A6' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Audi');
UPDATE car_models SET is_popular = true WHERE name = 'A7' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Audi');
UPDATE car_models SET is_popular = true WHERE name = 'Q5' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Audi');
UPDATE car_models SET is_popular = true WHERE name = 'Q7' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Audi');
UPDATE car_models SET is_popular = true WHERE name = 'A6' AND brand_id = 1829;
UPDATE car_models SET is_popular = true WHERE name = 'A7' AND brand_id = 1829;
UPDATE car_models SET is_popular = true WHERE name = 'Q5' AND brand_id = 1829;
UPDATE car_models SET is_popular = true WHERE name = 'Q7' AND brand_id = 1829; 