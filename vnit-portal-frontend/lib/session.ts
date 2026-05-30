export function sessionParams(): { session_id: string; semester: string } {
  if (typeof window === "undefined") return { session_id: "", semester: "" };
  return {
    session_id: localStorage.getItem("session_id")       || "",
    semester:   localStorage.getItem("current_semester") || "",
  };
}

/**
 * Returns ?session_id=X when a session was selected at login.
 * Falls back to ?semester=X only when no session_id is available.
 * Never sends both — backend uses AND which causes false negatives.
 */
export function sessionQuery(): string {
  if (typeof window === "undefined") return "";
  const session_id = localStorage.getItem("session_id") || "";
  const semester   = localStorage.getItem("current_semester") || "";
  if (session_id && session_id !== "0") return `?session_id=${session_id}`;
  if (semester)                         return `?semester=${semester}`;
  return "";
}

export function safeGet(key: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
}