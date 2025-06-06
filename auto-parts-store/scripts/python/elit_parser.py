#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Парсер данных с сайта elit.ro для получения информации о брендах, моделях и двигателях автомобилей.
Использует Playwright для взаимодействия с динамическим содержимым сайта.
"""

import os
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Union, Any

from playwright.sync_api import sync_playwright, Page, Browser
from bs4 import BeautifulSoup


class ElitRoParser:
    """Класс для парсинга данных с сайта elit.ro"""

    BASE_URL = "https://www.elit.ro"
    BRANDS_URL = "/Catalog/autoturism-identificare-vehicul/39849642;39850140"

    def __init__(self, output_path: str, max_brands: int = 100, max_models: int = 20, max_engines: int = 50):
        """Инициализация парсера

        Args:
            output_path (str): Путь для сохранения выходного JSON файла
            max_brands (int): Максимальное количество брендов для парсинга
            max_models (int): Максимальное количество моделей для парсинга на бренд
            max_engines (int): Максимальное количество двигателей для парсинга на модель
        """
        self.output_path = output_path
        self.max_brands = max_brands
        self.max_models = max_models
        self.max_engines = max_engines
        self.debug_dir = Path("debug_output")
        self.debug_dir.mkdir(exist_ok=True)
        
        # Словарь для определения страны по названию бренда
        self.country_map = {
            "BMW": "Германия",
            "AUDI": "Германия",
            "MERCEDES": "Германия",
            "VOLKSWAGEN": "Германия",
            "OPEL": "Германия",
            "PORSCHE": "Германия",
            "TOYOTA": "Япония",
            "HONDA": "Япония",
            "NISSAN": "Япония",
            "MAZDA": "Япония",
            "SUBARU": "Япония",
            "LEXUS": "Япония",
            "MITSUBISHI": "Япония",
            "FORD": "США",
            "CHEVROLET": "США",
            "DODGE": "США",
            "JEEP": "США",
            "TESLA": "США",
            "RENAULT": "Франция",
            "PEUGEOT": "Франция",
            "CITROEN": "Франция",
            "FIAT": "Италия",
            "ALFA ROMEO": "Италия",
            "FERRARI": "Италия",
            "LAMBORGHINI": "Италия",
            "MASERATI": "Италия",
            "HYUNDAI": "Южная Корея",
            "KIA": "Южная Корея",
            "VOLVO": "Швеция",
            "SAAB": "Швеция",
            "DACIA": "Румыния",
            "LADA": "Россия",
            "SEAT": "Испания",
            "SKODA": "Чехия",
            "ROLLS-ROYCE": "Великобритания",
            "BENTLEY": "Великобритания",
            "JAGUAR": "Великобритания",
            "LAND ROVER": "Великобритания",
            "ASTON MARTIN": "Великобритания"
        }

    def get_country_by_brand(self, brand_name: str) -> str:
        """Определяет страну-производителя по названию бренда

        Args:
            brand_name (str): Название бренда

        Returns:
            str: Название страны
        """
        brand_upper = brand_name.upper()
        for brand, country in self.country_map.items():
            if brand in brand_upper:
                return country
        return "Неизвестно"

    def save_debug_html(self, page: Page, filename: str) -> None:
        """Сохраняет HTML-страницу для отладки

        Args:
            page (Page): Объект страницы Playwright
            filename (str): Имя файла для сохранения
        """
        content = page.content()
        output_path = self.debug_dir / f"{filename}.html"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Сохранен HTML-код страницы: {output_path}")

    def save_screenshot(self, page: Page, filename: str) -> None:
        """Сохраняет скриншот страницы для отладки

        Args:
            page (Page): Объект страницы Playwright
            filename (str): Имя файла для сохранения
        """
        output_path = self.debug_dir / f"{filename}.png"
        page.screenshot(path=str(output_path))
        print(f"Сохранен скриншот страницы: {output_path}")

    def parse_brands(self, page: Page) -> List[Dict[str, str]]:
        """Парсит список брендов автомобилей с главной страницы

        Args:
            page (Page): Объект страницы Playwright

        Returns:
            List[Dict[str, str]]: Список словарей с информацией о брендах
        """
        print("Начинаем получение брендов...")
        
        url = f"{self.BASE_URL}{self.BRANDS_URL}"
        print(f"Переходим на URL: {url}")
        
        page.goto(url)
        page.wait_for_load_state("networkidle")
        
        self.save_screenshot(page, "brands_page")
        self.save_debug_html(page, "brands_page")
        
        # Получаем HTML-контент и используем BeautifulSoup для парсинга
        content = page.content()
        soup = BeautifulSoup(content, "html.parser")
        
        brands = []
        
        # Ищем ссылки брендов
        links = soup.find_all("a", href=lambda href: href and "autoturism-identificare-vehicul" in href)
        
        for link in links:
            name = link.get_text().strip()
            href = link.get("href", "")
            
            # Пропускаем пустые или служебные элементы
            if (not name or len(name) > 50 or
                any(word in name.lower() for word in ["home", "back", "menu", "catalog", "next", "prev"]) or
                not href or "autoturism-identificare-vehicul-" not in href):
                continue
            
            # Извлекаем ID бренда из URL
            brand_match = href.split("autoturism-identificare-vehicul-")
            if len(brand_match) > 1:
                brand_id = brand_match[1].split("/")[0].split(";")[0]
                
                # Определяем страну
                country = self.get_country_by_brand(name)
                
                # Добавляем в результаты
                brands.append({
                    "id": brand_id,
                    "name": name,
                    "country": country
                })
        
        print(f"Найдено {len(brands)} брендов")
        
        # Сортируем по имени и ограничиваем количество
        brands.sort(key=lambda x: x["name"])
        return brands[:self.max_brands]

    def parse_models(self, page: Page, brand_id: str, brand_name: str) -> List[Dict[str, Any]]:
        """Парсит список моделей для указанного бренда

        Args:
            page (Page): Объект страницы Playwright
            brand_id (str): ID бренда
            brand_name (str): Название бренда

        Returns:
            List[Dict[str, Any]]: Список словарей с информацией о моделях
        """
        print(f"Получение моделей для бренда {brand_name} ({brand_id})...")
        
        url = f"{self.BASE_URL}/Catalog/autoturism-identificare-vehicul-{brand_id}"
        print(f"Переходим на URL: {url}")
        
        page.goto(url)
        page.wait_for_load_state("networkidle")
        
        self.save_screenshot(page, f"models_{brand_id}")
        self.save_debug_html(page, f"models_{brand_id}")
        
        # Получаем HTML-контент и используем BeautifulSoup для парсинга
        content = page.content()
        soup = BeautifulSoup(content, "html.parser")
        
        models = []
        
        # Попытка 1: Ищем таблицы с моделями
        tables = soup.find_all("table")
        for table in tables:
            rows = table.find_all("tr")
            for row in rows:
                links = row.find_all("a", href=lambda href: href and "autoturism-identificare-vehicul" in href)
                
                for link in links:
                    name = link.get_text().strip()
                    href = link.get("href", "")
                    
                    # Пропускаем неподходящие ссылки
                    if (not name or len(name) > 100 or
                        any(word in name.lower() for word in ["home", "back", "menu", "catalog", "next", "prev"]) or
                        name.upper() == name):  # Пропускаем текст в ВЕРХНЕМ РЕГИСТРЕ (вероятно, бренды)
                        continue
                    
                    # Проверка: ссылка должна содержать часть URL после названия бренда
                    if f"autoturism-identificare-vehicul-{brand_id}-" in href:
                        model_id = href.split(f"autoturism-identificare-vehicul-{brand_id}-")[1].split("/")[0].split(";")[0]
                        
                        # Обработка текста модели
                        year_start = None
                        year_end = None
                        
                        # Извлекаем годы производства из формата "MODEL (01/94-10/03)" или "MODEL (1994-2003)"
                        import re
                        year_match = re.search(r"(.+?)\s*\((\d{2}\/\d{2}|\d{4})\s*-\s*(\d{2}\/\d{2}|\d{4}|\-)\)", name)
                        if year_match:
                            name = year_match.group(1).strip()
                            year_start = year_match.group(2)
                            year_end = None if year_match.group(3) == "-" else year_match.group(3)
                        
                        models.append({
                            "id": model_id,
                            "name": name,
                            "year_start": year_start,
                            "year_end": year_end,
                            "body_type": None,
                            "code": None
                        })
        
        # Попытка 2: Ищем ссылки в любых элементах страницы
        if not models:
            links = soup.find_all("a", href=lambda href: href and f"autoturism-identificare-vehicul-{brand_id}-" in href)
            
            for link in links:
                name = link.get_text().strip()
                href = link.get("href", "")
                
                # Пропускаем неподходящие ссылки
                if (not name or len(name) > 100 or len(name) < 2 or
                    any(word in name.lower() for word in ["home", "back", "menu", "catalog", "next", "prev"]) or
                    name.upper() == name):
                    continue
                
                model_id = href.split(f"autoturism-identificare-vehicul-{brand_id}-")[1].split("/")[0].split(";")[0]
                
                # Обработка текста модели
                year_start = None
                year_end = None
                
                import re
                year_match = re.search(r"(.+?)\s*\((\d{2}\/\d{2}|\d{4})\s*-\s*(\d{2}\/\d{2}|\d{4}|\-)\)", name)
                if year_match:
                    name = year_match.group(1).strip()
                    year_start = year_match.group(2)
                    year_end = None if year_match.group(3) == "-" else year_match.group(3)
                
                models.append({
                    "id": model_id,
                    "name": name,
                    "year_start": year_start,
                    "year_end": year_end,
                    "body_type": None,
                    "code": None
                })
        
        print(f"Найдено {len(models)} моделей для бренда {brand_name}")
        
        # Сортируем и ограничиваем количество
        models.sort(key=lambda x: x["name"])
        return models[:self.max_models]

    def parse_engines(self, page: Page, model_id: str, brand_name: str, model_name: str) -> List[Dict[str, Any]]:
        """Парсит список двигателей для указанной модели

        Args:
            page (Page): Объект страницы Playwright
            model_id (str): ID модели
            brand_name (str): Название бренда
            model_name (str): Название модели

        Returns:
            List[Dict[str, Any]]: Список словарей с информацией о двигателях
        """
        print(f"Получение двигателей для модели {model_name} бренда {brand_name}...")
        
        url = f"{self.BASE_URL}/Catalog/autoturism-identificare-vehicul-{model_id}"
        print(f"Переходим на URL: {url}")
        
        page.goto(url)
        page.wait_for_load_state("networkidle")
        
        self.save_screenshot(page, f"engines_{model_id}")
        self.save_debug_html(page, f"engines_{model_id}")
        
        # Получаем HTML-контент и используем BeautifulSoup для парсинга
        content = page.content()
        soup = BeautifulSoup(content, "html.parser")
        
        engines = []
        
        # Ищем таблицу с двигателями
        tables = soup.find_all("table")
        
        for table in tables:
            # Проверяем заголовки таблицы
            headers = [th.get_text().strip().lower() for th in table.find_all("th")]
            
            is_engine_table = any(keyword in " ".join(headers) for keyword in 
                              ["kw", "hp", "ccm", "motor", "tip", "cilindri", "carburant"])
            
            if is_engine_table:
                rows = table.find_all("tr")[1:]  # Пропускаем заголовок
                
                for row in rows:
                    cells = row.find_all("td")
                    
                    if len(cells) < 3:
                        continue
                    
                    try:
                        # Извлекаем данные из ячеек
                        engine_type = cells[0].get_text().strip() if len(cells) > 0 else ""
                        year_text = cells[1].get_text().strip() if len(cells) > 1 else ""
                        kw_text = cells[2].get_text().strip() if len(cells) > 2 else ""
                        hp_text = cells[3].get_text().strip() if len(cells) > 3 else ""
                        ccm_text = cells[4].get_text().strip() if len(cells) > 4 else ""
                        cylinders_text = cells[5].get_text().strip() if len(cells) > 5 else ""
                        fuel_type_text = cells[6].get_text().strip() if len(cells) > 6 else ""
                        engine_code = cells[7].get_text().strip() if len(cells) > 7 else ""
                        
                        # Парсим значения
                        kw = int(kw_text) if kw_text and kw_text.isdigit() else None
                        hp = int(hp_text) if hp_text and hp_text.isdigit() else None
                        
                        # Обработка ccm
                        ccm = None
                        if ccm_text:
                            if "." in ccm_text:
                                ccm = round(float(ccm_text) * 1000)
                            else:
                                ccm = int(ccm_text) if ccm_text.isdigit() else None
                        
                        # Обработка количества цилиндров
                        cylinders = int(cylinders_text) if cylinders_text and cylinders_text.isdigit() else None
                        
                        # Парсим годы производства
                        year_start = None
                        year_end = None
                        
                        import re
                        year_match = re.search(r"(\d{2}\/\d{2}|\d{4})\s*-\s*(\d{2}\/\d{2}|\d{4}|-)", year_text)
                        if year_match:
                            year_start = year_match.group(1)
                            year_end = None if year_match.group(2) == "-" else year_match.group(2)
                        
                        # Определяем тип топлива
                        if not fuel_type_text:
                            fuel_type_text = "Diesel" if any(keyword in engine_type.lower() for keyword in ["diesel", "di", "tdi", "hdi"]) else "Benzina"
                        
                        # Добавляем двигатель в результат
                        if engine_type or engine_code or kw or hp or ccm:
                            engines.append({
                                "code": engine_code or engine_type,
                                "kw": kw,
                                "hp": hp,
                                "ccm": ccm,
                                "cylinders": cylinders,
                                "fuelType": fuel_type_text,
                                "yearStart": year_start,
                                "yearEnd": year_end,
                                "description": engine_type
                            })
                    except Exception as e:
                        print(f"Ошибка при обработке строки таблицы: {str(e)}")
        
        print(f"Найдено {len(engines)} двигателей для модели {model_name}")
        
        # Сортируем и ограничиваем количество
        engines.sort(key=lambda x: x["description"] if x["description"] else "")
        return engines[:self.max_engines]

    def parse_data(self, brands_filter: Optional[List[str]] = None) -> Dict[str, Any]:
        """Устаревший метод, оставлен для обратной совместимости.
        Используйте run() вместо этого метода.

        Args:
            brands_filter (Optional[List[str]]): Список брендов для фильтрации

        Returns:
            Dict[str, Any]: Структурированные данные о моделях и двигателях
        """
        print("ВНИМАНИЕ: метод parse_data() является устаревшим, используйте метод run()")
        return self.run(mode="full", brands_filter=brands_filter)

    def run(self, mode: str = "full", brand_id: Optional[str] = None, model_id: Optional[str] = None,
            brands_filter: Optional[List[str]] = None) -> Dict[str, Any]:
        """Запускает парсер в указанном режиме

        Args:
            mode (str): Режим работы парсера ('full', 'brands', 'models', 'engines')
            brand_id (Optional[str]): ID бренда для режимов 'models' и 'engines'
            model_id (Optional[str]): ID модели для режима 'engines'
            brands_filter (Optional[List[str]]): Список брендов для фильтрации

        Returns:
            Dict[str, Any]: Результат парсинга
        """
        print(f"Запуск парсера в режиме: {mode}")
        result = {}
        
        try:
            # Инициализируем Playwright только один раз для всех режимов
            playwright = sync_playwright().start()
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
                viewport={"width": 1280, "height": 900},
                locale="ro-RO"
            )
            page = context.new_page()
            
            try:
                if mode == "brands" or mode == "full":
                    # Получаем список брендов
                    brands = self.parse_brands(page)
                    
                    if mode == "brands":
                        result = {"brands": brands}
                    elif mode == "full":
                        # Для полного парсинга обрабатываем бренды, модели и двигатели
                        
                        # Фильтруем бренды, если указаны
                        if brands_filter:
                            brands_filter_upper = [b.upper() for b in brands_filter]
                            brands = [b for b in brands if b["name"].upper() in brands_filter_upper]
                        
                        # Ограничиваем количество брендов
                        brands = brands[:self.max_brands]
                        
                        # Инициализируем результат
                        result = {}
                        
                        # Обрабатываем каждый бренд
                        for brand in brands:
                            brand_id = brand["id"]
                            brand_name = brand["name"]
                            brand_country = brand["country"]
                            
                            print(f"\nОбработка бренда: {brand_name}")
                            
                            # Создаем запись для бренда
                            result[brand_name] = {
                                "info": {
                                    "country": brand_country
                                },
                                "models": {}
                            }
                            
                            # Получаем модели для бренда
                            models = self.parse_models(page, brand_id, brand_name)
                            
                            # Ограничиваем количество моделей
                            models = models[:self.max_models]
                            
                            # Обрабатываем каждую модель
                            for model in models:
                                model_id = model["id"]
                                model_name = model["name"]
                                
                                print(f"  Модель: {model_name}")
                                
                                # Добавляем информацию о модели
                                result[brand_name]["models"][model_name] = {
                                    "info": {
                                        "bodyType": model["body_type"],
                                        "yearStart": model["year_start"],
                                        "yearEnd": model["year_end"]
                                    },
                                    "engines": []
                                }
                                
                                # Получаем двигатели для модели
                                try:
                                    engines = self.parse_engines(page, model_id, brand_name, model_name)
                                    
                                    # Ограничиваем количество двигателей
                                    engines = engines[:self.max_engines]
                                    
                                    # Добавляем информацию о двигателях
                                    result[brand_name]["models"][model_name]["engines"] = engines
                                    
                                    print(f"    Получено двигателей: {len(engines)}")
                                    
                                    # Небольшая задержка между запросами
                                    time.sleep(1)
                                except Exception as e:
                                    print(f"    Ошибка при получении двигателей: {e}")
                
                elif mode == "models" and brand_id:
                    # Получаем модели для указанного бренда
                    models = self.parse_models(page, brand_id, "Бренд")
                    result = {"models": models}
                
                elif mode == "engines" and model_id:
                    # Получаем двигатели для указанной модели
                    engines = self.parse_engines(page, model_id, "Бренд", "Модель")
                    result = {"engines": engines}
                
                else:
                    print(f"Неверный режим работы: {mode}")
            except Exception as e:
                print(f"Ошибка при парсинге: {e}")
                raise
            finally:
                # Закрываем ресурсы браузера
                browser.close()
                playwright.stop()
            
            # Сохраняем результат в файл
            with open(self.output_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            print(f"Результаты сохранены в файл {self.output_path}")
            
            return result
        
        except Exception as e:
            print(f"Ошибка при запуске парсера: {e}")
            
            # Пустой результат в случае ошибки
            with open(self.output_path, "w", encoding="utf-8") as f:
                json.dump({}, f, ensure_ascii=False, indent=2)
            
            return {}


def main():
    """Основная функция для запуска парсера из командной строки"""
    parser = argparse.ArgumentParser(description="Парсер данных о брендах, моделях и двигателях с сайта elit.ro")
    parser.add_argument("output", help="Путь для сохранения выходного JSON файла")
    parser.add_argument("mode", choices=["full", "brands", "models", "engines"], default="full",
                      help="Режим работы парсера")
    parser.add_argument("--brand-id", help="ID бренда для режимов 'models' и 'engines'")
    parser.add_argument("--model-id", help="ID модели для режима 'engines'")
    parser.add_argument("--max-brands", type=int, default=10, help="Максимальное количество брендов для парсинга")
    parser.add_argument("--max-models", type=int, default=5, help="Максимальное количество моделей для парсинга на бренд")
    parser.add_argument("--max-engines", type=int, default=10, help="Максимальное количество двигателей для парсинга на модель")
    parser.add_argument("--brands-filter", nargs="+", help="Список брендов для фильтрации")
    parser.add_argument("--demo", action="store_true", help="Использовать демо-данные")
    
    args = parser.parse_args()
    
    # Создаем парсер
    parser = ElitRoParser(
        output_path=args.output,
        max_brands=args.max_brands,
        max_models=args.max_models,
        max_engines=args.max_engines
    )
    
    # Запускаем парсер
    parser.run(
        mode=args.mode,
        brand_id=args.brand_id,
        model_id=args.model_id,
        brands_filter=args.brands_filter
    )


if __name__ == "__main__":
    main() 