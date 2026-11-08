"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * System-architecture background (same style as before, enhanced).
 *
 * Idea: a quiet engineering blueprint. Thin 45° routed lines connect
 * nodes (client, api, database, ...) and small accent-coloured data
 * packets travel along them.
 *
 * Added in this version
 *  - Requests AND responses: some packets travel back along the line.
 *  - Main nodes emit a soft "ping" ring.
 *  - Tiny request tags ("GET /", "200 OK") fade in and out near nodes.
 *  - More nodes and labels (auth, cache, storage, cdn).
 *  - Blueprint corner marks on wide screens.
 *  - A much fuller, brighter phone layout (lines, labels and packets are
 *    larger and more opaque so they are clearly visible on a small screen).
 *
 * Still true
 *  - Neutral parts use `currentColor` (theme-safe); accent is used for
 *    packets and main nodes only.
 *  - No blur filters; motion is SMIL + one-time path draw (cheap).
 *  - Fully static when the user prefers reduced motion.
 */

type Edge = {
  id: string;
  d: string;
  delay: number;
  packet?: { dur: number; begin: number; reverse?: boolean };
};
type Node = {
  id: string;
  x: number;
  y: number;
  major?: boolean;
  label?: string;
};
type Tag = {
  id: string;
  x: number;
  y: number;
  text: string;
  begin: number;
  dur: number;
};

/* ── Desktop layout (viewBox 1440 x 800) ───────────────────────── */
const D_EDGES: Edge[] = [
  {
    id: "d1",
    d: "M120 180 H220 L330 290",
    delay: 0.2,
    packet: { dur: 5, begin: 2 },
  },
  {
    id: "d2",
    d: "M330 290 V390 L240 480 V520",
    delay: 0.5,
    packet: { dur: 6, begin: 1 },
  },
  {
    id: "d3",
    d: "M240 520 V580 L300 640 H520",
    delay: 0.8,
    packet: { dur: 6, begin: 3.5, reverse: true },
  },
  {
    id: "d4",
    d: "M1000 120 H1100 L1180 200 V260",
    delay: 0.4,
    packet: { dur: 5, begin: 0.5 },
  },
  {
    id: "d5",
    d: "M1000 120 V60 H1380 V150",
    delay: 0.7,
    packet: { dur: 7, begin: 2, reverse: true },
  },
  {
    id: "d6",
    d: "M1180 260 V330 L1250 400 H1320 V430",
    delay: 1,
    packet: { dur: 6, begin: 4 },
  },
  {
    id: "d7",
    d: "M1180 260 V440 L1100 520 V560",
    delay: 1.1,
    packet: { dur: 7, begin: 2.5 },
  },
  {
    id: "d8",
    d: "M1100 560 V620 L1040 680 H900",
    delay: 1.4,
    packet: { dur: 5.5, begin: 4, reverse: true },
  },
  // new branches
  { id: "d9", d: "M120 180 V100 H260", delay: 0.9 },
  {
    id: "d10",
    d: "M520 640 H600 L660 700 H760",
    delay: 1.2,
    packet: { dur: 5, begin: 5 },
  },
];

const D_NODES: Node[] = [
  { id: "dn1", x: 120, y: 180 },
  { id: "dn2", x: 330, y: 290, major: true, label: "client" },
  { id: "dn3", x: 240, y: 520, label: "auth" },
  { id: "dn4", x: 520, y: 640, label: "cache" },
  { id: "dn5", x: 1000, y: 120 },
  { id: "dn6", x: 1180, y: 260, major: true, label: "api" },
  { id: "dn7", x: 1320, y: 430, label: "cdn" },
  { id: "dn8", x: 1100, y: 560, major: true, label: "database" },
  { id: "dn9", x: 900, y: 680, label: "storage" },
  { id: "dn10", x: 1380, y: 150 },
  { id: "dn11", x: 260, y: 100 },
  { id: "dn12", x: 760, y: 700 },
];

