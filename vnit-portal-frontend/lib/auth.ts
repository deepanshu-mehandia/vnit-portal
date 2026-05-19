export function isAuthenticated(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("student_id");
  window.location.href = "/";
}

export function getUserRole(): string | null {
  return localStorage.getItem("role");
}