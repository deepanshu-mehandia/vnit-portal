const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function api(url: string, options: any = {}) {

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  })

  if (res.status === 401) {
    window.location.href = "/login"
    return
  }

  if (!res.ok) {
    throw new Error("API error")
  }

  return res.json()
}
