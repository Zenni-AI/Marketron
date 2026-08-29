"use client";

import { useId } from "react";

/**
 * Hand-drawn artwork plates.
 *
 * Every image slot renders one of these until real project photography is set
 * in `lib/media.ts`. They are built like screen prints rather than diagrams:
 * flat tonal masses, one light source, a single red accent and a grain pass.
 *
 * Canvas is 240x120 and frames crop it with `slice`, so composition follows
 * one rule: the subject lives in the centre band (x 72-168, the narrowest crop
 * a 4:5 frame takes) and supporting structure runs out to the edges to fill
 * wide frames.
 */
export type PlateName =
  | "facade"
  | "hangar"
  | "warehouse"
  | "lift"
  | "crew"
  | "watertower"
  | "steel"
  | "detail";

type PlateProps = {
  name: PlateName;
  className?: string;
  tone?: "night" | "plaster";
};

const NIGHT = {
  sky0: "#0B2A50",
  sky1: "#2F639C",
  mass: "#061729",
  massLit: "#0E2E52",
  mid: "#164574",
  lit: "#D8E4F3",
  line: "rgba(216,228,243,0.55)",
  lineSoft: "rgba(216,228,243,0.22)",
  red: "#B31942",
  redLit: "#D1274F",
};

const PLASTER = {
  sky0: "#E7ECF3",
  sky1: "#FBFCFD",
  mass: "#0A2647",
  massLit: "#1B4272",
  mid: "#C4CDDA",
  lit: "#FFFFFF",
  line: "rgba(10,38,71,0.45)",
  lineSoft: "rgba(10,38,71,0.18)",
  red: "#B31942",
  redLit: "#D1274F",
};

type Palette = typeof NIGHT;

