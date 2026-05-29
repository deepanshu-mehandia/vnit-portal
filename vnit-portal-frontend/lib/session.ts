/**
 * Returns query-string params for the currently selected session.
 * Pass append=true to get "?session_id=2&semester=2",
 * or append=false to get a plain object { session_id, semester }.
 */
export function sessionParams(): { session_id: string; semester: string } {
  if (typeof window === "undefined") return { session_id: "", semester: "" };
  return {
    session_id: localStorage.getItem("session_id")    || "",
    semester:   localStorage.getItem("current_semester") || "",
  };
}

/** Returns a query-string like "?session_id=2&semester=2" (omits empty values) */
export function sessionQuery(): string {
  const p = sessionParams();
  const parts: string[] = [];
  if (p.session_id) parts.push(`session_id=${p.session_id}`);
  if (p.semester)   parts.push(`semester=${p.semester}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function safeGet(key: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
}