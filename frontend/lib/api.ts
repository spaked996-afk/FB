const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown> | FormData | string
}

export async function fetchBackend(
  path: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { body, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  }

  let processedBody: string | FormData | undefined

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
    processedBody = typeof body === "string" ? body : JSON.stringify(body)
  } else if (body instanceof FormData) {
    processedBody = body
  }

  const url = `${FASTAPI_URL}${path}`

  return fetch(url, {
    ...rest,
    headers,
    body: processedBody,
  })
}
