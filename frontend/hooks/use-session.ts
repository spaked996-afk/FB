"use client"

import useSWR from "swr"

interface Session {
  username: string
  role: "admin" | "client"
  clientId?: string
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Unauthorized")
    return res.json()
  })

export function useSession() {
  const { data, error, isLoading } = useSWR<Session>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return {
    session: data ?? null,
    isLoading,
    isError: !!error,
  }
}
