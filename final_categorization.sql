-- Финальный скрипт для категоризации оставшихся запчастей

-- Категоризация на основе паттернов в артикулах запчастей

-- Фильтры (обычно начинаются с F, AF, OF, HC, WP)
UPDATE spare_parts
SET category_id = 13
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'F[0-9]%' OR
    part_number SIMILAR TO 'AF[0-9]%' OR
    part_number SIMILAR TO 'OF[0-9]%' OR
    part_number SIMILAR TO 'HC[0-9]%' OR
    part_number SIMILAR TO 'WP[0-9]%' OR
    part_number SIMILAR TO 'FLK%' OR
    part_number SIMILAR TO 'FP%'
);

-- Тормозная система (обычно артикулы начинаются с B, BP, PF, PD)
UPDATE spare_parts
SET category_id = 3
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'B[0-9]%' OR
    part_number SIMILAR TO 'BP[0-9]%' OR
    part_number SIMILAR TO 'PF[0-9]%' OR
    part_number SIMILAR TO 'PD[0-9]%' OR
    part_number SIMILAR TO 'BK[0-9]%' OR
    part_number SIMILAR TO 'TC%' OR
    part_number SIMILAR TO 'BC%'
);

-- Подвеска и амортизаторы (обычно артикулы начинаются с S, SA, SB, KYB)
UPDATE spare_parts
SET category_id = 4
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'S[0-9]%' OR
    part_number SIMILAR TO 'SA[0-9]%' OR
    part_number SIMILAR TO 'SB[0-9]%' OR
    part_number SIMILAR TO 'KYB%' OR
    part_number SIMILAR TO 'ST%' OR
    part_number SIMILAR TO 'SH%'
);

-- Электрооборудование (обычно артикулы начинаются с E, EB, ER, A, AC)
UPDATE spare_parts
SET category_id = 6
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'E[0-9]%' OR
    part_number SIMILAR TO 'EB[0-9]%' OR
    part_number SIMILAR TO 'ER[0-9]%' OR
    part_number SIMILAR TO 'A[0-9]%' OR
    part_number SIMILAR TO 'AC[0-9]%' OR
    part_number SIMILAR TO 'SP%' OR
    part_number SIMILAR TO 'EL%' OR
    part_number SIMILAR TO 'SM%'
);

-- Двигатель (обычно артикулы начинаются с D, CB, P, PI)
UPDATE spare_parts
SET category_id = 1
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'D[0-9]%' OR
    part_number SIMILAR TO 'CB[0-9]%' OR
    part_number SIMILAR TO 'P[0-9]%' OR
    part_number SIMILAR TO 'PI[0-9]%' OR
    part_number SIMILAR TO 'EN%' OR
    part_number SIMILAR TO 'OB%'
);

-- Рулевое управление (обычно артикулы начинаются с PS, SR, TRE)
UPDATE spare_parts
SET category_id = 5
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'PS[0-9]%' OR
    part_number SIMILAR TO 'SR[0-9]%' OR
    part_number SIMILAR TO 'TRE[0-9]%' OR
    part_number SIMILAR TO 'ST[0-9]%'
);

-- Система охлаждения (обычно артикулы начинаются с C, CR, WP)
UPDATE spare_parts
SET category_id = 7
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'C[0-9]%' OR
    part_number SIMILAR TO 'CR[0-9]%' OR
    part_number SIMILAR TO 'CL[0-9]%' OR
    part_number SIMILAR TO 'WP[0-9]%' OR
    part_number SIMILAR TO 'TH%' OR
    part_number SIMILAR TO 'RAD%'
);

-- Система выпуска (обычно артикулы начинаются с EX, MF, ES)
UPDATE spare_parts
SET category_id = 9
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'EX[0-9]%' OR
    part_number SIMILAR TO 'MF[0-9]%' OR
    part_number SIMILAR TO 'ES[0-9]%' OR
    part_number SIMILAR TO 'M[0-9]%' OR
    part_number SIMILAR TO 'CAT%'
);

-- Топливная система (обычно артикулы начинаются с FP, FS, INJ)
UPDATE spare_parts
SET category_id = 8
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'FP[0-9]%' OR
    part_number SIMILAR TO 'FS[0-9]%' OR
    part_number SIMILAR TO 'INJ[0-9]%' OR
    part_number SIMILAR TO 'FL[0-9]%'
);

-- Кузовные детали (обычно артикулы начинаются с BN, BM, HD)
UPDATE spare_parts
SET category_id = 10
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'BN[0-9]%' OR
    part_number SIMILAR TO 'BM[0-9]%' OR
    part_number SIMILAR TO 'HD[0-9]%' OR
    part_number SIMILAR TO 'BU[0-9]%' OR
    part_number SIMILAR TO 'FB%'
);

