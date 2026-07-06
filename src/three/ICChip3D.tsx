import type { CSSProperties } from "react";
import type { Theme } from "../types";

/**
 * A tiny CSS-3D QFN-style IC package. Pure CSS transforms — no WebGL —
 * because ~11 of these live on the dashboard simultaneously.
 */

const SIZE = 34; // px, chip body
const H = 7; // px, package height

const CSS = `
  .icc3d {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 260px;
  }
  .icc3d-hover {
    transform-style: preserve-3d;
    transition: transform 0.35s cubic-bezier(0.22, 0.9, 0.35, 1);
  }
  .icc3d:hover .icc3d-hover,
  .ic-card:hover .icc3d-hover {
    transform: translateY(-3px) scale(1.14);
  }
  .icc3d-tilt {
    transform-style: preserve-3d;
    animation: icc3d-idle 7s ease-in-out infinite alternate;
  }
  @keyframes icc3d-idle {
    from { transform: rotateX(57deg) rotateZ(42deg); }
    to   { transform: rotateX(51deg) rotateZ(48deg); }
  }
  .icc3d-body {
    position: relative;
    width: ${SIZE}px;
    height: ${SIZE}px;
    transform-style: preserve-3d;
  }
  .icc3d-glow {
    position: absolute;
    inset: -10px;
    border-radius: 12px;
    background: radial-gradient(closest-side, rgba(var(--icc-glowc), 0.75), rgba(var(--icc-glowc), 0.18) 60%, rgba(var(--icc-glowc), 0));
    transform: translateZ(-2px);
    opacity: calc(var(--icc-glow) * 0.7);
    filter: blur(3px);
    transition: opacity 0.3s ease;
  }
  .icc3d:hover .icc3d-glow,
  .ic-card:hover .icc3d-glow {
    opacity: var(--icc-glow);
  }
  .icc3d-top {
    position: absolute;
    inset: 0;
    transform: translateZ(${H}px);
    background:
      radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,0.10), transparent 55%),
      linear-gradient(135deg, var(--icc-top2) 0%, var(--icc-top) 62%, var(--icc-top3) 100%);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.07),
      inset 0 0 0 3px rgba(0, 0, 0, 0.18);
    overflow: hidden;
  }
  /* silkscreen frame line, like a real package outline */
  .icc3d-top::after {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 2px;
    border: 0.5px solid rgba(var(--icc-glowc), 0.28);
    pointer-events: none;
  }
  .icc3d-dot {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--icc-copper);
    box-shadow: 0 0 4px var(--icc-copper);
    z-index: 1;
  }
  .icc3d-label {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 6.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--icc-accent);
    text-shadow: 0 0 5px rgba(var(--icc-glowc), 0.55);
    white-space: nowrap;
    max-width: ${SIZE - 8}px;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    z-index: 1;
  }
  .icc3d-side {
    position: absolute;
    background: linear-gradient(180deg, var(--icc-side2) 0%, var(--icc-side) 55%);
  }
  .icc3d-side-s {
    left: 0;
    top: 100%;
    width: ${SIZE}px;
    height: ${H}px;
    transform-origin: 50% 0;
    transform: rotateX(90deg);
    border-radius: 0 0 2px 2px;
  }
  .icc3d-side-e {
    left: 100%;
    top: 0;
    width: ${H}px;
    height: ${SIZE}px;
    transform-origin: 0 50%;
    transform: rotateY(-90deg);
    border-radius: 0 2px 2px 0;
    background: linear-gradient(90deg, var(--icc-side2) 0%, var(--icc-side) 55%);
  }
  .icc3d-pin {
    position: absolute;
    background: linear-gradient(180deg, var(--icc-pin-hi) 0%, var(--icc-pin) 45%, var(--icc-pin-lo) 100%);
    border-radius: 1px;
    transform: translateZ(2px);
    box-shadow: 0 0 1px rgba(0,0,0,0.4);
  }
  .icc3d-pin-ns { width: 3.2px; height: 6px; }
  .icc3d-pin-ew {
    width: 6px;
    height: 3.2px;
    background: linear-gradient(90deg, var(--icc-pin-hi) 0%, var(--icc-pin) 45%, var(--icc-pin-lo) 100%);
  }
  @media (prefers-reduced-motion: reduce) {
    .icc3d-tilt { animation: none; transform: rotateX(55deg) rotateZ(45deg); }
    .icc3d-hover, .icc3d-glow { transition: none; }
  }
`;

