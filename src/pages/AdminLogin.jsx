import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { useDemoAuth } from "../hooks/useDemoAuth";
import { loginDemo } from "../services/demoAuth";
import "../styles/adminAuth.css";

export default function AdminLogin() {
  const authenticated = useDemoAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (authenticated) return <Navigate to="/admin" replace />;

  function submit(event) {
    event.preventDefault();
    const result = loginDemo(email, password);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="admin-login container" dir="rtl">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <img
          className="admin-login-logo"
          src="/images/b40-logo.png"
          alt="B40 SPORTS"
          width="72"
          height="72"
        />
        <span className="eyebrow">B40 / مساحة الإدارة</span>
        <h1 id="admin-login-title">تسجيل دخول الإدارة</h1>
        <p className="admin-login-intro">
          أهلاً فيك. سجّل دخولك لمعاينة لوحة التحكم.
        </p>
        <p className="admin-demo-note" id="admin-demo-note">
          دخول تجريبي لعرض المشروع فقط، وليس نظام تسجيل دخول آمن للإنتاج.
        </p>
        <form onSubmit={submit} aria-describedby="admin-demo-note">
          <label htmlFor="demo-email">البريد الإلكتروني</label>
          <input
            id="demo-email"
            name="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            dir="ltr"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            required
            maxLength={254}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "admin-login-error" : undefined}
          />
          <label htmlFor="demo-password">كلمة المرور</label>
          <div className="admin-password-field">
            <input
              id="demo-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
              maxLength={128}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "admin-login-error" : undefined}
            />
            <button
              type="button"
              className="icon-button admin-password-toggle"
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
              aria-pressed={showPassword}
              aria-controls="demo-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <p
            className="error admin-login-error"
            id="admin-login-error"
            role="alert"
          >
            {error}
          </p>
          <button className="button full" type="submit">
            تسجيل الدخول
            <LogIn size={18} />
          </button>
        </form>
        <Link className="text-link admin-login-back" to="/">
          العودة إلى المتجر
          <ArrowLeft size={16} />
        </Link>
      </section>
    </div>
  );
}
