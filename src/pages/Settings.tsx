import { Settings as SettingsIcon } from "lucide-react";
import type { AuthUser } from "../api";
import { TraceDivider } from "../lib";

export function Settings({ user }: { user: AuthUser }) {
  return (
    <div className="page narrow">
      <div className="page-head">
        <div className="page-title"><span className="page-title-icon"><SettingsIcon size={19} /></span><h1>Settings</h1></div>
        <p className="page-sub">Your account details.</p>
      </div>
      <TraceDivider />

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
