export async function api(url: string, options: any = {}) {

  const token = localStorage.getItem("token")

  return fetch("http://127.0.0.1:8000" + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
}
