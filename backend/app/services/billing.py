import os
import json
from typing import List, Dict
import re
import gspread
from google.oauth2.service_account import Credentials
from gspread.utils import a1_to_rowcol


class BillingService:
    def __init__(self, client_id: str, creds_path: str):
        self.client_id = client_id
        self.creds_path = creds_path

        self.base_dir = os.path.join("data", "clients", client_id)
        os.makedirs(self.base_dir, exist_ok=True)

        self.billing_path = os.path.join(self.base_dir, "billing.json")

        self.data = self._load()
        self.gc = self._init_gspread()

    def _init_gspread(self):
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_file(self.creds_path, scopes=scope)
        return gspread.authorize(creds)

    def _load(self):
        if not os.path.exists(self.billing_path):
            return {
                "active_sheets": [],
                "sheet_totals": {},
                "current_period_total": 0,
                "total_paid": 0,
            }

        with open(self.billing_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save(self):
        tmp_path = self.billing_path + ".tmp"

        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

        os.replace(tmp_path, self.billing_path)

    def get_state(self):
        return self.data

    def recalculate(
        self,
        spreadsheet_key: str,
        sheets: List[str],
        column_letter: str = "G",
    ):
        sheet_totals: Dict[str, int] = {}
        total = 0

        spreadsheet = self.gc.open_by_key(spreadsheet_key)
        col_index = a1_to_rowcol(f"{column_letter}1")[1]

        for sheet_name in sheets:
            worksheet = spreadsheet.worksheet(sheet_name)
            values = worksheet.col_values(col_index)

            if values:
                values = values[1:]

            count = 0

            for cell in values:
                if not cell:
                    continue

                # Разделяем по запятой
                phones = [p.strip() for p in cell.split(",") if p.strip()]
                count += len(phones)

            sheet_totals[sheet_name] = count
            total += count

        self.data["active_sheets"] = sheets
        self.data["sheet_totals"] = sheet_totals
        self.data["current_period_total"] = total

        self._save()
        return self.data

    def close_period(self):
        self.data["total_paid"] += self.data.get("current_period_total", 0)
        self.data["current_period_total"] = 0
        self.data["sheet_totals"] = {}
        self.data["active_sheets"] = []

        self._save()
        return self.data
