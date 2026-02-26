from threading import Thread, Lock
import json
import os
import sys
from io import StringIO

from app.core.processor import Processor
from app.services.checko import CheckoService
from app.services.cached_checko import CachedCheckoService
from app.services.phone_api import PhoneAPIService
from app.services.cached_phone import CachedPhoneService
from app.services.sheets import SheetsService


STORAGE_FILE = "jobs_storage.json"
clients = {}
active_processors = {}
state_lock = Lock()


def run_processor(client_id: str, job_id: str, worksheet_name: str):
    print("=== RUN_PROCESSOR CALLED ===")
    print("client_id:", client_id)
    print("job_id:", job_id)
    print("worksheet_name:", worksheet_name)

    job = None
    old_stdout = None

    try:
        ensure_client(client_id)

        job = clients[client_id]["jobs"][job_id]
        cfg = clients[client_id]["config"]

        print("CFG:", cfg)

        job["running"] = True
        job["logs"].append(f"[JOB START] worksheet={worksheet_name}\n")
        save_state()

        print("Creating SheetsService...")
        sheets = SheetsService(
            creds_path="credentials.json",
            spreadsheet_key=cfg["spreadsheet_key"],
            worksheet_name=worksheet_name,
        )

        print("Creating Checko...")
        checko = CheckoService(api_key=cfg["checko_api_key"])
        checko = CachedCheckoService(checko, client_id=client_id)

        print("Creating Phone API...")
        phone_api = PhoneAPIService(api_token=cfg["phone_api_token"])

        cache_path = os.path.join("data", "clients", client_id, "phone_cache.json")
        print("Cache path:", cache_path)

        phone = CachedPhoneService(phone_api, cache_path=cache_path)

        print("Creating Processor...")
        processor = Processor(
            sheets_service=sheets,
            checko_service=checko,
            phone_service=phone,
        )

        active_processors[job_id] = processor

        print("Processor created successfully")

        def progress_callback(current, total):
            job["progress_current"] = current
            job["progress_total"] = total
            job["found"] = processor.found_phones
            save_state()

        print("Starting processor.run()")

        processor.run(progress_callback=progress_callback)

        print("Processor finished")

        job["running"] = False
        job["logs"].append("[JOB FINISHED]\n")
        save_state()

    except Exception as e:
        print("!!! ERROR IN RUN_PROCESSOR !!!")
        print(str(e))
        if job:
            job["logs"].append(f"[JOB ERROR] {str(e)}\n")
            job["running"] = False
            save_state()

    finally:
        active_processors.pop(job_id, None)

# ==========================================================
# STORAGE
# ==========================================================


def load_state():
    global clients
    if os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, "r", encoding="utf-8") as f:
            clients = json.load(f)
    else:
        clients = {}


def save_state():
    with state_lock:
        tmp = STORAGE_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(clients, f, indent=2, ensure_ascii=False)
        os.replace(tmp, STORAGE_FILE)


def ensure_client(client_id: str):
    if client_id not in clients:
        clients[client_id] = {"config": {}, "jobs": {}}


def get_client_config(client_id: str):
    ensure_client(client_id)
    return clients[client_id]["config"]


def set_client_config(client_id: str, config_data: dict):
    ensure_client(client_id)
    clients[client_id]["config"] = config_data
    save_state()


load_state()


# ==========================================================
# RUN PROCESSOR
# ==========================================================


def run_processor(client_id: str, job_id: str, worksheet_name: str):
    job = None
    old_stdout = None

    try:
        ensure_client(client_id)

        job = clients[client_id]["jobs"][job_id]
        cfg = clients[client_id]["config"]

        job["running"] = True
        job["logs"].append(f"[JOB START] worksheet={worksheet_name}\n")
        save_state()

        sheets = SheetsService(
            creds_path="credentials.json",
            spreadsheet_key=cfg["spreadsheet_key"],
            worksheet_name=worksheet_name,
        )

        checko = CheckoService(api_key=cfg["checko_api_key"])
        checko = CachedCheckoService(checko, client_id=client_id)

        phone_api = PhoneAPIService(api_token=cfg["phone_api_token"])

        # Мультиклиентский путь к phone cache
        cache_path = os.path.join("data", "clients", client_id, "phone_cache.json")
        phone = CachedPhoneService(phone_api, cache_path=cache_path)

        processor = Processor(
            sheets_service=sheets,
            checko_service=checko,
            phone_service=phone,
        )
        active_processors[job_id] = processor

        # ===============================
        # Перехват print
        # ===============================

        class Logger(StringIO):
            def write(self, message):
                if message.strip():
                    job["logs"].append(message)

                    # Ограничение размера логов
                    if len(job["logs"]) > 1000:
                        job["logs"] = job["logs"][-1000:]

                    save_state()
                super().write(message)

        old_stdout = sys.stdout
        sys.stdout = Logger()

        # ===============================
        # RUN
        # ===============================

        def progress_callback(current, total):
            job["progress_current"] = current
            job["progress_total"] = total
            job["found"] = processor.found_phones
            save_state()

        try:
            processor.run(progress_callback=progress_callback)

            job["running"] = False
            job["logs"].append("[JOB FINISHED]\n")
            save_state()

        except Exception as e:
            job["logs"].append(f"[JOB ERROR] {str(e)}\n")
            job["running"] = False
            save_state()
            raise

        finally:
            # Гарантированно восстанавливаем stdout
            if old_stdout is not None:
                sys.stdout = old_stdout

    finally:
        # Гарантированная очистка активного процессора
        active_processors.pop(job_id, None)


def stop_job(client_id: str, job_id: str):
    processor = active_processors.get(job_id)
    if processor:
        processor.stop()