export default function Plate({
  name,
  className = "",
  tone = "night",
}: PlateProps) {
  const uid = useId().replace(/:/g, "");
  const c = tone === "night" ? NIGHT : PLASTER;

  const skyId = `sky-${uid}`;
  const grainId = `grain-${uid}`;
  const vigId = `vig-${uid}`;
  const glowId = `glow-${uid}`;

  return (
    <svg
      viewBox="0 0 240 120"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={c.sky0} />
          <stop offset="100%" stopColor={c.sky1} />
        </linearGradient>

        {/* Low sun — every plate is lit from the same place. */}
        <radialGradient id={glowId} cx="72%" cy="74%" r="58%">
          <stop
            offset="0%"
            stopColor={c.lit}
            stopOpacity={tone === "night" ? 0.34 : 0.5}
          />
          <stop offset="100%" stopColor={c.lit} stopOpacity="0" />
        </radialGradient>

        <filter id={grainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <radialGradient id={vigId} cx="50%" cy="45%" r="72%">
          <stop offset="50%" stopColor="#000814" stopOpacity="0" />
          <stop
            offset="100%"
            stopColor="#000814"
            stopOpacity={tone === "night" ? 0.5 : 0.16}
          />
        </radialGradient>
      </defs>

      <rect width="240" height="120" fill={`url(#${skyId})`} />
      <rect width="240" height="120" fill={`url(#${glowId})`} />

      {name === "facade" && <Facade c={c} />}
      {name === "hangar" && <Hangar c={c} />}
      {name === "warehouse" && <Warehouse c={c} />}
      {name === "lift" && <Lift c={c} />}
      {name === "crew" && <Crew c={c} />}
      {name === "watertower" && <WaterTower c={c} />}
      {name === "steel" && <Steel c={c} />}
      {name === "detail" && <Detail c={c} />}

      <rect width="240" height="120" fill={`url(#${vigId})`} />
      <rect
        width="240"
        height="120"
        filter={`url(#${grainId})`}
        opacity={tone === "night" ? 0.32 : 0.24}
        style={{ mixBlendMode: "overlay" }}
      />
    </svg>
  );
}

/** A worker, ~11 units tall: solid silhouette, gives every structure scale. */
function Worker({
  x,
  y,
  c,
  scale = 1,
  pose = "roll",
  flip = false,
}: {
  x: number;
  y: number;
  c: Palette;
  scale?: number;
  pose?: "roll" | "stand" | "carry";
  flip?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
      fill={c.mass}
    >
      <path d="M-2.6 -9.7 A2.6 2.6 0 0 1 2.6 -9.7 L3.4 -9.3 L-3.4 -9.3 Z" />
      <circle cx="0" cy="-8.2" r="1.55" />
      <path d="M-2 -7 L2 -7 L2.6 -1.5 L-2.6 -1.5 Z" />
      <path d="M-2.4 -1.7 L-0.5 -1.7 L-1.1 0 L-3 0 Z" />
      <path d="M0.5 -1.7 L2.4 -1.7 L3 0 L1.1 0 Z" />

      {pose === "roll" && (
        <>
          <path
            d="M1.6 -6.5 L4.6 -9.8"
            stroke={c.mass}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M4.6 -9.8 L8.6 -15"
            stroke={c.mass}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M7.5 -15.9 L10 -13.9"
            stroke={c.red}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </>
      )}
      {pose === "carry" && (
        <path
          d="M-2.1 -6.1 L-5.6 -4.7 M2.1 -6.1 L5.2 -5"
          stroke={c.mass}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      {pose === "stand" && (
        <path
          d="M1.9 -6.3 L3.6 -2.7"
          stroke={c.mass}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** Stepped commercial elevation under a full scaffold run. */
function Facade({ c }: { c: Palette }) {
  const scaffoldPosts = [12, 46, 80, 114, 148, 182, 216];
  const windows: [number, number][] = [];
  [30, 50, 70].forEach((y) =>
    [20, 40, 60, 80, 100, 120, 140].forEach((x) => windows.push([x, y]))
  );
  [46, 66, 86].forEach((y) =>
    [162, 182, 202, 222].forEach((x) => windows.push([x, y]))
  );

  return (
    <g>
      {/* Two masses at different heights — a silhouette with a shoulder. */}
      <path d="M0 24 L156 24 L156 102 L0 102 Z" fill={c.mass} />
      <path d="M156 40 L240 40 L240 102 L156 102 Z" fill={c.massLit} />
      <rect x="0" y="21" width="158" height="3.4" fill={c.lit} opacity="0.5" />
      <rect x="156" y="37.4" width="84" height="3" fill={c.lit} opacity="0.36" />

      {windows.map(([x, y], i) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="12"
          height="9"
          fill={c.lit}
          opacity={i % 5 === 0 ? 0.44 : i % 3 === 0 ? 0.2 : 0.09}
        />
      ))}

      {/* The band being coated */}
      <rect x="0" y="86" width="240" height="10" fill={c.red} />
      <rect x="0" y="84" width="240" height="2" fill={c.redLit} opacity="0.7" />

      {/* Entrance, centred so portrait crops still read as a building */}
      <rect x="110" y="88" width="22" height="14" fill={c.mass} />
      <rect x="110" y="88" width="22" height="1.4" fill={c.lit} opacity="0.4" />

      {/* Scaffold */}
      <g stroke={c.line} strokeWidth="0.9" fill="none">
        {scaffoldPosts.map((x) => (
          <path key={x} d={`M${x} 16 L${x} 102`} />
        ))}
        {[36, 60, 82].map((y) => (
          <path key={y} d={`M0 ${y} L240 ${y}`} />
        ))}
      </g>
      <g stroke={c.lineSoft} strokeWidth="0.7" fill="none">
        {scaffoldPosts.slice(0, -1).map((x, i) => (
          <path
            key={x}
            d={
              i % 2 === 0
                ? `M${x} 36 L${scaffoldPosts[i + 1]} 60`
                : `M${x} 60 L${scaffoldPosts[i + 1]} 36`
            }
          />
        ))}
        {scaffoldPosts.slice(0, -1).map((x, i) => (
          <path
            key={`b${x}`}
            d={
              i % 2 === 0
                ? `M${x} 82 L${scaffoldPosts[i + 1]} 60`
                : `M${x} 60 L${scaffoldPosts[i + 1]} 82`
            }
          />
        ))}
      </g>
      {[59, 81].map((y) => (
        <rect key={y} x="0" y={y} width="240" height="2" fill={c.lit} opacity="0.5" />
      ))}

      <Worker x={104} y={59} c={c} pose="roll" />
      <Worker x={150} y={59} c={c} pose="stand" flip />
      <Worker x={128} y={81} c={c} pose="roll" />
      <Worker x={44} y={81} c={c} pose="carry" />

      <rect x="0" y="102" width="240" height="18" fill={c.mass} opacity="0.94" />
      <rect x="0" y="102" width="240" height="1.2" fill={c.lit} opacity="0.24" />
    </g>
  );
}

/** Arched hangar, doors open, aircraft tail inside. */
function Hangar({ c }: { c: Palette }) {
  return (
    <g>
      {/* Flanking blocks fill wide crops */}
      <rect x="0" y="72" width="52" height="30" fill={c.massLit} />
      <rect x="196" y="66" width="44" height="36" fill={c.massLit} />
      <g fill={c.lit} opacity="0.22">
        {[8, 18, 28, 38].map((x) => (
          <rect key={x} x={x} y="80" width="6" height="7" />
        ))}
        {[204, 214, 224].map((x) => (
          <rect key={x} x={x} y="74" width="6" height="7" />
        ))}
      </g>

      {/* Hangar, centred */}
      <path d="M62 102 L62 62 A58 44 0 0 1 178 62 L178 102 Z" fill={c.massLit} />
      <path
        d="M62 62 A58 44 0 0 1 178 62"
        fill="none"
        stroke={c.lit}
        strokeWidth="1.6"
        opacity="0.6"
      />
      {/* Open bay — strongest shape in the frame */}
      <path d="M78 102 L78 68 A42 32 0 0 1 162 68 L162 102 Z" fill={c.mass} />
      <g fill={c.lit} opacity="0.15">
        <rect x="64" y="66" width="13" height="36" />
        <rect x="163" y="66" width="13" height="36" />
      </g>

      {/* Aircraft tail catching light */}
      <path d="M104 100 L114 70 L120 70 L121 100 Z" fill={c.mid} />
      <path d="M114 70 L120 70 L120 75 L113 77 Z" fill={c.lit} opacity="0.5" />
      <path d="M94 94 L138 94 L136 98 L96 98 Z" fill={c.mid} opacity="0.85" />

      <rect x="62" y="96" width="116" height="6" fill={c.red} />

      {/* Mast */}
      <path d="M212 66 L212 34" stroke={c.line} strokeWidth="0.9" />
      <path d="M212 36 L221 39 L212 42 Z" fill={c.red} />

      {/* Apron */}
      <rect x="0" y="102" width="240" height="18" fill={c.mass} opacity="0.92" />
      <g stroke={c.lit} strokeWidth="0.7" opacity="0.26">
        <path d="M0 110 L240 110" strokeDasharray="10 8" />
      </g>

      <Worker x={88} y={102} c={c} pose="roll" />
      <Worker x={152} y={102} c={c} pose="carry" flip />
      <Worker x={186} y={102} c={c} pose="stand" />
    </g>
  );
}

/** Warehouse interior: racking, roll-up door, scissor lift mid-bay. */
function Warehouse({ c }: { c: Palette }) {
  return (
    <g>
      <rect x="0" y="0" width="240" height="120" fill={c.massLit} />
      <rect x="0" y="0" width="240" height="18" fill={c.mass} />
      <g stroke={c.line} strokeWidth="0.8" fill="none" opacity="0.75">
        <path d="M0 18 L240 18" />
        {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216].map((x) => (
          <g key={x}>
            <path d={`M${x} 18 L${x} 5`} />
            <path d={`M${x} 18 L${x + 24} 5`} />
          </g>
        ))}
      </g>
      <g fill={c.lit} opacity="0.5">
        {[40, 108, 176].map((x) => (
          <rect key={x} x={x} y="21" width="22" height="1.8" />
        ))}
      </g>

      {/* Racking down both sides */}
      <g fill={c.mass}>
        {[4, 32, 190, 218].map((x) => (
          <g key={x}>
            <rect x={x} y="42" width="2.4" height="50" />
            <rect x={x + 18} y="42" width="2.4" height="50" />
            <rect x={x} y="42" width="20" height="2.4" />
            <rect x={x} y="60" width="20" height="2.4" />
            <rect x={x} y="78" width="20" height="2.4" />
          </g>
        ))}
      </g>
      <g fill={c.mid}>
        {[6, 34, 192, 220].map((x) => (
          <g key={x}>
            <rect x={x} y="46" width="16" height="12" />
            <rect x={x} y="64" width="16" height="12" />
          </g>
        ))}
      </g>

      {/* Roll-up door, centred */}
      <rect x="140" y="40" width="46" height="52" fill={c.mass} />
      <g stroke={c.lit} strokeWidth="0.5" opacity="0.2">
        {[46, 53, 60, 67, 74, 81].map((y) => (
          <path key={y} d={`M140 ${y} L186 ${y}`} />
        ))}
      </g>
      <rect x="140" y="86" width="46" height="6" fill={c.red} />

      <rect x="0" y="92" width="240" height="28" fill={c.mass} opacity="0.88" />
      <rect x="0" y="92" width="240" height="1.2" fill={c.lit} opacity="0.28" />
      <g stroke={c.lit} strokeWidth="0.6" opacity="0.2">
        <path d="M0 106 L240 106" strokeDasharray="11 9" />
      </g>

      {/* Scissor lift, centred */}
      <g stroke={c.mass} strokeWidth="1.8" fill="none">
        <path d="M100 90 L118 76 M118 90 L100 76 M100 76 L118 60 M118 76 L100 60" />
      </g>
      <rect x="96" y="54" width="26" height="5" fill={c.mass} />
      <rect x="96" y="54" width="26" height="1.2" fill={c.lit} opacity="0.4" />
      <rect x="94" y="88" width="30" height="6" rx="1.5" fill={c.mass} />
      <Worker x={112} y={54} c={c} pose="roll" />
      <Worker x={62} y={92} c={c} pose="carry" />
    </g>
  );
}

/** Boom lift against a tall wall — the vertical, air-heavy frame. */
function Lift({ c }: { c: Palette }) {
  return (
    <g>
      {/* Wall mass with the coverage line; sky opens to the right. The lift
          sits in the centre band so tall crops keep the subject. */}
      <rect x="0" y="0" width="108" height="120" fill={c.mass} />
      <rect x="0" y="52" width="108" height="68" fill={c.massLit} />
      <rect x="0" y="49" width="108" height="3.4" fill={c.red} />
      <rect x="104" y="0" width="4" height="120" fill={c.lit} opacity="0.26" />
      <g stroke={c.lineSoft} strokeWidth="0.6">
        {[16, 32, 86, 104].map((y) => (
          <path key={y} d={`M0 ${y} L108 ${y}`} />
        ))}
      </g>
      <g fill={c.lit}>
        <rect x="12" y="18" width="18" height="22" opacity="0.16" />
        <rect x="52" y="18" width="18" height="22" opacity="0.1" />
      </g>

      {/* Distant block keeps wide crops from emptying out */}
      <rect x="196" y="78" width="44" height="42" fill={c.mass} opacity="0.5" />

      <g>
        <path d="M174 104 L142 68" stroke={c.mass} strokeWidth="4.6" strokeLinecap="round" />
        <path d="M142 68 L106 40" stroke={c.red} strokeWidth="3.8" strokeLinecap="round" />
        <rect x="154" y="96" width="34" height="11" rx="2.5" fill={c.mass} />
        <circle cx="162" cy="110" r="5" fill={c.mass} />
        <circle cx="180" cy="110" r="5" fill={c.mass} />
        <circle cx="162" cy="110" r="1.8" fill={c.lit} opacity="0.32" />
        <circle cx="180" cy="110" r="1.8" fill={c.lit} opacity="0.32" />
        <path
          d="M86 28 L114 28 L114 42 L86 42 Z"
          fill="none"
          stroke={c.mass}
          strokeWidth="2.2"
        />
        <rect x="86" y="41" width="28" height="2.6" fill={c.mass} />
      </g>

      <Worker x={102} y={41} c={c} pose="roll" flip />
      <rect x="0" y="114" width="240" height="6" fill={c.mass} />
    </g>
  );
}

/** Crew cutting in a long interior wall, drop cloths down. */
function Crew({ c }: { c: Palette }) {
  return (
    <g>
      <rect x="0" y="0" width="240" height="94" fill={c.massLit} />
      {/* Raw wall above, finished wall below, fresh coat rolled to a wet edge */}
      <rect x="0" y="0" width="240" height="30" fill={c.mid} opacity="0.5" />
      <rect x="0" y="56" width="240" height="38" fill={c.mass} opacity="0.35" />
      <path d="M0 30 L146 30 C 154 38, 146 48, 154 56 L0 56 Z" fill={c.red} />
      <path
        d="M146 30 C 154 38, 146 48, 154 56"
        stroke={c.redLit}
        strokeWidth="1.6"
        fill="none"
      />
      <g stroke={c.lineSoft} strokeWidth="0.6">
        <path d="M0 18 L240 18" />
      </g>

      {/* Doorways punch depth at both ends */}
      <rect x="188" y="26" width="26" height="68" fill={c.mass} />
      <rect x="188" y="26" width="26" height="1.8" fill={c.lit} opacity="0.35" />
      <rect x="10" y="34" width="20" height="60" fill={c.mass} opacity="0.7" />

      <rect x="0" y="94" width="240" height="26" fill={c.mass} />
      <path
        d="M6 100 C 60 96, 140 108, 210 99 L214 118 L4 118 Z"
        fill={c.lit}
        opacity="0.13"
      />

      {/* Ladder */}
      <g stroke={c.lit} strokeWidth="1.1" opacity="0.55" fill="none">
        <path d="M54 94 L62 32 M68 94 L74 32" />
        {[44, 54, 64, 74, 84].map((y) => (
          <path
            key={y}
            d={`M${57 + (94 - y) * 0.11} ${y} L${71 + (94 - y) * 0.08} ${y}`}
          />
        ))}
      </g>

      <rect x="150" y="88" width="11" height="6" fill={c.mass} />
      <rect x="150" y="87" width="11" height="1.5" fill={c.red} />

      <Worker x={100} y={94} c={c} pose="roll" />
      <Worker x={134} y={94} c={c} pose="roll" />
      <Worker x={172} y={94} c={c} pose="carry" flip />
      <Worker x={34} y={94} c={c} pose="stand" />
    </g>
  );
}

/** Elevated tank on legs — the municipal/industrial recoat. */
function WaterTower({ c }: { c: Palette }) {
  return (
    <g>
      {/* Skyline behind, so wide crops are not empty */}
      <g fill={c.mass} opacity="0.55">
        <rect x="0" y="76" width="46" height="44" />
        <rect x="206" y="82" width="34" height="38" />
      </g>

      <path d="M84 42 L156 42 L144 26 L96 26 Z" fill={c.mass} />
      <rect x="84" y="42" width="72" height="22" fill={c.mass} />
      <path d="M84 64 L120 78 L156 64 Z" fill={c.mass} />
      <path
        d="M96 26 L84 42 L84 64 L120 78"
        fill="none"
        stroke={c.lit}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <rect x="84" y="48" width="72" height="8" fill={c.red} />
      <rect x="84" y="48" width="72" height="1.6" fill={c.redLit} />

      <rect x="80" y="63" width="80" height="1.9" fill={c.lit} opacity="0.5" />
      <g stroke={c.lit} strokeWidth="0.7" opacity="0.35">
        {[86, 96, 106, 116, 126, 136, 146, 154].map((x) => (
          <path key={x} d={`M${x} 63 L${x} 58`} />
        ))}
      </g>

      <g stroke={c.mass} strokeWidth="3" fill="none">
        <path d="M96 76 L80 120 M144 76 L160 120 M110 78 L106 120 M130 78 L134 120" />
      </g>
      <g stroke={c.mass} strokeWidth="1.4" fill="none">
        <path d="M88 100 L152 100 M92 88 L148 88" />
        <path d="M88 100 L106 88 M106 88 L134 100 M134 100 L152 88" />
      </g>

      {/* Suspended stage on the tank */}
      <path d="M164 26 L164 54" stroke={c.line} strokeWidth="0.8" />
      <rect x="156" y="54" width="17" height="2.4" fill={c.mass} />
      <Worker x={164} y={54} c={c} pose="roll" flip scale={0.92} />

      <rect x="0" y="116" width="240" height="4" fill={c.mass} opacity="0.8" />
    </g>
  );
}

/** Structural steel under coating, worked from a suspended stage. */
function Steel({ c }: { c: Palette }) {
  const nodes = Array.from({ length: 13 }, (_, i) => i * 20);

  return (
    <g>
      <rect x="0" y="36" width="240" height="11" fill={c.mass} />
      <rect x="0" y="34" width="240" height="2" fill={c.lit} opacity="0.4" />
      <rect x="0" y="62" width="240" height="8" fill={c.mass} />
      <g stroke={c.mass} strokeWidth="3.4" fill="none">
        {nodes.slice(0, -1).map((x, i) => (
          <path
            key={x}
            d={
              i % 2 === 0
                ? `M${x} 62 L${nodes[i + 1]} 47`
                : `M${x} 47 L${nodes[i + 1]} 62`
            }
          />
        ))}
      </g>

      {/* Coated half stops mid-frame — the story of the picture */}
      <rect x="0" y="36" width="118" height="11" fill={c.red} />
      <rect x="0" y="62" width="118" height="8" fill={c.red} opacity="0.9" />

      <g fill={c.lit} opacity="0.38">
        {Array.from({ length: 28 }, (_, i) => (
          <circle key={i} cx={6 + i * 8.6} cy="41.5" r="0.85" />
        ))}
      </g>

      <g fill={c.mass}>
        <rect x="48" y="70" width="14" height="50" />
        <rect x="182" y="70" width="14" height="50" />
      </g>
      <rect x="48" y="70" width="2.2" height="50" fill={c.lit} opacity="0.18" />
      <rect x="182" y="70" width="2.2" height="50" fill={c.lit} opacity="0.18" />

      <g stroke={c.line} strokeWidth="0.8">
        <path d="M106 70 L106 86 M138 70 L138 86" />
      </g>
      <rect x="100" y="86" width="44" height="2.8" fill={c.mass} />
      <Worker x={122} y={86} c={c} pose="roll" />

      <rect x="0" y="108" width="240" height="12" fill={c.mass} opacity="0.5" />
    </g>
  );
}

/** Macro: overlapping roller passes meeting a cut-in edge. */
function Detail({ c }: { c: Palette }) {
  return (
    <g>
      <rect x="0" y="0" width="240" height="120" fill={c.mid} />
      <path
        d="M-4 14 C 60 8, 144 20, 246 10 L246 38 C 150 46, 66 34, -4 42 Z"
        fill={c.massLit}
      />
      <path
        d="M-4 44 C 75 38, 138 50, 246 40 L246 72 C 156 80, 69 68, -4 76 Z"
        fill={c.red}
      />
      <path
        d="M-4 44 C 75 38, 138 50, 246 40"
        stroke={c.redLit}
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M-4 80 C 66 74, 156 86, 246 76 L246 110 C 144 118, 60 106, -4 114 Z"
        fill={c.mass}
        opacity="0.85"
      />
      {/* Cut-in line, kept inside the centre band */}
      <path
        d="M126 -4 C 132 30, 120 60, 130 92 C 135 106, 128 116, 133 124"
        stroke={c.lit}
        strokeWidth="1.8"
        fill="none"
        opacity="0.65"
      />
      <g stroke={c.lit} strokeWidth="0.35" opacity="0.2">
        {Array.from({ length: 30 }, (_, i) => (
          <path
            key={i}
            d={`M-4 ${4 + i * 4} C 72 ${i * 4}, 150 ${10 + i * 4}, 246 ${2 + i * 4}`}
            fill="none"
          />
        ))}
      </g>
    </g>
  );
}
