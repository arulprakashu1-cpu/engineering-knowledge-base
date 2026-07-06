import { useState } from "react";
import { CircuitBoard, Sun, Moon, LogIn, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import type { Theme } from "../types";
import { useAuth } from "../auth/AuthContext";
import { HeroScene } from "../three/HeroScene";
import { ApiError } from "../api";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
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

  // Client-side validation mirrors the server so users get instant, secure feedback.
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

      <button
        className="auth-theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme" title="Toggle theme"
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Visual 3D panel */}
      <div className="auth-visual">
        <div className="auth-visual-canvas"><HeroScene theme={theme} /></div>
        <div className="auth-visual-scrim" />
        <div className="auth-visual-content">
          <div className="auth-brand"><span className="auth-brand-mark"><CircuitBoard size={20} /></span> Engineering Knowledge Base</div>
          <h1>Every lesson learned,<br />wired into one place.</h1>
          <p>Requirements, checklists, lessons learned, and references for high-speed interfaces, ICs, and board bring-up — searchable and visual in 3D.</p>
        </div>
      </div>

      {/* Auth form */}
      <div className="auth-form-side">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-brand"><span className="auth-brand-mark sm"><CircuitBoard size={16} /></span> Engineering KB</div>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
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
              inputMode="text"
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
                placeholder={mode === "register" ? "Min 8 chars, letters + numbers" : "••••••••"}
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
    </div>
  );
}

