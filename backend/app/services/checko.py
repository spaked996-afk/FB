# services/checko.py

import requests


class CheckoService:
    def __init__(self, api_key: str):
        self.api_key = api_key

    # =========================
    # Получение карточки компании
    # =========================
    def get_company(self, inn: str) -> dict | None:
        url = "https://api.checko.ru/v2/company"
        params = {"key": self.api_key, "inn": inn}

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            print(f"[COMPANY ERROR] {inn}: {e}")
            return None

        return data.get("data")

    # =========================
    # Извлечение руководителя
    # =========================
    def extract_director(self, company: dict) -> dict | None:
        """
        Логика:
        1. Если есть Руковод — возвращаем его.
        2. Если есть УпрОрг — делаем второй запрос,
           ищем руководителя управляющей организации.
        """

        # 1️⃣ Обычный руководитель
        directors = company.get("Руковод")

        if directors and isinstance(directors, list) and len(directors) > 0:
            director = directors[0]
            return {
                "name": director.get("ФИО"),
                "inn": director.get("ИНН"),
            }

        # 2️⃣ Управляющая организация
        management = company.get("УпрОрг")

        if management:
            management_inn = management.get("ИНН")

            if not management_inn:
                return None

            print(f"Найдена управляющая организация: {management_inn}")
            print("Делаем второй запрос для поиска её директора")

            management_company = self.get_company(management_inn)

            if not management_company:
                return None

            directors = management_company.get("Руковод")

            if directors and isinstance(directors, list) and len(directors) > 0:
                director = directors[0]
                return {
                    "name": director.get("ФИО"),
                    "inn": director.get("ИНН"),
                }

        return None

    # =========================
    # Получение выручки
    # =========================
    def get_revenue(self, ogrn: str) -> float | None:
        url = "https://api.checko.ru/v2/finances"
        params = {"key": self.api_key, "ogrn": ogrn}

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            print(f"[FINANCES ERROR] {ogrn}: {e}")
            return None

        finances = data.get("data")
        if not finances:
            return None

        last_year = max(finances.keys())
        report = finances.get(last_year)

        if not report:
            return None

        revenue = report.get("2110")
        if not revenue:
            return None

        return round(float(revenue) / 1_000_000, 2)
