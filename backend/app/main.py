from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse

from app.routes.auth import router as auth_router
from app.routes.billing import router as billing_router
from app.routes.jobs import router as jobs_router


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_middleware(SessionMiddleware, secret_key="super-secret-key-change-this")

templates = Jinja2Templates(directory="app/templates")

# Подключаем роутеры
app.include_router(auth_router)
app.include_router(billing_router)
app.include_router(jobs_router)


@app.get("/")
def home(request: Request):

    # Если не залогинен — редирект на логин
    if "user" not in request.session:
        return RedirectResponse("/login", status_code=302)

    user = request.session["user"]

    # ADMIN
    if user["role"] == "admin":
        return templates.TemplateResponse(
            "admin.html", {"request": request, "user": user}
        )

    # CLIENT
    return templates.TemplateResponse(
        "client.html",
        {"request": request, "user": user, "client_id": user.get("client_id")},
    )
