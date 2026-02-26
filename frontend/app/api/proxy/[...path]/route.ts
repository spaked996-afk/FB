import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/api"
import { getSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { path } = await params
  const backendPath = "/" + path.join("/")

  const searchParams = request.nextUrl.searchParams.toString()
  const fullPath = searchParams
    ? `${backendPath}?${searchParams}`
    : backendPath

  const res = await fetchBackend(fullPath, {
    method: "GET",
    headers: {
      "x-client-id": session.clientId || "",
      "x-user-role": session.role,
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { path } = await params
  const backendPath = "/" + path.join("/")

  const body = await request.json()

  const res = await fetchBackend(backendPath, {
    method: "POST",
    body,
    headers: {
      "x-client-id": session.clientId || "",
      "x-user-role": session.role,
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}