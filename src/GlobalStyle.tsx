export function GlobalStyle() {
  return (
    <style>{`
      .ekb-root, .ekb-root * { box-sizing: border-box; }
      .ekb-root {
        --font-display: 'Space Grotesk', sans-serif;
        --font-body: 'Inter', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
        --indigo: #6366F1;
      }
      /* ============================================================
         LIGHT — clean lab-bench: bright, precise, teal ink on paper
         ============================================================ */
      .ekb-root[data-theme="light"] {
        --bg: #F2F5F6; --bg-deep: #E9EEF0;
        --surface: #FFFFFF; --surface-solid: #FFFFFF; --surface-alt: #EBF1F2;
        --border: #DBE4E6; --border-strong: #B9CDD0;
        --text: #14191D; --text-secondary: #58676D;
        --accent: #0E7C82; --accent-strong: #0A5E63; --accent-soft: #DFF1EF;
        --copper: #AD5F1B; --copper-soft: #F9EDDF;
        --danger: #C3423A; --danger-soft: #FAE9E7;
        --shadow: 0 1px 2px rgba(15,25,30,0.05), 0 10px 28px rgba(15,25,30,0.06);
        --shadow-lift: 0 14px 34px rgba(15,25,30,0.12);
        --glow-accent: 0 0 0 rgba(0,0,0,0);
        --btn-grad: linear-gradient(180deg, #17939A 0%, #0E7C82 100%);
        --btn-fg: #FFFFFF;
        --btn-glow: 0 6px 16px rgba(14,124,130,0.30);
        --hairline: rgba(255,255,255,0.85);
        --grid-line: rgba(14,124,130,0.045);
        --ring: rgba(14,124,130,0.20);
        --scan: transparent;
      }
      /* ============================================================
         DARK — near-black PCB, glass surfaces, neon teal + warm copper
         ============================================================ */
      .ekb-root[data-theme="dark"] {
        --bg: #070B0F; --bg-deep: #04070A;
        --surface: rgba(15, 24, 30, 0.66); --surface-solid: #0D161B; --surface-alt: rgba(126, 208, 214, 0.07);
        --border: rgba(110, 206, 205, 0.14); --border-strong: rgba(61, 224, 206, 0.42);
        --text: #E9F5F2; --text-secondary: #90A6AC;
        --accent: #3DE0CE; --accent-strong: #8CF5E7; --accent-soft: rgba(61, 224, 206, 0.10);
        --copper: #E8A566; --copper-soft: rgba(232, 165, 102, 0.12);
        --danger: #F0796E; --danger-soft: rgba(240, 121, 110, 0.13);
        --shadow: 0 1px 0 rgba(233,245,242,0.04) inset, 0 14px 36px rgba(2, 5, 8, 0.5);
        --shadow-lift: 0 1px 0 rgba(233,245,242,0.06) inset, 0 18px 44px rgba(2, 5, 8, 0.62), 0 0 28px rgba(61,224,206,0.09);
        --glow-accent: 0 0 22px rgba(61,224,206,0.16);
        --btn-grad: linear-gradient(180deg, #64EDDD 0%, #2BC7B4 100%);
        --btn-fg: #03231E;
        --btn-glow: 0 6px 22px rgba(61,224,206,0.35), 0 0 44px rgba(61,224,206,0.14);
        --hairline: rgba(233,245,242,0.07);
        --grid-line: rgba(61, 224, 206, 0.035);
        --ring: rgba(61, 224, 206, 0.22);
        --scan: rgba(61,224,206,0.02);
      }
      .ekb-root {
        display: flex; min-height: 100vh; background: var(--bg); color: var(--text);
        font-family: var(--font-body); font-size: 14px; line-height: 1.5;
        position: relative; isolation: isolate;
        -webkit-font-smoothing: antialiased;
      }
      /* PCB substrate: ambient glow pools + faint circuit grid, fixed behind everything */
      .ekb-root::before {
        content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
        background:
          radial-gradient(1000px 640px at 12% -10%, rgba(61,224,206,0.075), transparent 62%),
          radial-gradient(1100px 720px at 92% 112%, rgba(99,102,241,0.075), transparent 62%),
          radial-gradient(760px 520px at 82% -14%, rgba(232,165,102,0.055), transparent 60%),
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
          linear-gradient(160deg, var(--bg) 0%, var(--bg-deep) 100%);
        background-size: auto, auto, auto, 46px 46px, 46px 46px, auto;
      }
      .ekb-root[data-theme="light"]::before {
        background:
          radial-gradient(1000px 640px at 12% -10%, rgba(14,124,130,0.06), transparent 62%),
          radial-gradient(1100px 720px at 92% 112%, rgba(99,102,241,0.05), transparent 62%),
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
          linear-gradient(160deg, var(--bg) 0%, var(--bg-deep) 100%);
        background-size: auto, auto, 46px 46px, 46px 46px, auto;
      }
      .ekb-root[data-theme="dark"] { background: var(--bg-deep); }
      .ekb-root ::selection { background: rgba(61,224,206,0.32); color: inherit; }
      .ekb-root[data-theme="light"] ::selection { background: rgba(14,124,130,0.22); }

      /* thin neon scrollbars */
      .ekb-root ::-webkit-scrollbar { width: 10px; height: 10px; }
      .ekb-root ::-webkit-scrollbar-track { background: transparent; }
      .ekb-root ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
      .ekb-root ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); border: 2px solid transparent; background-clip: content-box; }

      /* accessible neon focus ring everywhere */
      .ekb-root :where(button, a, input, select, textarea, [tabindex]):focus-visible {
        outline: 2px solid var(--accent); outline-offset: 2px;
        box-shadow: 0 0 0 4px var(--ring);
        border-radius: 6px;
      }

      /* ---------- Sidebar ---------- */
      .sidebar {
        width: 236px; flex-shrink: 0;
        background: var(--surface);
        -webkit-backdrop-filter: blur(18px) saturate(1.25); backdrop-filter: blur(18px) saturate(1.25);
        border-right: 1px solid var(--border);
        display: flex; flex-direction: column; padding: 18px 14px; gap: 22px; position: sticky; top: 0; height: 100vh;
        z-index: 6;
      }
      .ekb-root[data-theme="dark"] .sidebar {
        background: linear-gradient(180deg, rgba(15,24,30,0.78) 0%, rgba(10,17,22,0.85) 100%);
        box-shadow: 1px 0 0 rgba(61,224,206,0.05), inset -1px 0 24px rgba(61,224,206,0.02);
      }
      .brand { display: flex; align-items: center; gap: 10px; padding: 0 4px; position: relative; }
      .sidebar-close { display: none; margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer; }
      .menu-btn { display: none; margin-right: 2px; }
      .sidebar-overlay { display: none; }
      .brand-mark {
        width: 32px; height: 32px; border-radius: 8px;
        background: linear-gradient(145deg, var(--accent-soft), transparent 130%);
        color: var(--accent);
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        box-shadow: inset 0 0 0 1px var(--border), var(--glow-accent);
      }
      .brand-title { font-family: var(--font-display); font-weight: 700; font-size: 13px; line-height: 1.25; letter-spacing: -0.01em; }
      .nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
      .nav-item {
        display: flex; align-items: center; gap: 10px; padding: 8px 11px; border-radius: 8px; border: 1px solid transparent;
        background: transparent; color: var(--text-secondary); font-size: 13.5px; font-weight: 500; text-align: left; cursor: pointer;
        font-family: var(--font-body); transition: background .14s, color .14s, border-color .14s, box-shadow .14s;
      }
      .nav-item:hover { background: var(--surface-alt); color: var(--text); }
      .nav-item.active {
        background: linear-gradient(90deg, var(--accent-soft) 0%, transparent 130%);
        border-color: var(--border);
        color: var(--accent-strong); font-weight: 600;
        box-shadow: var(--glow-accent);
      }
      .ekb-root[data-theme="light"] .nav-item.active { color: var(--accent); box-shadow: none; }
      .sidebar-footer { border-top: 1px solid var(--border); padding-top: 12px; }
      .user-chip { display: flex; align-items: center; gap: 9px; padding: 4px; }
      .avatar { width: 30px; height: 30px; border-radius: 8px; background: var(--copper-soft); color: var(--copper);
        display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 11px; font-weight: 600; flex-shrink:0;
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--copper) 30%, transparent); }
      .user-name { font-size: 12.5px; font-weight: 600; }
      .user-role { font-size: 11px; color: var(--text-secondary); }

      /* ---------- Topbar ---------- */
      .main-col { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; z-index: 1; }
      .topbar { height: 58px; flex-shrink: 0; border-bottom: 1px solid var(--border);
        background: var(--surface);
        -webkit-backdrop-filter: blur(18px) saturate(1.25); backdrop-filter: blur(18px) saturate(1.25);
        display: flex; align-items: center; gap: 16px; padding: 0 20px; position: sticky; top: 0; z-index: 5; }
      .ekb-root[data-theme="dark"] .topbar { background: rgba(9, 15, 20, 0.72); box-shadow: 0 1px 0 rgba(61,224,206,0.05); }
      .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); font-weight: 500; width: 200px; flex-shrink: 0;
        font-family: var(--font-mono); letter-spacing: 0.01em; }
      .topbar-search { flex: 1; max-width: 520px; position: relative; display: flex; align-items: center; }
      .topbar-search-icon { position: absolute; left: 11px; color: var(--text-secondary); }
      .topbar-search input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 9px; border: 1px solid var(--border);
        background: var(--surface-alt); color: var(--text); font-size: 13px; font-family: var(--font-body);
        transition: border-color .15s, box-shadow .15s, background .15s; }
      .topbar-search input::placeholder { color: var(--text-secondary); opacity: .75; }
      .topbar-search input:focus { outline: none; border-color: var(--accent); background: var(--surface-solid);
        box-shadow: 0 0 0 3px var(--ring), var(--glow-accent); }
      .icon-btn { margin-left: auto; width: 33px; height: 33px; border-radius: 9px; border: 1px solid var(--border); background: transparent;
        color: var(--text-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer; }
      .icon-btn:hover { color: var(--accent); background: var(--surface-alt); border-color: var(--border-strong); box-shadow: var(--glow-accent); }

      /* ---------- Content / page ---------- */
      .content { flex: 1; padding: 28px 32px 60px; max-width: 1200px; width: 100%; }
      .page.narrow { max-width: 640px; }
      .page-head h1 { font-family: var(--font-display); font-size: 25px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 4px; }
      .ekb-root[data-theme="dark"] .page-head h1,
      .ekb-root[data-theme="dark"] .page-title h1 { text-shadow: 0 0 28px rgba(61,224,206,0.22); }
      .page-sub { color: var(--text-secondary); font-size: 13.5px; margin: 0 0 14px; }
      .trace-divider { display: block; margin: 4px 0 22px; }

      /* ---------- Stat cards ---------- */
      .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
      .stat-card { position: relative; overflow: hidden; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
        padding: 18px 20px; box-shadow: var(--shadow); }
      .stat-card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 1px;
        background: linear-gradient(90deg, transparent, var(--hairline) 30%, var(--hairline) 70%, transparent); pointer-events: none; }
      .stat-card::after { content: ""; position: absolute; right: -34px; top: -34px; width: 110px; height: 110px; border-radius: 50%;
        background: radial-gradient(closest-side, var(--accent-soft), transparent); opacity: .8; pointer-events: none;
        transition: opacity .2s ease, transform .2s ease; }
      .stat-card:hover::after { opacity: 1; transform: scale(1.25); }
      .stat-label { font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 10px;
        font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.09em; }
      .stat-value { font-family: var(--font-mono); font-size: 30px; font-weight: 600; color: var(--text); line-height: 1.1; }

      /* ---------- Panels / rows ---------- */
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
      .panel { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 15px 17px;
        box-shadow: var(--shadow); margin-bottom: 14px; overflow: hidden; }
      .panel::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 1px;
        background: linear-gradient(90deg, transparent, var(--hairline) 30%, var(--hairline) 70%, transparent); pointer-events: none; }
      .panel-head { display: flex; align-items: center; gap: 7px; color: var(--text-secondary); margin-bottom: 10px; }
      .panel-head h2 { font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; color: var(--text-secondary); margin: 0;
        font-family: var(--font-mono); }
      .panel-head svg { color: var(--accent); }
      .panel-head.standalone { margin: 4px 0 12px; }
      .panel-empty { font-size: 12.5px; color: var(--text-secondary); padding: 6px 2px; }
      .row-list { display: flex; flex-direction: column; gap: 2px; }
      .row-list.compact .row-item { padding: 7px 6px; }
      .row-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 8px; border-radius: 8px;
        border: none; background: transparent; text-align: left; cursor: pointer; width: 100%; font-family: var(--font-body); }
      .row-item:hover { background: var(--surface-alt); }
      .row-item-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
      .row-item-title { font-size: 13px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .row-item-sub { font-size: 11.5px; color: var(--text-secondary); }
      .row-item-date { font-size: 11.5px; color: var(--text-secondary); font-family: var(--font-mono); flex-shrink: 0; }
      .row-item-chevron { color: var(--text-secondary); flex-shrink: 0; }

      /* ---------- Interface / IC cards ---------- */
      .interface-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 13px; }
      .ic-card { position: relative; display: flex; text-align: left; background: var(--surface); border: 1px solid var(--border);
        border-radius: 12px; padding: 14px 14px 14px 19px; cursor: pointer; overflow: hidden; box-shadow: var(--shadow); }
      .ic-card::after { content: ""; position: absolute; left: 20%; right: 20%; bottom: -22px; height: 44px; border-radius: 50%;
        background: radial-gradient(closest-side, var(--accent-soft), transparent); opacity: 0; transition: opacity .22s ease; pointer-events: none; }
      .ic-card:hover { border-color: var(--border-strong); }
      .ic-card:hover::after { opacity: 1; }
      .ic-card-pins { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; display: flex; flex-direction: column; justify-content: space-evenly; padding: 8px 0; }
      .ic-card-pins span { width: 6px; height: 3px; background: var(--border-strong); border-radius: 0 1.5px 1.5px 0; transition: background .18s ease, box-shadow .18s ease; }
      .ic-card:hover .ic-card-pins span { background: var(--accent); box-shadow: 0 0 8px var(--accent); }
      .ic-card-body { flex: 1; min-width: 0; }
      .ic-card-title { display: flex; align-items: center; gap: 7px; font-family: var(--font-display); font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--text); }
      .ic-card-title svg { color: var(--accent); }
      .ic-card-total { font-family: var(--font-mono); font-size: 21px; font-weight: 600; margin-bottom: 8px; }
      .ic-card-total span { font-family: var(--font-body); font-size: 11px; font-weight: 400; color: var(--text-secondary); }
      .ic-card-breakdown { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); }
      .ic-card-breakdown span { display: flex; align-items: center; gap: 4px; }
      .ic-card-breakdown i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px currentColor; }

      /* ---------- Badges / chips (PCB silkscreen labels) ---------- */
      .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 600; padding: 3px 9px 3px 7px;
        border-radius: 5px; background: var(--surface-alt); border: 1px solid var(--border); color: var(--text);
        font-family: var(--font-mono); letter-spacing: 0.05em; text-transform: uppercase; }
      .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dot); flex-shrink: 0; box-shadow: 0 0 7px var(--dot); }
      .pill { font-family: var(--font-mono); font-size: 11px; padding: 3px 8px; border-radius: 5px; background: var(--surface-alt); border: 1px solid var(--border); color: var(--text-secondary); }
      .pill.mono { color: var(--copper); border-color: color-mix(in srgb, var(--copper) 28%, transparent); background: var(--copper-soft); }
      .tag-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 3px 9px; border-radius: 5px;
        background: var(--accent-soft); color: var(--accent-strong); font-weight: 500; font-family: var(--font-mono);
        border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); }
      .ekb-root[data-theme="light"] .tag-chip { color: var(--accent); }
      .tag-chip.static { background: var(--surface-alt); color: var(--text-secondary); border: 1px solid var(--border); }
      .tag-chip button { background: none; border: none; color: inherit; cursor: pointer; display: flex; padding: 0; opacity: .7; }
      .tag-chip button:hover { opacity: 1; }

      /* ---------- Forms ---------- */
      .banner { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 9px; font-size: 13px; font-weight: 500; margin-bottom: 16px; border: 1px solid transparent; }
      .banner.success { background: var(--accent-soft); color: var(--accent-strong); border-color: color-mix(in srgb, var(--accent) 25%, transparent); box-shadow: var(--glow-accent); }
      .ekb-root[data-theme="light"] .banner.success { color: var(--accent-strong); box-shadow: none; }
      .banner.error { background: var(--danger-soft); color: var(--danger); border-color: color-mix(in srgb, var(--danger) 25%, transparent); }
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field.span-2 { grid-column: span 2; }
      .field label { font-size: 11px; font-weight: 600; color: var(--text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.07em; }
      .field .req { color: var(--danger); }
      .field input, .field select, .field textarea {
        border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 8px;
        padding: 9px 11px; font-size: 13.5px; font-family: var(--font-body); width: 100%;
        transition: border-color .15s, box-shadow .15s;
      }
      .field input::placeholder, .field textarea::placeholder { color: var(--text-secondary); opacity: .6; }
      .field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--ring), var(--glow-accent); }
      .chip-toggle-row { display: flex; flex-wrap: wrap; gap: 7px; }
      .chip-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; padding: 6px 12px;
        border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; }
      .chip-toggle .badge-dot { background: var(--dot); }
      .chip-toggle.active { background: var(--accent-soft); color: var(--accent-strong); border-color: var(--border-strong); font-weight: 600; box-shadow: var(--glow-accent); }
      .ekb-root[data-theme="light"] .chip-toggle.active { color: var(--accent); box-shadow: none; border-color: var(--accent); }
      .tag-input-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; background: var(--surface);
        transition: border-color .15s, box-shadow .15s; }
      .tag-input-row:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
      .tag-input { border: none; outline: none; flex: 1; min-width: 120px; font-size: 13px; background: transparent; color: var(--text); font-family: var(--font-body); }
      .tag-input:focus-visible { outline: none; box-shadow: none; }
      .quick-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .quick-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; padding: 3px 8px; border-radius: 20px;
        border: 1px dashed var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: var(--font-mono); }
      .quick-tag:hover { border-color: var(--accent); color: var(--accent); box-shadow: var(--glow-accent); }

      /* editor */
      .editor { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--surface); }
      .editor:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
      .editor-toolbar { display: flex; gap: 2px; padding: 6px; border-bottom: 1px solid var(--border); background: var(--surface-alt); }
      .editor-toolbar button { width: 28px; height: 28px; border: none; background: transparent; border-radius: 6px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
      .editor-toolbar button:hover { background: var(--accent-soft); color: var(--accent); }
      .editor-body { display: grid; grid-template-columns: 1fr 1fr; min-height: 220px; }
      .editor-body textarea { border: none; border-right: 1px solid var(--border); border-radius: 0; resize: vertical; min-height: 220px;
        font-family: var(--font-mono); font-size: 12.5px; padding: 12px; background: transparent; }
      .editor-body textarea:focus { box-shadow: none; }
      .editor-preview { padding: 12px 14px; overflow-y: auto; background: transparent; }
      .editor-preview-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; color: var(--text-secondary); margin-bottom: 8px; font-family: var(--font-mono); }
      .editor-preview-empty { font-size: 12.5px; color: var(--text-secondary); font-style: italic; }
      .editor-images { border-top: 1px solid var(--border); padding: 12px 14px; background: var(--surface-alt); }
      .editor-images-label { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; color: var(--text-secondary); font-family: var(--font-mono); margin-bottom: 10px; }
      .editor-images-label svg { color: var(--accent); }
      .editor-images-row { display: flex; flex-wrap: wrap; gap: 10px; }
      .editor-image-thumb { position: relative; width: 96px; }
      .editor-image-thumb img { width: 96px; height: 66px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); display: block; }
      .editor-image-thumb .editor-image-tag { display: block; margin-top: 4px; font-size: 10px; font-family: var(--font-mono); color: var(--text-secondary); text-align: center; }
      .editor-image-thumb button { position: absolute; top: -7px; right: -7px; width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--border-strong); background: var(--surface-solid); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow); transition: color .12s, border-color .12s, background .12s; }
      .editor-image-thumb button:hover { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 40%, transparent); background: var(--danger-soft); }

      .dropzone { display: flex; align-items: center; gap: 9px; border: 1.5px dashed var(--border); border-radius: 10px; padding: 16px;
        color: var(--text-secondary); font-size: 12.5px; cursor: pointer; justify-content: center; text-align: center;
        background: var(--surface-alt); transition: border-color .15s, color .15s, box-shadow .15s; }
      .dropzone:hover { border-color: var(--accent); color: var(--accent); box-shadow: var(--glow-accent); }
      .attachment-list { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
      .attachment-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); font-size: 12.5px; }
      .attachment-item span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .attachment-item button { background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; }
      .attachment-item.static { background: var(--surface-alt); }

      .form-actions { margin-top: 22px; display: flex; justify-content: flex-end; }
      .btn-primary { background: var(--btn-grad); color: var(--btn-fg); border: none; padding: 10px 19px; border-radius: 9px;
        font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: var(--font-body); letter-spacing: 0.01em;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 2px 8px rgba(0,0,0,0.18); }
      .btn-primary:hover { filter: brightness(1.06); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 9px 14px; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body); }
      .btn-ghost:hover { background: var(--surface-alt); border-color: var(--border-strong); }

      /* ---------- Search page ---------- */
      .search-box-lg { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); background: var(--surface); border-radius: 12px; padding: 13px 16px; margin-bottom: 14px;
        box-shadow: var(--shadow); transition: border-color .15s, box-shadow .15s; }
      .search-box-lg:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring), var(--glow-accent); }
      .search-box-lg svg { color: var(--accent); }
      .search-box-lg input { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: var(--text); font-family: var(--font-body); }
      .search-box-lg input:focus-visible { box-shadow: none; outline: none; }
      .search-box-lg input::placeholder { color: var(--text-secondary); opacity: .65; }
      .search-box-lg button { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
      .filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
      .filter-row select { border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 8px; padding: 8px 10px; font-size: 12.5px; font-family: var(--font-body); }
      .filter-row select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
      .date-range { display: flex; align-items: center; gap: 6px; border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px; background: var(--surface); }
      .date-range input { border: none; background: transparent; font-size: 12px; color: var(--text); font-family: var(--font-mono); }
      .date-range span { color: var(--text-secondary); font-size: 12px; }

      .result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 13px; }
      .result-card { position: relative; text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 15px; cursor: pointer;
        display: flex; flex-direction: column; gap: 8px; box-shadow: var(--shadow); font-family: var(--font-body); overflow: hidden; }
      .result-card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 1px;
        background: linear-gradient(90deg, transparent, var(--hairline) 30%, var(--hairline) 70%, transparent); pointer-events: none; }
      .result-card:hover { border-color: var(--border-strong); }
      .result-card-top { display: flex; gap: 6px; }
      .result-card-title { font-family: var(--font-display); font-weight: 600; font-size: 14px; line-height: 1.3; }
      .result-card-summary { font-size: 12px; color: var(--text-secondary); line-height: 1.45; flex: 1; }
      .result-card-types { display: flex; flex-wrap: wrap; gap: 5px; }
      .result-card-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
      .result-card-tags { display: flex; gap: 5px; flex-wrap: wrap; }
      .result-card-date { font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); }

      /* ---------- Detail page ---------- */
      .back-link { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: var(--text-secondary); font-size: 12.5px; cursor: pointer; margin-bottom: 14px; padding: 0; font-family: var(--font-body); }
      .back-link:hover { color: var(--accent); }
      .detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
      .detail-head h1 { font-family: var(--font-display); font-size: 23px; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
      .ekb-root[data-theme="dark"] .detail-head h1 { text-shadow: 0 0 28px rgba(61,224,206,0.20); }
      .detail-types { display: flex; gap: 6px; flex-shrink: 0; }
      .detail-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 15px 17px; margin-bottom: 12px; box-shadow: var(--shadow); }
      .meta-label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.09em; color: var(--text-secondary); font-weight: 600; margin-bottom: 3px; font-family: var(--font-mono); }
      .meta-value { font-size: 13px; font-weight: 500; }
      .meta-value.mono { font-family: var(--font-mono); color: var(--copper); }
      .detail-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
      .detail-body { margin-bottom: 22px; }
      .related-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }

      /* content renderer */
      .km-h2 { font-family: var(--font-display); font-size: 16px; font-weight: 700; margin: 18px 0 8px; }
      .km-h3 { font-family: var(--font-display); font-size: 14px; font-weight: 700; margin: 14px 0 6px; color: var(--accent-strong); }
      .ekb-root[data-theme="light"] .km-h3 { color: var(--accent); }
      .km-p { font-size: 13.5px; margin: 0 0 10px; color: var(--text); }
      .km-list { margin: 0 0 12px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
      .km-list li { font-size: 13.5px; }
      .km-list li::marker { color: var(--accent); }
      .km-check { display: flex; align-items: flex-start; gap: 7px; }
      .km-checkbox { width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid var(--border-strong); flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; color: var(--btn-fg); }
      .km-checkbox.checked { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 8px var(--ring); }
      .km-code { font-family: var(--font-mono); font-size: 12px; background: var(--bg-deep); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; overflow-x: auto; margin: 0 0 12px; color: var(--accent-strong); }
      .ekb-root[data-theme="light"] .km-code { background: var(--surface-alt); color: var(--accent-strong); }
      .km-code-inline { font-family: var(--font-mono); font-size: 0.88em; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 5px; padding: 1px 5px; color: var(--accent-strong); }
      .ekb-root[data-theme="light"] .km-code-inline { color: var(--accent); }
      .km-link { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1px; transition: color .12s ease; }
      .km-link:hover { color: var(--accent-strong); }
      .ekb-root[data-theme="light"] .km-link { color: var(--accent-strong); }

      /* images */
      .km-figure { margin: 0 0 14px; }
      .km-img { display: block; max-width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--border); box-shadow: var(--shadow); }
      .km-figcaption { margin-top: 7px; font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono); text-align: center; }
      .km-img-inline { max-width: 100%; height: auto; border-radius: 6px; border: 1px solid var(--border); vertical-align: middle; }

      /* tables */
      .km-table-wrap { overflow-x: auto; margin: 0 0 14px; border: 1px solid var(--border); border-radius: 10px; box-shadow: var(--shadow); }
      .km-table { border-collapse: collapse; width: 100%; font-size: 13px; }
      .km-table th, .km-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); vertical-align: top; }
      .km-table th:last-child, .km-table td:last-child { border-right: none; }
      .km-table tbody tr:last-child td { border-bottom: none; }
      .km-table th { background: var(--surface-alt); font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); }
      .km-table tbody tr:nth-child(even) td { background: color-mix(in srgb, var(--surface-alt) 45%, transparent); }
      .km-table tbody tr:hover td { background: var(--accent-soft); }

      /* ---------- Review package ---------- */
      .review-controls { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
      .review-controls .field { min-width: 190px; }
      .review-section { margin-bottom: 22px; }
      .review-section-head { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
      .review-section-head h2 { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin: 0; }
      .review-section-head svg { color: var(--accent); }
      .review-count { font-family: var(--font-mono); font-size: 11px; color: var(--accent-strong); background: var(--accent-soft); padding: 2px 8px; border-radius: 5px; border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent); }
      .ekb-root[data-theme="light"] .review-count { color: var(--accent); }
      .review-list { display: flex; flex-direction: column; gap: 10px; }
      .review-item { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; box-shadow: var(--shadow); }
      .review-item-title { font-weight: 600; font-size: 13.5px; margin-bottom: 6px; }
      .review-item-body .km-p, .review-item-body .km-list li { font-size: 12.5px; }
      .muted { color: var(--text-secondary); font-weight: 400; }
      .print-header { display: none; }
      .print-only { display: none; }

      /* ---------- Settings ---------- */
      .settings-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 0; }
      .settings-row-title { font-size: 13px; font-weight: 600; }
      .settings-row-note { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
      .theme-switch { display: flex; border: 1px solid var(--border); border-radius: 9px; overflow: hidden; background: var(--surface-alt); }
      .theme-switch button { display: flex; align-items: center; gap: 5px; padding: 7px 12px; background: transparent; border: none; color: var(--text-secondary); font-size: 12px; cursor: pointer; font-family: var(--font-body); }
      .theme-switch button.active { background: var(--accent-soft); color: var(--accent-strong); font-weight: 600; box-shadow: inset 0 0 0 1px var(--border-strong), var(--glow-accent); }
      .ekb-root[data-theme="light"] .theme-switch button.active { color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }

      /* ---------- Empty state ---------- */
      .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 40px 20px; color: var(--text-secondary); text-align: center; }
      .empty-title { font-size: 13.5px; font-weight: 600; color: var(--text); }
      .empty-note { font-size: 12px; max-width: 320px; }
      .empty-state svg { animation: ekbFloat 3.4s ease-in-out infinite; color: var(--accent); opacity: .7; filter: drop-shadow(0 0 10px var(--ring)); }
      .dash-empty { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-bottom: 8px; }
      .dash-empty .btn-primary { display: inline-flex; align-items: center; gap: 7px; }

      /* ---------- Page title with icon ---------- */
      .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 4px; }
      .page-title-icon {
        width: 36px; height: 36px; border-radius: 10px;
        background: linear-gradient(145deg, var(--accent-soft), transparent 140%);
        color: var(--accent);
        display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
        box-shadow: inset 0 0 0 1px var(--border), var(--glow-accent); transition: transform .18s ease;
      }
      .page:hover .page-title-icon { transform: rotate(-6deg) scale(1.05); }
      .page-title h1 { margin: 0; font-family: var(--font-display); font-size: 25px; font-weight: 700; letter-spacing: -0.02em; }

      /* ---------- Motion ---------- */
      @keyframes ekbFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      @keyframes ekbFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes ekbPop { from { opacity: 0; transform: scale(.96) translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes ekbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes ekbSpinIn { from { opacity: 0; transform: rotate(-90deg) scale(.6); } to { opacity: 1; transform: none; } }
      @keyframes ekbGlowPulse { 0%,100% { box-shadow: 0 0 10px var(--ring); } 50% { box-shadow: 0 0 22px var(--ring); } }

      .page { animation: ekbFadeUp .42s cubic-bezier(.22,.61,.36,1) both; }
      .page-title-icon { animation: ekbSpinIn .5s cubic-bezier(.22,.61,.36,1) both; }
      .banner { animation: ekbFadeUp .3s ease both; }

      /* card hover lift + smooth transitions */
      .stat-card, .ic-card, .result-card, .panel { transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease; }
      .stat-card:hover, .result-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lift); border-color: var(--border-strong); }
      .ic-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lift); }
      .ekb-root[data-theme="dark"] .stat-card:hover,
      .ekb-root[data-theme="dark"] .result-card:hover,
      .ekb-root[data-theme="dark"] .ic-card:hover { box-shadow: var(--shadow-lift); }
      .stat-value { transition: color .16s ease, text-shadow .16s ease; }
      .stat-card:hover .stat-value { color: var(--accent); }
      .ekb-root[data-theme="dark"] .stat-card:hover .stat-value { text-shadow: 0 0 18px var(--ring); }

      /* staggered entrances (grids + lists) */
      .stat-row .stat-card, .interface-grid .ic-card, .result-grid .result-card { animation: ekbPop .5s cubic-bezier(.22,.61,.36,1) both; }
      .two-col .panel, .review-item, .related-grid .panel { animation: ekbFadeUp .5s cubic-bezier(.22,.61,.36,1) both; }
      .row-list .row-item { animation: ekbFadeUp .4s ease both; }
      .stat-row > *:nth-child(1), .interface-grid > *:nth-child(1), .result-grid > *:nth-child(1), .two-col > *:nth-child(1), .review-item:nth-child(1), .row-list > *:nth-child(1) { animation-delay: .03s; }
      .stat-row > *:nth-child(2), .interface-grid > *:nth-child(2), .result-grid > *:nth-child(2), .two-col > *:nth-child(2), .review-item:nth-child(2), .row-list > *:nth-child(2) { animation-delay: .07s; }
      .stat-row > *:nth-child(3), .interface-grid > *:nth-child(3), .result-grid > *:nth-child(3), .review-item:nth-child(3), .row-list > *:nth-child(3) { animation-delay: .11s; }
      .interface-grid > *:nth-child(4), .result-grid > *:nth-child(4), .row-list > *:nth-child(4) { animation-delay: .15s; }
      .interface-grid > *:nth-child(5), .result-grid > *:nth-child(5), .row-list > *:nth-child(5) { animation-delay: .19s; }
      .interface-grid > *:nth-child(6), .result-grid > *:nth-child(6), .row-list > *:nth-child(6) { animation-delay: .23s; }
      .interface-grid > *:nth-child(7), .result-grid > *:nth-child(7) { animation-delay: .27s; }
      .interface-grid > *:nth-child(8), .result-grid > *:nth-child(8) { animation-delay: .31s; }
      .interface-grid > *:nth-child(9), .result-grid > *:nth-child(9) { animation-delay: .35s; }
      .interface-grid > *:nth-child(10), .result-grid > *:nth-child(10) { animation-delay: .39s; }
      .interface-grid > *:nth-child(11) { animation-delay: .43s; }

      /* interactive micro-motion */
      .row-item { transition: background .12s ease, transform .12s ease; }
      .row-item:hover { transform: translateX(3px); }
      .row-item:hover .row-item-chevron { transform: translateX(2px); color: var(--accent); }
      .row-item-chevron { transition: transform .12s ease, color .12s ease; }
      .nav-item { position: relative; }
      .nav-item svg { transition: transform .14s ease, color .14s ease; }
      .nav-item:hover svg { transform: translateX(1px) scale(1.08); color: var(--accent); }
      .nav-item.active svg { color: var(--accent); filter: drop-shadow(0 0 6px var(--ring)); }
      .nav-item.active::before { content: ""; position: absolute; left: -1px; top: 7px; bottom: 7px; width: 3px; border-radius: 3px;
        background: linear-gradient(180deg, var(--accent-strong), var(--accent)); box-shadow: 0 0 10px var(--accent), 0 0 22px var(--ring); }
      .btn-primary, .btn-ghost { transition: transform .12s ease, background .12s ease, border-color .12s ease, box-shadow .12s ease, filter .12s ease; }
      .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), var(--btn-glow); }
      .btn-ghost:hover { transform: translateY(-1px); }
      .chip-toggle, .quick-tag, .tag-chip, .icon-btn, .pill, .badge { transition: transform .12s ease, background .12s ease, color .12s ease, border-color .12s ease, box-shadow .12s ease; }
      .chip-toggle:hover, .quick-tag:hover { transform: translateY(-1px); }
      .icon-btn:hover { transform: translateY(-1px); }
      .result-card:hover .result-card-title { color: var(--accent-strong); }
      .ekb-root[data-theme="light"] .result-card:hover .result-card-title { color: var(--accent); }
      .result-card-title { transition: color .14s ease; }
      .ic-card-title svg { transition: transform .16s ease; }
      .ic-card:hover .ic-card-title svg { transform: rotate(8deg); }

      @media (prefers-reduced-motion: reduce) {
        .page, .page-head, .page-title-icon, .banner, .empty-state svg,
        .stat-row .stat-card, .interface-grid .ic-card, .result-grid .result-card,
        .two-col .panel, .review-item, .related-grid .panel, .row-list .row-item { animation: none !important; }
        .stat-card:hover, .ic-card:hover, .result-card:hover, .row-item:hover,
        .btn-primary:hover, .btn-ghost:hover, .chip-toggle:hover, .quick-tag:hover, .icon-btn:hover { transform: none !important; }
        .stat-card::after, .ic-card::after { transition: none !important; }
        .ekb-root *, .ekb-root *::before, .ekb-root *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
      }

      /* ---------- Auth splash / loading / logout ---------- */
      .app-splash { flex: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-secondary); background: transparent; }
      .app-splash > :first-child { color: var(--accent); filter: drop-shadow(0 0 14px var(--ring)); }
      .app-splash span { font-size: 13px; font-family: var(--font-mono); letter-spacing: 0.04em; }
      .app-splash-spin { animation: ekbSpin 1s linear infinite; }
      .spin { animation: ekbSpin 1s linear infinite; }
      @keyframes ekbSpin { to { transform: rotate(360deg); } }
      .page-loading { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 14px; padding: 60px 0; justify-content: center; }
      .page-error { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; text-align: center; color: var(--danger); }
      .page-error .empty-title { color: var(--text); }
      .page-error .empty-note { color: var(--text-secondary); max-width: 380px; }
      .page-error .btn-primary { margin-top: 8px; }
      .logout-btn { margin-left: auto; width: 30px; height: 30px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .12s, color .12s, border-color .12s; }
      .logout-btn:hover { background: var(--danger-soft); color: var(--danger); border-color: color-mix(in srgb, var(--danger) 30%, transparent); }

      /* ---------- Danger buttons ---------- */
      .btn-danger { background: var(--danger); color: #fff; border: none; padding: 10px 19px; border-radius: 9px;
        font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: var(--font-body); letter-spacing: 0.01em;
        display: inline-flex; align-items: center; gap: 7px; justify-content: center;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 8px rgba(0,0,0,0.18);
        transition: transform .12s ease, filter .12s ease, box-shadow .12s ease; }
      .btn-danger:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
      .btn-danger:disabled { opacity: .6; cursor: not-allowed; }
      .btn-danger-ghost { background: transparent; border: 1px solid color-mix(in srgb, var(--danger) 34%, transparent);
        color: var(--danger); padding: 9px 14px; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer;
        display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body);
        transition: background .12s ease, border-color .12s ease, transform .12s ease; }
      .btn-danger-ghost:hover { background: var(--danger-soft); border-color: var(--danger); transform: translateY(-1px); }

      /* ---------- Modal / confirm dialog ---------- */
      .modal-overlay { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center;
        padding: 20px; background: rgba(2,5,8,0.62); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
        animation: ekbFadeIn .16s ease both; }
      .modal { position: relative; width: 100%; max-width: 420px; background: var(--surface-solid); color: var(--text);
        border: 1px solid var(--border); border-radius: 16px; padding: 24px 24px 20px; box-shadow: var(--shadow-lift);
        animation: ekbPop .22s cubic-bezier(.22,.61,.36,1) both; }
      .modal::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 1px; border-radius: 16px 16px 0 0;
        background: linear-gradient(90deg, transparent, var(--hairline) 30%, var(--hairline) 70%, transparent); pointer-events: none; }
      .modal-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center;
        background: var(--accent-soft); color: var(--accent); margin-bottom: 14px; box-shadow: var(--glow-accent); }
      .modal-icon.danger { background: var(--danger-soft); color: var(--danger);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--danger) 26%, transparent); }
      .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 8px; }
      .modal-message { font-size: 13.5px; line-height: 1.55; color: var(--text-secondary); margin-bottom: 20px; }
      .modal-message strong { color: var(--text); font-weight: 600; }
      .modal-error { margin-top: 12px; background: var(--danger-soft); color: var(--danger); font-size: 12.5px; font-weight: 500;
        padding: 8px 11px; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--danger) 26%, transparent); }
      .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

      /* ---------- Detail actions ---------- */
      .detail-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
      .detail-actions { display: flex; gap: 8px; }
      .detail-actions .btn-ghost, .detail-actions .btn-danger-ghost { padding: 7px 12px; font-size: 12.5px; }

      /* ---------- Profile page ---------- */
      .profile-card { display: flex; align-items: center; gap: 18px; padding: 20px 22px; }
      .profile-avatar { width: 62px; height: 62px; border-radius: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
        font-family: var(--font-mono); font-size: 22px; font-weight: 600; color: var(--copper); background: var(--copper-soft);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--copper) 32%, transparent); }
      .profile-identity { min-width: 0; }
      .profile-name { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 2px; }
      .ekb-root[data-theme="dark"] .profile-name { text-shadow: 0 0 22px rgba(61,224,206,0.18); }
      .profile-username { font-family: var(--font-mono); font-size: 12.5px; color: var(--accent); margin-bottom: 10px; }
      .ekb-root[data-theme="light"] .profile-username { color: var(--accent-strong); }
      .profile-facts { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 12.5px; color: var(--text-secondary); }
      .profile-facts span { display: inline-flex; align-items: center; gap: 6px; }
      .profile-facts svg { color: var(--accent); flex-shrink: 0; }
      .profile-stat-date { font-size: 18px; }
      .profile-list { display: flex; flex-direction: column; gap: 6px; }
      .profile-row { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: 10px; border: 1px solid transparent;
        transition: background .12s ease, border-color .12s ease; }
      .profile-row:hover { background: var(--surface-alt); border-color: var(--border); }
      .profile-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; text-align: left;
        background: none; border: none; cursor: pointer; font-family: var(--font-body); padding: 0; }
      .profile-row-title { font-size: 13.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .profile-row-sub { font-size: 11.5px; color: var(--text-secondary); font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .profile-row-badges { display: flex; gap: 5px; flex-shrink: 0; }
      .profile-row-actions { display: flex; gap: 2px; flex-shrink: 0; }
      .icon-action { width: 30px; height: 30px; border-radius: 8px; border: 1px solid transparent; background: transparent;
        color: var(--text-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer;
        transition: background .12s ease, color .12s ease, border-color .12s ease; }
      .icon-action:hover { background: var(--surface); color: var(--accent); border-color: var(--border-strong); }
      .icon-action.danger:hover { background: var(--danger-soft); color: var(--danger); border-color: color-mix(in srgb, var(--danger) 30%, transparent); }

      /* clickable user chip in the sidebar footer */
      .user-chip-main { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; padding: 4px; border-radius: 8px;
        background: none; border: none; cursor: pointer; text-align: left; font-family: var(--font-body); color: inherit;
        transition: background .12s ease; }
      .user-chip-main:hover { background: var(--surface-alt); }
      .user-chip-main .user-meta { min-width: 0; }
      .user-chip-main .user-name, .user-chip-main .user-role { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      @media (max-width: 620px) {
        .profile-card { flex-direction: column; align-items: flex-start; text-align: left; }
        .profile-row-badges { display: none; }
        .detail-head { flex-direction: column; }
        .detail-head-right { align-items: flex-start; }
      }

      /* ---------- Print ---------- */
      @media print {
        .no-print { display: none !important; }
        .ekb-root { display: block; background: #fff; color: #000; }
        .ekb-root::before { display: none; }
        .content { padding: 0; max-width: none; }
        .print-only { display: block; }
        .print-header { display: block; margin-bottom: 16px; }
        .print-header h1 { font-family: var(--font-display); font-size: 18px; margin: 0 0 4px; }
        .review-item { break-inside: avoid; border-color: #ccc; box-shadow: none; background: #fff; }
      }

      /* ---------- Responsive ---------- */
      @media (max-width: 920px) {
        .sidebar { position: fixed; z-index: 30; top: 0; left: 0; transform: translateX(-100%); transition: transform .22s ease; box-shadow: none; }
        .ekb-root[data-theme="dark"] .sidebar { background: rgba(9, 15, 20, 0.92); }
        .sidebar.open { transform: translateX(0); box-shadow: 4px 0 32px rgba(0,0,0,0.45); }
        .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(2,5,8,0.55); z-index: 25; -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
        .sidebar-close { display: flex; }
        .menu-btn { display: flex; margin-left: 0; }
        .breadcrumb { display: none; }
        .two-col, .related-grid, .form-grid { grid-template-columns: 1fr; }
        .field.span-2 { grid-column: span 1; }
        .editor-body { grid-template-columns: 1fr; }
        .detail-meta-grid { grid-template-columns: repeat(2, 1fr); }
        .content { padding: 16px; }
        .stat-row { grid-template-columns: 1fr; }
        .topbar { gap: 10px; padding: 0 12px; }
      }
    `}</style>
  );
}