interface ChipVars extends CSSProperties {
  "--icc-top": string;
  "--icc-top2": string;
  "--icc-top3": string;
  "--icc-side": string;
  "--icc-side2": string;
  "--icc-pin": string;
  "--icc-pin-hi": string;
  "--icc-pin-lo": string;
  "--icc-accent": string;
  "--icc-copper": string;
  "--icc-glow": string;
  "--icc-glowc": string;
}

export function ICChip3D({
  label,
  count,
  theme,
}: {
  label: string;
  count: number;
  theme: Theme;
}) {
  const dark = theme === "dark";
  // count drives pin density and glow strength
  const pinsPerSide = Math.max(3, Math.min(6, 3 + Math.floor(count / 3)));
  const glow = count === 0 ? 0.1 : Math.min(1, 0.4 + count / 9);

  const vars: ChipVars = {
    "--icc-top": dark ? "#141C22" : "#232B33",
    "--icc-top2": dark ? "#233039" : "#333E49",
    "--icc-top3": dark ? "#0C1216" : "#1B222A",
    "--icc-side": dark ? "#0A1014" : "#151C23",
    "--icc-side2": dark ? "#1A242B" : "#242D36",
    "--icc-pin": dark ? "#9CA9B4" : "#9AA6B2",
    "--icc-pin-hi": dark ? "#DDE7EE" : "#D5DEE6",
    "--icc-pin-lo": dark ? "#5B6873" : "#66727E",
    "--icc-accent": dark ? "#3DE0CE" : "#4FD8C8",
    "--icc-copper": dark ? "#E8A566" : "#D08040",
    "--icc-glow": String(glow),
    "--icc-glowc": dark ? "61, 224, 206" : "14, 124, 130",
  };

  // pin offsets along an edge, inset from the corners
  const span = SIZE - 10;
  const offsets = Array.from({ length: pinsPerSide }, (_, i) =>
    pinsPerSide === 1 ? SIZE / 2 - 1.6 : 4 + (i * span) / (pinsPerSide - 1)
  );

  return (
    <div
      className="icc3d"
      style={vars}
      role="img"
      aria-label={`${label} interface chip, ${count} ${count === 1 ? "entry" : "entries"}`}
      title={`${label} — ${count} entries`}
    >
      <style>{CSS}</style>
      <div className="icc3d-hover">
        <div className="icc3d-tilt">
          <div className="icc3d-body">
            <div className="icc3d-glow" />
            {/* pins: north / south / east / west */}
            {offsets.map((o, i) => (
              <span
                key={`n${i}`}
                className="icc3d-pin icc3d-pin-ns"
                style={{ left: o, top: -4 }}
              />
            ))}
            {offsets.map((o, i) => (
              <span
                key={`s${i}`}
                className="icc3d-pin icc3d-pin-ns"
                style={{ left: o, top: SIZE - 2 }}
              />
            ))}
            {offsets.map((o, i) => (
              <span
                key={`w${i}`}
                className="icc3d-pin icc3d-pin-ew"
                style={{ top: o, left: -4 }}
              />
            ))}
            {offsets.map((o, i) => (
              <span
                key={`e${i}`}
                className="icc3d-pin icc3d-pin-ew"
                style={{ top: o, left: SIZE - 2 }}
              />
            ))}
            {/* visible side walls (south + east face the camera) */}
            <div className="icc3d-side icc3d-side-s" />
            <div className="icc3d-side icc3d-side-e" />
            {/* top face with silkscreen */}
            <div className="icc3d-top">
              <span className="icc3d-dot" />
              <span className="icc3d-label">{label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
