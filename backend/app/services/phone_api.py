import requests
import re


class PhoneAPIService:
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = "https://infosearch54321.xyz"
        self.timeout = (5, 15)

    # ==========================================================
    # RETURN ALL VALID MOBILE PHONES
    # ==========================================================
    def get_phones(self, query: str) -> list[str]:
        if not query:
            return []

        url = f"{self.base_url}/api/{self.api_token}/search/{query}"

        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[PHONE API ERROR] {query}: {e}")
            return []

        try:
            data = response.json()
        except ValueError:
            print(f"[PHONE API ERROR] Invalid JSON for {query}")
            return []

        results = data.get("result")

        if not isinstance(results, list):
            return []

        valid_phones = []

        for entry in results:
            if not isinstance(entry, dict):
                continue

            phone = entry.get("ТЕЛЕФОН")
            if not phone:
                continue

            clean_phone = re.sub(r"\D", "", str(phone))

            # мобильные РФ: 11 цифр, начинается с 79
            if len(clean_phone) == 11 and clean_phone.startswith("79"):
                valid_phones.append(clean_phone)

        return valid_phones

    # ==========================================================
    # SAFE BALANCE
    # ==========================================================
    def get_balance(self) -> float:
        url = f"{self.base_url}/api/{self.api_token}/profile"

        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[BALANCE ERROR] {e}")
            return 0.0

        try:
            data = response.json()
        except ValueError:
            print("[BALANCE ERROR] Invalid JSON")
            return 0.0

        profile = data.get("profile")

        if not isinstance(profile, dict):
            return 0.0

        balance = profile.get("balance")

        try:
            return float(balance or 0.0)
        except (TypeError, ValueError):
            return 0.0
