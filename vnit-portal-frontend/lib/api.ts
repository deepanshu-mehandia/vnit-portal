export async function api(url: string, options: any = {}) {

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const res = await fetch(`http://127.0.0.1:8000${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  })

  if (res.status === 401) {
    window.location.href = "/login"
  }

  return res.json()
}
