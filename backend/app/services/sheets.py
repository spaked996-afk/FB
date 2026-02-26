import gspread
from google.oauth2.service_account import Credentials
from gspread.utils import rowcol_to_a1


class SheetsService:
    def __init__(self, creds_path, spreadsheet_key, worksheet_name):
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_file(creds_path, scopes=scope)
        client = gspread.authorize(creds)

        self.sheet = client.open_by_key(spreadsheet_key).worksheet(worksheet_name)

        # 🔥 Заголовки читаем один раз
        headers = self.sheet.row_values(1)
        self.column_map = {name: idx + 1 for idx, name in enumerate(headers)}

    # =========================
    # ЧТЕНИЕ
    # =========================

    def get_rows(self):
        return self.sheet.get_all_records()

    # =========================
    # BATCH UPDATE
    # =========================

    def batch_update_rows(self, rows_updates):
        """
        rows_updates: list of (row_number, dict_of_updates)
        """
        if not rows_updates:
            return

        batch_data = []

        for row_number, values in rows_updates:
            for col_name, value in values.items():
                col_index = self.column_map.get(col_name)
                if col_index:
                    cell_range = rowcol_to_a1(row_number, col_index)
                    batch_data.append({"range": cell_range, "values": [[value]]})

        if batch_data:
            self.sheet.batch_update(batch_data)

    # =========================
    # Совместимость со старым кодом
    # =========================

    def update_row(self, row_number, values: dict):
        self.batch_update_rows([(row_number, values)])