function AuthStyle() {
  return (
    <style>{`
      .auth-screen {
        position: fixed; inset: 0; display: grid; grid-template-columns: 1.05fr 1fr;
        background: var(--bg-deep, var(--bg)); color: var(--text); font-family: var(--font-body);
      }
      .auth-theme-toggle {
        position: fixed; top: 16px; right: 16px; z-index: 10;
        width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border);
        background: var(--surface); color: var(--text-secondary); cursor: pointer;
        -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center;
        transition: color .15s, border-color .15s, box-shadow .15s;
      }
      .auth-theme-toggle:hover { color: var(--accent); border-color: var(--border-strong); box-shadow: var(--glow-accent); }

      /* visual panel */
      .auth-visual { position: relative; overflow: hidden; }
      .auth-visual-canvas { position: absolute; inset: 0; }
      .auth-visual-scrim { position: absolute; inset: 0; }
      .ekb-root[data-theme="light"] .auth-visual-scrim {
        background: linear-gradient(180deg, rgba(242,245,246,0.28), rgba(242,245,246,0.74) 78%, rgba(242,245,246,0.92));
      }
      .ekb-root[data-theme="dark"] .auth-visual-scrim {
        background:
          radial-gradient(80% 60% at 30% 88%, rgba(61,224,206,0.10), transparent 60%),
          linear-gradient(180deg, rgba(4,7,10,0.30), rgba(4,7,10,0.70) 72%, rgba(4,7,10,0.94));
      }
      .auth-visual-content { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: flex-end; padding: 52px; }
      .auth-brand { display: inline-flex; align-items: center; gap: 11px; font-family: var(--font-display); font-weight: 700; font-size: 14px; margin-bottom: 24px; letter-spacing: 0.01em; }
      .auth-brand-mark {
        width: 36px; height: 36px; border-radius: 10px;
        background: linear-gradient(145deg, var(--accent-soft), transparent 140%);
        color: var(--accent);
        display: inline-flex; align-items: center; justify-content: center;
        box-shadow: inset 0 0 0 1px var(--border-strong, var(--border)), var(--glow-accent);
      }
      .auth-brand-mark.sm { width: 28px; height: 28px; border-radius: 8px; }
      .auth-visual-content h1 {
        font-family: var(--font-display); font-size: clamp(30px, 3.2vw, 44px); font-weight: 700;
        letter-spacing: -0.028em; line-height: 1.06; margin: 0 0 14px;
      }
      .ekb-root[data-theme="dark"] .auth-visual-content h1 {
        background: linear-gradient(100deg, var(--text) 20%, var(--accent-strong) 60%, var(--copper) 105%);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent; color: transparent;
        filter: drop-shadow(0 2px 22px rgba(61,224,206,0.16));
      }
      .auth-visual-content p { max-width: 440px; font-size: 14.5px; line-height: 1.6; color: var(--text-secondary); margin: 0; }

      /* form side — glass card floating over a faint circuit grid */
      .auth-form-side { position: relative; display: flex; align-items: center; justify-content: center; padding: 32px; overflow-y: auto; }
      .auth-form-side::before {
        content: ""; position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(560px 420px at 78% 18%, var(--accent-soft, rgba(61,224,206,0.08)), transparent 65%),
          linear-gradient(var(--grid-line, rgba(61,224,206,0.03)) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line, rgba(61,224,206,0.03)) 1px, transparent 1px);
        background-size: auto, 42px 42px, 42px 42px;
      }
      .auth-card {
        position: relative; width: 100%; max-width: 400px; display: flex; flex-direction: column;
        background: var(--surface);
        -webkit-backdrop-filter: blur(20px) saturate(1.25); backdrop-filter: blur(20px) saturate(1.25);
        border: 1px solid var(--border); border-radius: 16px; padding: 30px 28px;
        box-shadow: var(--shadow-lift, var(--shadow));
        animation: ekbFadeUp .5s cubic-bezier(.22,.61,.36,1) both;
      }
      .auth-card::before {
        content: ""; position: absolute; inset: 0 0 auto 0; height: 1px; border-radius: 16px 16px 0 0;
        background: linear-gradient(90deg, transparent, var(--hairline, rgba(255,255,255,0.08)) 30%, var(--hairline, rgba(255,255,255,0.08)) 70%, transparent);
        pointer-events: none;
      }
      .auth-card-brand { display: none; align-items: center; gap: 9px; font-family: var(--font-display); font-weight: 700; font-size: 14px; margin-bottom: 18px; }
      .auth-card h2 { font-family: var(--font-display); font-size: 25px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 6px; }
      .ekb-root[data-theme="dark"] .auth-card h2 { text-shadow: 0 0 26px rgba(61,224,206,0.18); }
      .auth-sub { font-size: 13.5px; color: var(--text-secondary); margin: 0 0 22px; }
      .auth-error { background: var(--danger-soft); color: var(--danger); font-size: 13px; font-weight: 500; padding: 10px 13px; border-radius: 9px; margin-bottom: 16px; border: 1px solid color-mix(in srgb, var(--danger) 28%, transparent); }
      .auth-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
      .auth-field span { font-size: 11px; font-weight: 600; color: var(--text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.07em; }
      .auth-field em { font-weight: 400; font-style: normal; opacity: .7; text-transform: none; letter-spacing: 0; }
      .auth-field input {
        border: 1px solid var(--border); background: var(--surface-alt, var(--surface)); color: var(--text);
        border-radius: 9px; padding: 10px 12px; font-size: 14px; font-family: var(--font-body);
        transition: border-color .15s, box-shadow .15s, background .15s;
      }
      .auth-field input::placeholder { color: var(--text-secondary); opacity: .6; }
      .auth-field input:focus {
        outline: none; border-color: var(--accent); background: transparent;
        box-shadow: 0 0 0 3px var(--ring, color-mix(in srgb, var(--accent) 18%, transparent)), var(--glow-accent, none);
      }
      .auth-submit {
        display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px;
        background: var(--btn-grad, var(--accent)); color: var(--btn-fg, #fff); border: none; border-radius: 10px;
        padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--font-body); letter-spacing: 0.01em;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 2px 10px rgba(0,0,0,0.2);
        transition: transform .12s, box-shadow .12s, filter .12s;
      }
      .auth-submit:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), var(--btn-glow, 0 6px 16px rgba(0,0,0,0.25)); }
      .auth-submit:disabled { opacity: .65; cursor: not-allowed; }
      .auth-pw { position: relative; display: flex; align-items: center; }
      .auth-pw input { flex: 1; padding-right: 40px; }
      .auth-pw-toggle {
        position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
        width: 30px; height: 30px; border: none; background: transparent; color: var(--text-secondary);
        display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 7px;
        transition: color .12s, background .12s;
      }
      .auth-pw-toggle:hover { color: var(--accent); background: var(--accent-soft); }
      .auth-hint { display: block; margin-top: 6px; font-size: 11px; font-style: normal; color: var(--text-secondary); opacity: .85; letter-spacing: 0; text-transform: none; }
      .auth-switch { margin-top: 20px; font-size: 13px; color: var(--text-secondary); text-align: center; }
      .auth-switch button { background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; font-size: 13px; padding: 0; font-family: var(--font-body); }
      .auth-switch button:hover { text-decoration: underline; color: var(--accent-strong); }
      .ekb-root[data-theme="light"] .auth-switch button:hover { color: var(--accent-strong); }
      .spin { animation: ekbSpin 1s linear infinite; }
      @keyframes ekbSpin { to { transform: rotate(360deg); } }

      @media (prefers-reduced-motion: reduce) {
        .auth-card { animation: none; }
        .auth-submit:hover, .auth-demo:hover { transform: none; }
      }

      @media (max-width: 860px) {
        .auth-screen { grid-template-columns: 1fr; }
        .auth-visual { display: none; }
        .auth-card-brand { display: flex; }
        .auth-card { padding: 26px 20px; }
      }
    `}</style>
  );
}