const D_TAGS: Tag[] = [
  { id: "t1", x: 350, y: 268, text: "GET /", begin: 1, dur: 7 },
  { id: "t2", x: 1200, y: 238, text: "200 OK", begin: 3, dur: 7 },
  { id: "t3", x: 1120, y: 538, text: "SELECT *", begin: 5, dur: 8 },
];

/* ── Phone layout (viewBox 400 x 800), kept inside x 30..370 ───── */
const M_EDGES: Edge[] = [
  {
    id: "m1",
    d: "M30 70 H80 L130 120 V230",
    delay: 0.2,
    packet: { dur: 5, begin: 0.8 },
  },
  {
    id: "m2",
    d: "M130 230 V320 L70 380 V470",
    delay: 0.5,
    packet: { dur: 6, begin: 2, reverse: true },
  },
  {
    id: "m3",
    d: "M70 470 V540 L120 590 H230 L290 650 V690",
    delay: 0.8,
    packet: { dur: 7, begin: 1.5 },
  },
  {
    id: "m4",
    d: "M370 190 H350 L320 220 V360 L350 390 H370",
    delay: 1,
    packet: { dur: 6, begin: 3 },
  },
  { id: "m5", d: "M290 690 H340 L370 720", delay: 1.3 },
  { id: "m6", d: "M70 470 H30", delay: 1.2 },
];

const M_NODES: Node[] = [
  { id: "mn1", x: 130, y: 230, major: true, label: "client" },
  { id: "mn2", x: 70, y: 470, major: true, label: "api" },
  { id: "mn3", x: 290, y: 690, major: true, label: "database" },
  { id: "mn4", x: 320, y: 360, label: "cache" },
  { id: "mn5", x: 30, y: 70 },
  { id: "mn6", x: 370, y: 720 },
];

const M_TAGS: Tag[] = [
  { id: "mt1", x: 150, y: 212, text: "GET /", begin: 1, dur: 7 },
  { id: "mt2", x: 90, y: 452, text: "200 OK", begin: 3.5, dur: 7 },
];

function Network({
  edges,
  nodes,
  tags,
  reduce,
  viewBox,
  className,
  strong = false,
}: {
  edges: Edge[];
  nodes: Node[];
  tags: Tag[];
  reduce: boolean;
  viewBox: string;
  className: string;
  /** Brighter, larger drawing for small screens */
  strong?: boolean;
}) {
  const lineOpacity = strong ? 0.28 : 0.18;
  const lineWidth = strong ? 1.5 : 1;
  const ringR = strong ? 14 : 11;
  const dotR = strong ? 4.5 : 3.5;
  const labelSize = strong ? 13 : 11;
  const labelOpacity = strong ? 0.6 : 0.45;
  const packetR = strong ? 3.4 : 2.2;
  const haloR = strong ? 9 : 6;

  return (
    <svg
      className={className}
      viewBox={viewBox}
      preserveAspectRatio={strong ? "xMidYMid meet" : "xMidYMid slice"}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lines: draw in once */}
      {edges.map((e) => (
        <motion.path
          key={e.id}
          d={e.d}
          fill="none"
          stroke="rgb(201, 192, 192)"
          strokeOpacity={lineOpacity}
          strokeWidth={lineWidth}
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut", delay: e.delay }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.id}>
          {n.major ? (
            <>
              {/* Ping ring */}
              {!reduce && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={ringR}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-accent"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values={`${ringR};${ringR * 2.3}`}
                    dur="3.6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0"
                    dur="3.6s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={ringR}
                fill="none"
                stroke="currentColor"
                strokeOpacity={strong ? 0.4 : 0.28}
              />
              <circle cx={n.x} cy={n.y} r={dotR} className="fill-accent" />
            </>
          ) : (
            <rect
              x={n.x - 3}
              y={n.y - 3}
              width="6"
              height="6"
              rx="1"
              fill="currentColor"
              fillOpacity={strong ? 0.6 : 0.4}
            />
          )}
          {n.label && (
            <text
              x={n.x + ringR + 7}
              y={n.y + 4}
              fill="currentColor"
              fillOpacity={labelOpacity}
              fontSize={labelSize}
              letterSpacing="0.08em"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              {n.label}
            </text>
          )}
        </g>
      ))}

      {/* Data packets: requests go forward, responses come back */}
      {!reduce &&
        edges
          .filter((e) => e.packet)
          .map((e) => {
            const p = e.packet!;
            const motionProps = {
              dur: `${p.dur}s`,
              begin: `${p.begin}s`,
              repeatCount: "indefinite" as const,
              path: e.d,
              ...(p.reverse
                ? {
                    keyPoints: "1;0",
                    keyTimes: "0;1",
                    calcMode: "linear" as const,
                  }
                : {}),
            };
            return (
              <g key={`p-${e.id}`} className="text-accent">
                <circle r={haloR} fill="currentColor" fillOpacity="0.16">
                  <animateMotion {...motionProps} />
                </circle>
                <circle r={packetR} fill="currentColor">
                  <animateMotion {...motionProps} />
                </circle>
              </g>
            );
          })}

      {/* Request tags that fade in and out */}
      {!reduce &&
        tags.map((t) => (
          <text
            key={t.id}
            x={t.x}
            y={t.y}
            className="fill-accent"
            fontSize={strong ? 12 : 10}
            letterSpacing="0.06em"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            opacity="0"
          >
            {t.text}
            <animate
              attributeName="opacity"
              values="0;0.55;0.55;0"
              keyTimes="0;0.12;0.8;1"
              dur={`${t.dur}s`}
              begin={`${t.begin}s`}
              repeatCount="indefinite"
            />
          </text>
        ))}
    </svg>
  );
}

