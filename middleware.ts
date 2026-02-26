import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-dev-secret-change-in-production-32"
)

const publicPaths = ["/login", "/api/auth/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("aivek_session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)

    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("aivek_session")
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
