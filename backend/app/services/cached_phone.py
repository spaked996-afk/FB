import json
import os
import shutil
from typing import List


class CachedPhoneService:
    def __init__(
        self,
        phone_api_service,
        cache_path: str,
        autosave_every: int = 20,
        check_balance_every: int = 50,
        min_balance_threshold: float = 5.0,
    ):
        self.phone_api = phone_api_service
        self.cache_path = cache_path
        self.backup_path = cache_path + ".bak"

        self.autosave_every = autosave_every
        self.check_balance_every = check_balance_every
        self.min_balance_threshold = min_balance_threshold

        os.makedirs(os.path.dirname(self.cache_path), exist_ok=True)

        self.cache = self._load_cache()
        self.new_entries_counter = 0
        self.api_calls_counter = 0

    # ==========================================================
    # SAFE GET PHONES
    # ==========================================================

    def get_phones(self, inn: str) -> List[str]:
        inn = str(inn).strip()

        # CACHE HIT
        if inn in self.cache:
            cached = self.cache[inn]
            if isinstance(cached, list):
                print(f"[PHONE CACHE HIT] {inn}")
                return cached
            return []

        # BALANCE CHECK
        if self._should_check_balance():
            try:
                balance = self.phone_api.get_balance()
                print(f"[BALANCE CHECK] {balance}")
                if balance is not None and balance < self.min_balance_threshold:
                    raise RuntimeError(
                        f"Баланс ниже порога ({balance} < {self.min_balance_threshold})"
                    )
            except Exception as e:
                print(f"[BALANCE CHECK ERROR] {e}")

        print(f"[PHONE API CALL] {inn}")
        phones = self.phone_api.get_phones(inn)
        self.api_calls_counter += 1

        if not isinstance(phones, list):
            phones = []

        clean_list = [p.strip() for p in phones if isinstance(p, str) and p.strip()]

        self.cache[inn] = clean_list
        self.new_entries_counter += 1
        self._autosave()

        return clean_list

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
            print("[PHONE CACHE] Повреждение. Пробуем backup.")
            if os.path.exists(self.backup_path):
                try:
                    with open(self.backup_path, "r", encoding="utf-8") as f:
                        return json.load(f)
                except Exception:
                    pass
            return {}

    def _save_cache(self):
        try:
            if os.path.exists(self.cache_path):
                shutil.copy(self.cache_path, self.backup_path)

            tmp_path = self.cache_path + ".tmp"

            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)

            os.replace(tmp_path, self.cache_path)

            print(f"[PHONE CACHE] Сохранено {len(self.cache)} записей")

        except Exception as e:
            print(f"[PHONE CACHE ERROR] {e}")

    def _should_check_balance(self) -> bool:
        return (
            self.check_balance_every > 0
            and self.api_calls_counter % self.check_balance_every == 0
        )

    def flush(self):
        self._save_cache()