-- Оптика и зеркала (обычно артикулы начинаются с LA, LM, HD, LT)
UPDATE spare_parts
SET category_id = 11
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'LA[0-9]%' OR
    part_number SIMILAR TO 'LM[0-9]%' OR
    part_number SIMILAR TO 'HD[0-9]%' OR
    part_number SIMILAR TO 'LT[0-9]%' OR
    part_number SIMILAR TO 'HL%'
);

-- Салон (обычно артикулы начинаются с IS, INT, CH)
UPDATE spare_parts
SET category_id = 12
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'IS[0-9]%' OR
    part_number SIMILAR TO 'INT[0-9]%' OR
    part_number SIMILAR TO 'CH[0-9]%' OR
    part_number SIMILAR TO 'SC%'
);

-- Прокладки и уплотнители (обычно артикулы начинаются с G, GS, SE)
UPDATE spare_parts
SET category_id = 14
WHERE category_id = 15 AND (
    part_number SIMILAR TO 'G[0-9]%' OR
    part_number SIMILAR TO 'GS[0-9]%' OR
    part_number SIMILAR TO 'SE[0-9]%' OR
    part_number SIMILAR TO 'SI%'
);

-- Категоризация по популярным производителям, у которых есть четкая специализация

-- Топливная система
UPDATE spare_parts
SET category_id = 8
WHERE category_id = 15 AND manufacturer IN ('WALBRO', 'DELPHI', 'ACDELCO', 'BOSCH');

-- Система охлаждения
UPDATE spare_parts
SET category_id = 7
WHERE category_id = 15 AND manufacturer IN ('NISSENS', 'DENSO', 'BEHR');

-- Тормозная система
UPDATE spare_parts
SET category_id = 3
WHERE category_id = 15 AND manufacturer IN ('REMSA', 'BENDIX', 'TEXTAR', 'NIBK');

-- Двигатель
UPDATE spare_parts
SET category_id = 1
WHERE category_id = 15 AND manufacturer IN ('MAHLE', 'KOLBENSCHMIDT', 'GLYCO', 'GOETZE', 'AJUSA');

-- Электрооборудование
UPDATE spare_parts
SET category_id = 6
WHERE category_id = 15 AND manufacturer IN ('MOBILETRON', 'BERU', 'STANDARD', 'VARTA', 'BREMI');

-- Подвеска
UPDATE spare_parts
SET category_id = 4
WHERE category_id = 15 AND manufacturer IN ('MOOG', 'DELPHI', 'SIDEM', 'QH');

-- Рулевое управление
UPDATE spare_parts
SET category_id = 5
WHERE category_id = 15 AND manufacturer IN ('FENOX', 'LEMFORDER', 'OCAP');

-- Кузовные детали
UPDATE spare_parts
SET category_id = 10
WHERE category_id = 15 AND manufacturer IN ('GORDON', 'BESF1TS', 'FPS');

-- Оптика
UPDATE spare_parts
SET category_id = 11
WHERE category_id = 15 AND manufacturer IN ('DEPO', 'KOITO', 'VALEO');

-- Анализ по ключевым словам в названии, которые могут указывать на конкретную категорию
-- но не были учтены ранее

-- Тормозная система
UPDATE spare_parts
SET category_id = 3
WHERE category_id = 15 AND (
    name ILIKE '%тормоз%' OR 
    name ILIKE '%brake%' OR
    name ILIKE '%колод%' OR
    name ILIKE '%диск тор%' OR
    name ILIKE '%ABS%' OR
    name ILIKE '%тормозной диск%' OR
    name ILIKE '%abs%' OR
    name ILIKE '%тормозная жидкость%'
);

-- Двигатель
UPDATE spare_parts
SET category_id = 1
WHERE category_id = 15 AND (
    name ILIKE '%двигател%' OR 
    name ILIKE '%двс%' OR
    name ILIKE '%мотор%' OR
    name ILIKE '%коленвал%' OR
    name ILIKE '%поршень%' OR
    name ILIKE '%гбц%' OR
    name ILIKE '%распредвал%' OR
    name ILIKE '%клапан%' OR
    name ILIKE '%масл%'
);

-- Трансмиссия
UPDATE spare_parts
SET category_id = 2
WHERE category_id = 15 AND (
    name ILIKE '%трансмисс%' OR 
    name ILIKE '%коробка%' OR
    name ILIKE '%кпп%' OR
    name ILIKE '%акпп%' OR
    name ILIKE '%сцеплен%' OR
    name ILIKE '%мкпп%' OR
    name ILIKE '%дифференциал%'
);

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