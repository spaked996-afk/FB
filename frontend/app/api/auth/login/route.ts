import { NextResponse } from "next/server"
import { SignJWT } from "jose"

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-dev-secret-change-in-production-32"
)

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

export async function POST(req: Request) {
  const body = await req.json()

  const backendRes = await fetch(`${FASTAPI_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Неверные учётные данные" }, { status: 401 })
  }

  const user = await backendRes.json()

  const token = await new SignJWT({
    username: user.username,
    role: user.role,
    clientId: user.client_id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(SESSION_SECRET)

  const response = NextResponse.json(user)

  response.cookies.set("aivek_session", token, {
    httpOnly: true,
    path: "/",
  })

  return response
}
