import { Sun, Moon, Settings as SettingsIcon } from "lucide-react";
import type { Theme } from "../types";
import type { AuthUser } from "../api";
import { TraceDivider } from "../lib";

export function Settings({ theme, setTheme, user }: { theme: Theme; setTheme: (t: Theme) => void; user: AuthUser }) {
  return (
    <div className="page narrow">
      <div className="page-head">
        <div className="page-title"><span className="page-title-icon"><SettingsIcon size={19} /></span><h1>Settings</h1></div>
        <p className="page-sub">Appearance and account preferences.</p>
      </div>
      <TraceDivider />

      <section className="panel">
        <div className="panel-head"><h2>Appearance</h2></div>
        <div className="settings-row">
          <div>
            <div className="settings-row-title">Theme</div>
            <div className="settings-row-note">Switch between light and dark mode.</div>
          </div>
          <div className="theme-switch">
            <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}><Sun size={13} /> Light</button>
            <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}><Moon size={13} /> Dark</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Account</h2></div>
        <div className="form-grid">
          <div className="field"><label>Username</label><input value={`@${user.username}`} readOnly /></div>
          <div className="field"><label>Email</label><input value={user.email} readOnly /></div>
          <div className="field"><label>Display name</label><input value={user.name} readOnly /></div>
          <div className="field"><label>Role</label><input value={user.role} readOnly /></div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Data</h2></div>
        <div className="settings-row">
          <div>
            <div className="settings-row-title">Knowledge base size</div>
            <div className="settings-row-note">Optimized for large libraries — search and filtering stay fast beyond 10,000 entries.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
