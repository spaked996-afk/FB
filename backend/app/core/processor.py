from threading import Event


class Processor:
    def __init__(
        self,
        sheets_service,
        checko_service,
        phone_service,
    ):
        self.sheets = sheets_service
        self.checko = checko_service
        self.phone = phone_service

        self._stop_event = Event()
        self.found_phones = 0

        self.COL_COMPANY_INN = "ИНН"
        self.COL_CHECKO_LINK = "Ссылка на checko"
        self.COL_REVENUE = "Выручка за 2024 г. млн.руб"
        self.COL_LPR_NAME = "ЛПР"
        self.COL_LPR_INN = "ИНН ЛПР"
        self.COL_LPR_PHONE = "Номер телефона ЛПР"
        self.COL_STATUS = "Статус"

    # ==========================================================
    def stop(self):
        self._stop_event.set()

    # ==========================================================
    def run(self, progress_callback=None):

        rows = self.sheets.get_rows()
        total = len(rows)

        buffer = []
        BATCH_SIZE = 75

        buffer_start_row = None
        buffer_end_row = None

        for row_number, row in enumerate(rows, start=2):

            if self._stop_event.is_set():
                print("Остановка по запросу пользователя...")
                break

            updates = {}

            company_inn_raw = str(row.get(self.COL_COMPANY_INN) or "").strip()
            existing_phone = row.get(self.COL_LPR_PHONE)

            # ------------------------------------------------------
            # 1. Пустой ИНН
            # ------------------------------------------------------
            if not company_inn_raw:
                updates[self.COL_STATUS] = "EMPTY_INN"

            # ------------------------------------------------------
            # 2. Уже есть номер
            # ------------------------------------------------------
            elif existing_phone:
                updates[self.COL_STATUS] = "ALREADY_FILLED"

            else:
                # Нормализация ИНН
                digits = "".join(ch for ch in str(company_inn_raw) if ch.isdigit())

                # Восстановление ведущих нулей
                if len(digits) in (9, 10):
                    digits = digits.zfill(10)
                elif len(digits) in (11, 12):
                    digits = digits.zfill(12)

                try:
                    target_inn_for_phone = None

                    # ======================================================
                    # ООО
                    # ======================================================
                    if len(digits) == 10:

                        company = self.checko.get_company(digits)

                        if not company:
                            updates[self.COL_STATUS] = "NOT_FOUND"
                        else:
                            ogrn = company.get("ОГРН")

                            if ogrn:
                                updates[self.COL_CHECKO_LINK] = (
                                    f"https://checko.ru/company/{ogrn}"
                                )

                                revenue = self.checko.get_revenue(digits, ogrn)
                                if revenue is not None:
                                    updates[self.COL_REVENUE] = revenue

                            director = self.checko.extract_director(company)

                            if not director or not director.get("inn"):
                                updates[self.COL_STATUS] = "NO_LPR"
                            else:
                                updates[self.COL_LPR_NAME] = director.get("name") or ""
                                updates[self.COL_LPR_INN] = director.get("inn") or ""
                                target_inn_for_phone = director.get("inn")

                    # ======================================================
                    # ИП
                    # ======================================================
                    elif len(digits) == 12:
                        target_inn_for_phone = digits

                    else:
                        updates[self.COL_STATUS] = "INVALID_INN"

                    # ======================================================
                    # PHONE
                    # ======================================================
                    if target_inn_for_phone:

                        phones = self.phone.get_phones(str(target_inn_for_phone))

                        if not phones:
                            updates[self.COL_STATUS] = "NO_VALID_MOBILE"
                        else:
                            phones_str = ",".join(phones)
                            updates[self.COL_LPR_PHONE] = phones_str
                            updates[self.COL_STATUS] = "OK"

                            self.found_phones += len(phones)

                    elif self.COL_STATUS not in updates:
                        updates[self.COL_STATUS] = "NO_TARGET_INN"

                except Exception as e:
                    updates[self.COL_STATUS] = "ERROR"
                    print(f"[ERROR] Строка {row_number}: {e}")

            # ======================================================
            # Буферизация
            # ======================================================
            if updates:

                if buffer_start_row is None:
                    buffer_start_row = row_number

                buffer.append((row_number, updates))
                buffer_end_row = row_number

            # ======================================================
            # Прогресс
            # ======================================================
            if progress_callback:
                progress_callback(row_number - 1, total)

            # ======================================================
            # FLUSH
            # ======================================================
            if len(buffer) >= BATCH_SIZE:
                try:
                    print(f"Обрабатываю строки {buffer_start_row}–{buffer_end_row}")
                    self.sheets.batch_update_rows(buffer)
                    print(f"[BATCH WRITE] Записано {len(buffer)} строк\n")

                    buffer.clear()
                    buffer_start_row = None
                    buffer_end_row = None

                except Exception as e:
                    print(f"[BATCH ERROR] {e}")

        # ======================================================
        # Финальный flush
        # ======================================================
        if buffer:
            try:
                print(f"Обрабатываю строки {buffer_start_row}–{buffer_end_row}")
                self.sheets.batch_update_rows(buffer)
                print(f"[FINAL BATCH WRITE] Записано {len(buffer)} строк\n")
            except Exception as e:
                print(f"[FINAL BATCH ERROR] {e}")
