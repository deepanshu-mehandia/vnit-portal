const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options: any = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return res.json();
}