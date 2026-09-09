// DEMO ONLY: these deliberately public presentation credentials and localStorage
// flag are NOT secure authentication. Anyone can read them or bypass this guard.
// Replace this entire demo flow with backend authentication and server-side
// authorization before production. Never put real credentials in this file.
export const DEMO_EMAIL = "demo@b40.example";
export const DEMO_PASSWORD = "B40-Demo-2026!";
const storageKey = "b40-demo-admin-auth";
const sessionValue = "b40-presentation-v1";
const changeEvent = "b40:demo-auth-change";

export function getDemoSession() {
  try {
    return localStorage.getItem(storageKey) === sessionValue;
  } catch {
    return false;
  }
}

export function subscribeDemoSession(notify) {
  const onStorage = (event) => {
    if (event.key === storageKey || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, notify);
  };
}

export function loginDemo(email, password) {
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  }
  try {
    // Only the demo flag is persisted, never the email/password or cart data.
    localStorage.setItem(storageKey, sessionValue);
    window.dispatchEvent(new Event(changeEvent));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "تعذّر حفظ تسجيل الدخول. اسمح بالتخزين المحلي في المتصفح ثم حاول مجدداً.",
    };
  }
}

export function logoutDemo() {
  // Remove only demo auth; preserve the storefront cart and other local data.
  localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(changeEvent));
}
