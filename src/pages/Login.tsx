import { useState } from "react";
import { LogIn, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Client-side validation mirrors the server so users get instant feedback.
  const validate = (): string | null => {
    if (!USERNAME_RE.test(username.trim())) {
      return "Username must be 3–30 characters — letters, numbers, or underscore.";
    }
    if (!password) return "Please enter your password.";
    if (mode === "register") {
      if (!name.trim()) return "Please enter your full name.";
      if (!EMAIL_RE.test(email.trim())) return "Please enter a valid email address.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return "Password must include at least one letter and one number.";
      }
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) { setError(problem); return; }
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(username.trim(), password);
      else await register(username.trim(), email.trim(), password, name.trim(), role.trim() || "Engineer");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next); setError(""); setPassword(""); setShowPw(false);
  };

  return (
    <div className="auth-screen">
      <AuthStyle />
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-app-name">Embedded Solutions</div>
        <h2>{mode === "login" ? "Sign in" : "Create your account"}</h2>
        <p className="auth-sub">
          {mode === "login" ? "Sign in with your username to access your knowledge base." : "Set up an account to start capturing your own knowledge."}
        </p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        {mode === "register" && (
          <label className="auth-field">
            <span>Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramu S." autoComplete="name" required />
          </label>
        )}

        <label className="auth-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. ramu_s"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </label>

        {mode === "register" && (
          <>
            <label className="auth-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
            </label>
            <label className="auth-field">
              <span>Role <em>(optional)</em></span>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Hardware Design Engineer" />
            </label>
          </>
        )}

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-pw">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Min 8 chars, letters + numbers" : "Password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
            <button
              type="button" className="auth-pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              aria-pressed={showPw}
              title={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {mode === "register" && (
            <em className="auth-hint">At least 8 characters, including a letter and a number.</em>
          )}
        </label>

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? <Loader2 size={16} className="spin" /> : mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div className="auth-switch">
          {mode === "login" ? (
            <>New here? <button type="button" onClick={() => switchMode("register")}>Create an account</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => switchMode("login")}>Sign in</button></>
          )}
        </div>
      </form>
    </div>
  );
}

function AuthStyle() {
  return (
    <style>{`
      .auth-screen {
        position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
        padding: 24px; background: var(--bg); color: var(--text); font-family: var(--font-body);
        overflow-y: auto;
      }
      .auth-card {
        width: 100%; max-width: 380px; display: flex; flex-direction: column;
        background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 28px 26px;
      }
      .auth-app-name { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px; }
      .auth-card h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .auth-sub { font-size: 13px; color: var(--text-secondary); margin: 0 0 20px; line-height: 1.5; }
      .auth-error { background: var(--danger-soft); color: var(--danger); font-size: 13px; padding: 9px 12px; border-radius: 5px; margin-bottom: 16px; border: 1px solid var(--danger); }
      .auth-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
      .auth-field span { font-size: 12px; font-weight: 600; color: var(--text); }
      .auth-field em { font-weight: 400; font-style: normal; color: var(--text-secondary); }
      .auth-field input {
        border: 1px solid var(--border); background: #fff; color: var(--text);
        border-radius: 5px; padding: 9px 11px; font-size: 14px; font-family: var(--font-body); width: 100%;
      }
      .auth-field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--ring); }
      .auth-pw { position: relative; display: flex; align-items: center; }
      .auth-pw input { flex: 1; padding-right: 38px; }
      .auth-pw-toggle {
        position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
        width: 30px; height: 30px; border: none; background: transparent; color: var(--text-secondary);
        display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 5px;
      }
      .auth-pw-toggle:hover { color: var(--text); background: var(--surface-alt); }
      .auth-hint { display: block; margin-top: 5px; font-size: 11.5px; font-style: normal; color: var(--text-secondary); }
      .auth-submit {
        display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px;
        background: var(--accent); color: #fff; border: 1px solid var(--accent); border-radius: 5px;
        padding: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-body);
      }
      .auth-submit:hover:not(:disabled) { background: var(--accent-strong); border-color: var(--accent-strong); }
      .auth-submit:disabled { opacity: .6; cursor: not-allowed; }
      .auth-switch { margin-top: 18px; font-size: 13px; color: var(--text-secondary); text-align: center; }
      .auth-switch button { background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; font-size: 13px; padding: 0; font-family: var(--font-body); }
      .auth-switch button:hover { text-decoration: underline; }
      .spin { animation: ekbSpin 1s linear infinite; }
      @keyframes ekbSpin { to { transform: rotate(360deg); } }
    `}</style>
  );
}
