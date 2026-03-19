const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function api(url: string, options: any = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    return;
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "API error");
  }

  return res.json();
}
