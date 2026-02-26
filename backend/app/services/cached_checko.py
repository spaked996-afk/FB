import json
import os
import shutil


class CachedCheckoService:
    def __init__(
        self,
        checko_service,
        client_id: str,
        autosave_every: int = 20,
    ):
        self.checko = checko_service
        self.autosave_every = autosave_every

        # мультиклиентская структура
        self.base_dir = os.path.join("data", "clients", client_id)
        os.makedirs(self.base_dir, exist_ok=True)

        self.cache_path = os.path.join(self.base_dir, "checko_cache.json")
        self.backup_path = os.path.join(self.base_dir, "checko_cache.bak")

        self.cache = self._load_cache()
        self.new_entries_counter = 0

    # ==========================================================
    # COMPANY
    # ==========================================================

    def get_company(self, inn: str):
        inn = str(inn).strip()

        if inn in self.cache:
            entry = self.cache[inn]
            if isinstance(entry, dict) and "company" in entry:
                print(f"[CHECKO CACHE HIT] {inn}")
                return entry["company"]

        print(f"[CHECKO API CALL] {inn}")
        company = self.checko.get_company(inn)

        if inn not in self.cache or not isinstance(self.cache[inn], dict):
            self.cache[inn] = {}

        self.cache[inn]["company"] = company
        self.new_entries_counter += 1
        self._autosave()

        return company

    # ==========================================================
    # REVENUE
    # ==========================================================

    def get_revenue(self, inn: str, ogrn: str):
        inn = str(inn).strip()

        if inn in self.cache:
            entry = self.cache[inn]
            if (
                isinstance(entry, dict)
                and "revenue" in entry
                and entry["revenue"] is not None
            ):
                print(f"[CHECKO REVENUE CACHE HIT] {inn}")
                return entry["revenue"]

        print(f"[CHECKO REVENUE API CALL] {inn}")
        revenue = self.checko.get_revenue(ogrn)

        if inn not in self.cache or not isinstance(self.cache[inn], dict):
            self.cache[inn] = {}

        self.cache[inn]["revenue"] = revenue
        self.new_entries_counter += 1
        self._autosave()

        return revenue

    def extract_director(self, company):
        return self.checko.extract_director(company)

    # ==========================================================
    # AUTOSAVE
    # ==========================================================

    def _autosave(self):
        if self.new_entries_counter >= self.autosave_every:
            self._save_cache()
            self.new_entries_counter = 0

    # ==========================================================
    # FILE OPS
    # ==========================================================

    def _load_cache(self):
        if not os.path.exists(self.cache_path):
            return {}

        try:
            with open(self.cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            print("[CHECKO CACHE] Повреждение. Пробуем backup.")
            if os.path.exists(self.backup_path):
                try:
                    with open(self.backup_path, "r", encoding="utf-8") as f:
                        return json.load(f)
                except Exception:
                    pass
            return {}

    def _save_cache(self):
        try:
            # backup
            if os.path.exists(self.cache_path):
                shutil.copy(self.cache_path, self.backup_path)

            tmp_path = self.cache_path + ".tmp"

            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)

            os.replace(tmp_path, self.cache_path)

            print(f"[CHECKO CACHE] Сохранено {len(self.cache)} записей")

        except Exception as e:
            print(f"[CHECKO CACHE ERROR] {e}")

    def flush(self):
        self._save_cache()
