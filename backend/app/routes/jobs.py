from fastapi import APIRouter, Request
from pydantic import BaseModel
from threading import Thread
from uuid import uuid4
from app.services.job_runner import stop_job
from app.services.job_runner import get_client_config
from app.services.phone_api import PhoneAPIService
import json
import os

from app.services.job_runner import (
    run_processor,
    clients,
    ensure_client,
    get_client_config,
    set_client_config,
    save_state,
)

router = APIRouter()


# ===============================
# CLIENT CONFIG
# ===============================


class ClientConfigRequest(BaseModel):
    spreadsheet_key: str
    checko_api_key: str
    phone_api_token: str


@router.get("/clients/{client_id}/config")
def get_config(client_id: str):
    cfg = get_client_config(client_id)

    if not cfg:
        return {"error": "client not found"}

    spreadsheet_key = cfg.get("spreadsheet_key")

    sheets = []

    if spreadsheet_key:
        try:
            from app.services.billing import BillingService

            billing = BillingService(client_id, "credentials.json")
            spreadsheet = billing.gc.open_by_key(spreadsheet_key)
            sheets = [ws.title for ws in spreadsheet.worksheets()]
        except Exception as e:
            print("Sheets load error:", e)

    return {
        "client_id": client_id,
        "config": cfg,
        "sheets": sheets,
    }


@router.post("/clients/{client_id}/config")
def update_config(client_id: str, request: ClientConfigRequest):
    ensure_client(client_id)
    set_client_config(client_id, request.model_dump())
    return {"status": "ok"}


# ===============================
# JOBS
# ===============================


class JobStartRequest(BaseModel):
    client_id: str
    worksheet_name: str


@router.post("/jobs/start")
def start_job(request: JobStartRequest):
    client_id = request.client_id

    ensure_client(client_id)

    # 🔒 ЗАЩИТА: проверка активной задачи
    existing_jobs = clients[client_id]["jobs"]

    for job in existing_jobs.values():
        if job.get("running"):
            return {"error": "job already running"}

    job_id = str(uuid4())

    clients[client_id]["jobs"][job_id] = {
        "running": True,
        "progress_current": 0,
        "progress_total": 0,
        "found": 0,
        "processor": None,
        "logs": [],
        "worksheet_name": request.worksheet_name,
    }

    save_state()

    thread = Thread(
        target=run_processor, args=(client_id, job_id, request.worksheet_name)
    )

    thread.start()

    return {"job_id": job_id}


@router.get("/jobs/{client_id}/{job_id}")
def get_status(client_id: str, job_id: str):
    if client_id not in clients:
        return {"error": "client not found"}

    jobs = clients[client_id]["jobs"]
    if job_id not in jobs:
        return {"error": "job not found"}

    job = jobs[job_id].copy()
    job.pop("processor", None)
    return job


@router.get("/jobs/{client_id}/{job_id}/logs")
def get_logs(client_id: str, job_id: str):
    if client_id not in clients:
        return {"error": "client not found"}

    jobs = clients[client_id]["jobs"]
    if job_id not in jobs:
        return {"error": "job not found"}

    return jobs[job_id].get("logs", [])


@router.post("/jobs/{client_id}/{job_id}/stop")
def stop_job_endpoint(client_id: str, job_id: str):
    if client_id not in clients:
        return {"error": "client not found"}

    jobs = clients[client_id]["jobs"]
    if job_id not in jobs:
        return {"error": "job not found"}

    # ВЫЗЫВАЕМ НАСТОЯЩИЙ STOP
    stop_job(client_id, job_id)

    jobs[job_id]["running"] = False
    save_state()

    return {"status": "stopping"}


@router.get("/jobs/{client_id}")
def get_active_job(client_id: str):
    if client_id not in clients:
        return {"error": "client not found"}

    jobs = clients[client_id]["jobs"]

    for job_id, job in jobs.items():
        if job.get("running"):
            return {
                "job_id": job_id,
                "status": "running",
                "progress_current": job.get("progress_current", 0),
                "progress_total": job.get("progress_total", 0),
                "found": job.get("found", 0),
            }

    return {
        "job_id": None,
        "status": "idle",
        "progress_current": 0,
        "progress_total": 0,
        "found": 0,
    }

@router.get("/balance/{client_id}")
def get_balance(client_id: str):
    cfg = get_client_config(client_id)

    if not cfg.get("phone_api_token"):
        return {"balance": None}

    phone_api = PhoneAPIService(api_token=cfg["phone_api_token"])
    balance = phone_api.get_balance()

    return {"balance": balance}


@router.get("/admin/overview")
def admin_overview(request: Request):

    if "user" not in request.session:
        return {"error": "Unauthorized"}

    if request.session["user"]["role"] != "admin":
        return {"error": "Forbidden"}

    users_path = os.path.join(os.getcwd(), "users.json")

    with open(users_path, "r", encoding="utf-8") as f:
        users = json.load(f)

    result = []
    total_debt = 0
    total_period = 0
    active_tasks = 0

    for username, user_data in users.items():
        if user_data.get("role") != "client":
            continue

        client_id = user_data.get("client_id")

        data = clients.get(client_id, {"jobs": {}})

        active_job_id = None
        running = False
        progress = 0

        for job_id, job in data["jobs"].items():
            if job.get("running"):
                active_job_id = job_id
                running = True
                progress = job.get("progress_current", 0)
                active_tasks += 1
                break

        # финансы
        billing_path = os.path.join("data", "clients", client_id, "billing.json")

        current_period = 0
        total_paid = 0
        debt = 0

        if os.path.exists(billing_path):
            with open(billing_path, "r", encoding="utf-8") as bf:
                billing = json.load(bf)

                current_period = billing.get("current_period_total", 0)
                total_paid = billing.get("total_paid", 0)
                debt = current_period

        total_debt += debt
        total_period += current_period

        result.append(
            {
                "username": username,
                "client_id": client_id,
                "running": running,
                "active_job_id": active_job_id,
                "progress": progress,
                "current_period": current_period,
                "total_paid": total_paid,
                "debt": debt,
            }
        )

    return {
        "clients": result,
        "stats": {
            "total_clients": len(result),
            "active_tasks": active_tasks,
            "total_period": total_period,
            "total_debt": total_debt,
        },
    }
