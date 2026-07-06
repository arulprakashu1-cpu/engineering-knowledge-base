export function ThreeStyle() {
  return (
    <style>{`
      /* ---------- 3D Hero ---------- */
      .hero-3d {
        position: relative;
        width: 100%;
        height: 300px;
        border-radius: 16px;
        border: 1px solid var(--border);
        overflow: hidden;
        margin-bottom: 24px;
        background: var(--surface-solid, var(--surface));
        box-shadow: var(--shadow);
      }
      .ekb-root[data-theme="dark"] .hero-3d {
        border-color: var(--border-strong);
        box-shadow: 0 24px 60px rgba(2,5,8,0.55), 0 0 44px rgba(61,224,206,0.08), inset 0 1px 0 rgba(233,245,242,0.06);
      }
      /* scanline + inner vignette overlay (above canvas, below text) */
      .hero-3d::after {
        content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; border-radius: inherit;
        background:
          repeating-linear-gradient(180deg, var(--scan, transparent) 0 1px, transparent 1px 4px),
          radial-gradient(140% 120% at 50% 50%, transparent 58%, rgba(2,5,8,0.28) 100%);
      }
      .ekb-root[data-theme="light"] .hero-3d::after {
        background: radial-gradient(140% 120% at 50% 50%, transparent 64%, rgba(15,25,30,0.10) 100%);
      }
      .hero-3d-overlay {
        position: absolute;
        inset: 0;
        z-index: 2;
        padding: 30px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        pointer-events: none;
      }
      .ekb-root[data-theme="light"] .hero-3d-overlay {
        background: linear-gradient(90deg, rgba(242,245,246,0.90) 0%, rgba(242,245,246,0.55) 42%, rgba(242,245,246,0) 72%);
      }
      .ekb-root[data-theme="dark"] .hero-3d-overlay {
        background: linear-gradient(90deg, rgba(4,7,10,0.88) 0%, rgba(4,7,10,0.50) 42%, rgba(4,7,10,0) 72%);
      }
      .hero-3d-overlay h1 {
        font-family: var(--font-display);
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.025em;
        line-height: 1.12;
        margin: 0 0 8px;
        color: var(--text);
      }
      .ekb-root[data-theme="dark"] .hero-3d-overlay h1 {
        text-shadow: 0 0 34px rgba(61,224,206,0.28), 0 2px 18px rgba(2,5,8,0.6);
      }
      .hero-3d-overlay p {
        max-width: 460px;
        margin: 0;
        font-size: 13.5px;
        line-height: 1.55;
        color: var(--text-secondary);
      }
      .hero-3d-stats {
        display: flex;
        gap: 26px;
        margin-top: 18px;
      }
      .hero-3d-stats > div {
        display: flex;
        flex-direction: column;
        gap: 1px;
        position: relative;
        padding-left: 12px;
      }
      .hero-3d-stats > div::before {
        content: ""; position: absolute; left: 0; top: 3px; bottom: 3px; width: 2px; border-radius: 2px;
        background: linear-gradient(180deg, var(--accent), transparent);
        box-shadow: 0 0 8px var(--ring, rgba(61,224,206,0.25));
      }
      .hero-3d-stats > div:nth-child(2)::before { background: linear-gradient(180deg, var(--copper), transparent); box-shadow: 0 0 8px color-mix(in srgb, var(--copper) 40%, transparent); }
      .hero-3d-stats > div:nth-child(3)::before { background: linear-gradient(180deg, var(--indigo), transparent); box-shadow: 0 0 8px color-mix(in srgb, var(--indigo) 40%, transparent); }
      .hero-3d-stats b {
        font-family: var(--font-mono);
        font-size: 25px;
        font-weight: 600;
        line-height: 1.15;
        color: var(--accent);
      }
      .ekb-root[data-theme="dark"] .hero-3d-stats b { text-shadow: 0 0 16px var(--ring); }
      .hero-3d-stats span {
        font-size: 10.5px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-secondary);
        font-family: var(--font-mono);
      }

      /* ---------- CSS-3D IC chip on interface cards ---------- */
      .ic-card-chip {
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        margin-right: 12px;
        align-self: center;
      }

      /* ---------- 3D Interface Explorer ---------- */
      .explore-page {}
      .galaxy-stage {
        position: relative;
        width: 100%;
        height: calc(100vh - 210px);
        min-height: 420px;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: radial-gradient(120% 130% at 50% -10%, var(--surface-solid, var(--surface)) 0%, var(--bg-deep, var(--bg)) 72%);
        box-shadow: var(--shadow);
      }
      .ekb-root[data-theme="dark"] .galaxy-stage {
        border-color: var(--border-strong);
        box-shadow: 0 24px 60px rgba(2,5,8,0.55), 0 0 44px rgba(61,224,206,0.07), inset 0 1px 0 rgba(233,245,242,0.06);
      }
      .galaxy-stage::after {
        content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; border-radius: inherit;
        background: radial-gradient(140% 120% at 50% 50%, transparent 60%, rgba(2,5,8,0.30) 100%);
      }
      .ekb-root[data-theme="light"] .galaxy-stage::after {
        background: radial-gradient(140% 120% at 50% 50%, transparent 66%, rgba(15,25,30,0.08) 100%);
      }
      .galaxy-hint {
        position: absolute;
        left: 14px;
        bottom: 12px;
        z-index: 2;
        font-size: 10.5px;
        letter-spacing: 0.05em;
        font-family: var(--font-mono);
        text-transform: uppercase;
        color: var(--text-secondary);
        background: var(--surface);
        -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 5px 12px;
        opacity: 0.92;
        pointer-events: none;
        user-select: none;
        box-shadow: var(--glow-accent, none);
      }

      @media (max-width: 920px) {
        .hero-3d { height: auto; min-height: 360px; }
        .hero-3d-overlay { position: relative; inset: auto; padding: 22px 20px; min-height: 360px; }
        .hero-3d-overlay h1 { font-size: 25px; }
        .hero-3d-overlay p { font-size: 13px; }
        .hero-3d-stats { gap: 18px; margin-top: 14px; flex-wrap: wrap; }
        .hero-3d-stats b { font-size: 21px; }
        .galaxy-stage { height: calc(100vh - 250px); min-height: 380px; }
      }
    `}</style>
  );
}
