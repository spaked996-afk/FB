from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import JSONResponse
from app.services.billing import BillingService
import json

router = APIRouter()


def load_jobs_storage():
    with open("jobs_storage.json", "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/billing/sheets/{client_id}")
def get_sheets_list(
    client_id: str,
    x_client_id: str = Header(None),
    x_user_role: str = Header(None),
):

    if not x_client_id or not x_user_role:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 🔒 Admin может смотреть любые
    if x_user_role != "admin" and x_client_id != client_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    jobs_storage = load_jobs_storage()

    if client_id not in jobs_storage:
        raise HTTPException(status_code=404, detail="Client not found")

    spreadsheet_key = jobs_storage[client_id]["config"].get("spreadsheet_key")

    if not spreadsheet_key:
        raise HTTPException(status_code=400, detail="No spreadsheet_key")

    billing = BillingService(client_id, "credentials.json")

    try:
        spreadsheet = billing.gc.open_by_key(spreadsheet_key)
        sheets = [ws.title for ws in spreadsheet.worksheets()]
        return {"sheets": sheets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))