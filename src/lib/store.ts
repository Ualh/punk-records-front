// Simple local storage helpers
const get = (key: string, fallback: string) => {
  try { return localStorage.getItem(`sb_${key}`) ?? fallback; } catch { return fallback; }
};
const set = (key: string, value: string) => {
  try { localStorage.setItem(`sb_${key}`, value); } catch {}
};

export const store = {
  getLastScreen: () => get("screen", "/"),
  setLastScreen: (s: string) => set("screen", s),
  getSidebarCollapsed: () => get("sidebar", "false") === "true",
  setSidebarCollapsed: (v: boolean) => set("sidebar", String(v)),
  getLastSource: () => get("source", ""),
  setLastSource: (id: string) => set("source", id),
};