export function HomeGraphicBackground() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-content"
      aria-hidden="true"
    >
      {/* 1. Two soft accent washes (gradient only, no blur filter) */}
      <motion.span
        className="absolute -left-[20%] -top-[10%] aspect-square w-[90vw] rounded-full will-change-transform sm:w-[640px]"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-rgb) / 0.07) 0%, transparent 68%)",
        }}
        animate={reduce ? undefined : { x: [0, 24, 0], y: [0, -16, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute -bottom-[15%] -right-[25%] aspect-square w-[110vw] rounded-full will-change-transform sm:-right-[8%] sm:w-[760px]"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-2-rgb) / 0.05) 0%, transparent 68%)",
        }}
        animate={reduce ? undefined : { x: [0, -28, 0], y: [0, 20, 0] }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* 2. Fine dot grid, fading toward the edges (a bit stronger on phones) */}
      <div
        className="absolute inset-0 bg-grid opacity-[0.18] sm:opacity-[0.12]"
        style={{
          maskImage:
            "radial-gradient(ellipse 100% 85% at 50% 30%, black 15%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 85% at 50% 30%, black 15%, transparent 100%)",
        }}
      />

      {/* 3. The network: one layout for phones, one for wide screens */}
      <Network
        className="absolute inset-0 h-full w-full opacity-30 md:hidden"
        viewBox="0 0 400 800"
        edges={M_EDGES}
        nodes={M_NODES}
        tags={M_TAGS}
        reduce={reduce}
        strong
      />
      <Network
        className="absolute inset-0 hidden h-full w-full md:block"
        viewBox="0 0 1440 800"
        edges={D_EDGES}
        nodes={D_NODES}
        tags={D_TAGS}
        reduce={reduce}
      />

      {/* 4. Blueprint corner marks (wide screens) */}
      <span className="absolute left-5 top-20 hidden h-5 w-5 border-l border-t border-current opacity-20 md:block" />
      <span className="absolute right-5 top-20 hidden h-5 w-5 border-r border-t border-current opacity-20 md:block" />
      <span className="absolute bottom-5 left-5 hidden h-5 w-5 border-b border-l border-current opacity-20 md:block" />
      <span className="absolute bottom-5 right-5 hidden h-5 w-5 border-b border-r border-current opacity-20 md:block" />

      {/* 5. Film grain */}
      <div className="absolute inset-0 grain opacity-20 sm:opacity-30" />
    </div>
  );
}
