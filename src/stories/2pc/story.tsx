import type { CSSProperties, ReactNode } from "react";
import type { FrameRenderProps, SceneScript } from "../../types";
import { pointBetween, segment } from "../../lib/motion";
import { FrameTemplate } from "./FrameTemplate";

type VisualBuilder = (props: FrameRenderProps) => ReactNode;

type FrameSpec = {
  id: string;
  label: string;
  narration?: string;
  durationMs?: number;
  visual: VisualBuilder;
  hideCaption?: boolean;
  title?: VisualBuilder;
  loop?: boolean;
};

function frame(spec: FrameSpec) {
  return {
    id: spec.id,
    label: spec.label,
    narration: spec.narration,
    durationMs: spec.durationMs,
    loop: spec.loop,
    Render: ({ progress, reducedMotion }: FrameRenderProps) => {
      const localProgress = spec.loop ? progress % 1 : progress;

      return (
        <FrameTemplate
          progress={localProgress}
          reducedMotion={reducedMotion}
          hideCaption={spec.hideCaption}
          title={spec.title?.({ progress: localProgress, reducedMotion })}
          caption={
            spec.narration ? (
              <span
                dangerouslySetInnerHTML={{ __html: tint(spec.narration) }}
              />
            ) : undefined
          }
        >
          {spec.visual({ progress: localProgress, reducedMotion })}
        </FrameTemplate>
      );
    },
  };
}

type Rule = [RegExp, string];

const phraseRules: Rule[] = [
  [
    /\bTransaction Coordinator\b/g,
    '<span class="text-figmaPurple font-bold">Transaction Coordinator</span>',
  ],
  [
    /\btransaction coordinator\b/g,
    '<span class="text-figmaPurple font-bold">transaction coordinator</span>',
  ],
  [
    /\btransaction operations\b/g,
    '<span class="text-blue-700 font-bold">transaction operations</span>',
  ],
  [
    /\blocal checks\b/g,
    '<span class="text-yellow-700 font-bold">local checks</span>',
  ],
];

const rules: Rule[] = [
  [/\bShard 1\b/g, '<span class="text-pink-700 font-bold">Shard 1</span>'],
  [/\bShard 2\b/g, '<span class="text-pink-700 font-bold">Shard 2</span>'],

  // longer first
  [
    /\bPREPARED\b/g,
    '<span class="text-figmaTeal font-extrabold">PREPARED</span>',
  ],
  [/\bPREPARE\b/g, '<span class="text-figmaTeal font-bold">PREPARE</span>'],

  [
    /\bCOMMITTED\b/g,
    '<span class="text-figmaGreen font-extrabold">COMMITTED</span>',
  ],
  [/\bCOMMIT\b/g, '<span class="text-figmaDark font-extrabold">COMMIT</span>'],
  [/\bABORT\b/g, '<span class="text-figmaRed font-extrabold">ABORT</span>'],
  [/\bACTIVE\b/g, '<span class="text-figmaDark font-extrabold">ACTIVE</span>'],

  // plural first
  [
    /\bparticipants\b/g,
    '<span class="text-figmaBlue font-bold">participants</span>',
  ],
  [
    /\bparticipant\b/g,
    '<span class="text-figmaBlue font-bold">participant</span>',
  ],
  [
    /\bParticipant\b/g,
    '<span class="text-figmaBlue font-bold">Participant</span>',
  ],

  [
    /\btransactions\b/g,
    '<span class="text-orange-700 font-bold">transactions</span>',
  ],
  [
    /\btransaction\b/g,
    '<span class="text-orange-700 font-bold">transaction</span>',
  ],
  [
    /\bcoordinator\b/g,
    '<span class="text-figmaPurple font-bold">coordinator</span>',
  ],

  [/\bActive\b/g, '<span class="text-black font-bold">Active</span>'],

  [/\bAborted\b/g, '<span class="text-red-600 font-bold">Aborted</span>'],
  [/\bAbort\b/g, '<span class="text-black font-bold">Abort</span>'],

  [/\bPrepared\b/g, '<span class="text-black font-bold">Prepared</span>'],
  [/\bPrepare\b/g, '<span class="text-black font-bold">Prepare</span>'],

  [/\bCommited\b/g, '<span class="text-green-700 font-bold">Commited</span>'],
  [/\bCommit\b/g, '<span class="text-black font-bold">Commit</span>'],

  [/\bclient\b/g, '<span class="text-green-700 font-bold">client</span>'],
  [/\bdatabase\b/g, '<span class="text-purple-700 font-bold">database</span>'],
  [/\bshards\b/g, '<span class="text-pink-700 font-bold">shards</span>'],

  [/\bYES\b/g, '<span class="text-figmaGreen font-extrabold">YES</span>'],
  [/\bNO\b/g, '<span class="text-figmaRed font-extrabold">NO</span>'],
];

export function tint(text: string) {
  // 1) Protect phrases with placeholders BEFORE any HTML is injected
  const stash: string[] = [];
  const makeToken = (i: number) => `\uE000${i}\uE001`; // private-use chars: unlikely to appear in real text

  let out = text;

  for (const [re, html] of phraseRules) {
    out = out.replace(re, () => {
      const token = makeToken(stash.length);
      stash.push(html);
      return token;
    });
  }

  // 2) Apply normal single-word rules
  for (const [re, html] of rules) {
    out = out.replace(re, html);
  }

  // 3) Restore phrases last (so they win)
  for (let i = 0; i < stash.length; i++) {
    const tokenRe = new RegExp(makeToken(i), "g");
    out = out.replace(tokenRe, stash[i]);
  }

  return out;
}

function Abs({
  children,
  style,
  className,
}: {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={["absolute", className ?? ""].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}

function TitleVisual({ text }: { text: string }) {
  return (
    <Abs className="inset-0 grid place-items-center px-12">
      <h1 className="m-0 max-w-4xl text-center text-5xl font-bold leading-tight tracking-tight text-slate-600">
        {text}
      </h1>
    </Abs>
  );
}

function TxBox({
  x,
  y,
  lines,
  scale = 1,
  borderColor = "#d54b0f",
}: {
  x: string;
  y: string;
  lines: string[];
  scale?: number;
  borderColor?: string;
}) {
  return (
    <Abs
      style={{
        left: x,
        top: y,
        borderColor,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
      className="border-2 bg-transparent px-[14px] py-[10px] text-[clamp(1rem,1.4vw,1.4rem)] leading-[1.2] text-[#3b3b3b] font-mono"
    >
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </Abs>
  );
}

function Node({
  x,
  y,
  label,
  variant = "participant",
  size = "md",
}: {
  x: string;
  y: string;
  label?: string;
  variant?: "coordinator" | "participant" | "prepared";
  size?: "md" | "big" | "sm";
}) {
  const sizeClass =
    size === "big"
      ? "w-[20%]"
      : size === "sm"
        ? "w-[7%] text-[1.1rem]"
        : "w-[13%]";
  const variantClass =
    variant === "coordinator"
      ? "bg-[radial-gradient(circle_at_35%_28%,#9e1eff_0%,#8208e4_65%,#6f05cb_100%)]"
      : variant === "prepared"
        ? "bg-figmaBlue"
        : "bg-figmaTeal";
  return (
    <Abs
      style={{ left: x, top: y }}
      className={`${sizeClass} aspect-square rounded-full grid place-items-center text-white font-bold shadow-[0_8px_30px_rgba(33,42,58,0.08)] ${variantClass}`}
    >
      {label}
    </Abs>
  );
}

function Msg({
  x,
  y,
  text,
  tone,
}: {
  x: string;
  y: string;
  text: string;
  tone: "teal" | "green" | "red" | "dark";
}) {
  const toneClass =
    tone === "teal"
      ? "text-figmaTeal"
      : tone === "green"
        ? "text-figmaGreen"
        : tone === "red"
          ? "text-figmaRed"
          : "text-figmaDark";
  return (
    <Abs
      style={{ left: x, top: y }}
      className={`font-extrabold tracking-[0.05em] text-[clamp(0.75rem,1vw,0.95rem)] ${toneClass}`}
    >
      {text}
    </Abs>
  );
}

function Line({
  left,
  top,
  width,
  rotate,
}: {
  left: string;
  top: string;
  width: string;
  rotate: number;
}) {
  return (
    <Abs
      style={{
        left,
        top,
        width,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "left center",
      }}
      className="h-[3px] bg-[#9eaec2]"
    />
  );
}

function AnimatedDot({
  progress,
  from,
  to,
  color = "#0f8b83",
  start = 0.05,
  end = 0.55,

  // NEW
  size = "sm",
  label,
  className = "",
}: {
  progress: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  start?: number;
  end?: number;

  size?: "xs" | "sm" | "md" | "lg" | number;
  label?: string;
  className?: string;
}) {
  const sizeClass =
    typeof size === "number"
      ? "" // fallback to inline for custom px
      : {
          xs: "w-6 h-6 text-xs",
          sm: "w-8 h-8 text-xs",
          md: "w-12 h-12 text-lg",
          lg: "w-16 h-16 text-lg",
        }[size];

  const inlineSize =
    typeof size === "number"
      ? { width: size, height: size, fontSize: size * 0.6 }
      : {};

  return (
    <AnimateBetween
      progress={progress}
      from={from}
      to={to}
      start={start}
      end={end}
      fade
      scaleIn
    >
      <Abs
        style={{
          background: color,
          ...inlineSize,
        }}
        className={`
          rounded-full
          flex items-center justify-center
          font-semibold text-white
          ${sizeClass}
          ${className}
        `}
      >
        {label}
      </Abs>
    </AnimateBetween>
  );
}

function AnimateBetween({
  progress,
  from,
  to,
  start = 0,
  end = 1,
  fade = false,
  fadeOut = true,
  scaleIn = false,
  className = "",
  children,
}: {
  progress: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  start?: number;
  end?: number;
  fade?: boolean;
  fadeOut?: boolean;
  scaleIn?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const p = segment(progress, start, end);
  const pt = pointBetween(from, to, p);

  const fadeOffset = 0.06;

  const fadeIn = segment(progress, start + 0.02, start + fadeOffset);
  const fadeOutProgress = 1 - segment(progress, end - fadeOffset, end - 0.02);

  const opacity = fade
    ? fadeOut
      ? Math.min(fadeIn, fadeOutProgress)
      : fadeIn
    : 1;
  const scale = scaleIn ? 0.8 + 0.2 * opacity : 1;

  return (
    <Abs
      style={{
        left: `${pt.x}%`,
        top: `${pt.y}%`,
        transform: `scale(${scale})`,
        opacity,
      }}
      className={className}
    >
      {children}
    </Abs>
  );
}

function PreparedDashed({
  x,
  y,
  label,
}: {
  x: string;
  y: string;
  label?: string;
}) {
  return (
    <>
      <Node x={x} y={y} label={label} variant="prepared" size="sm" />
      <Abs
        style={{ left: x, top: y }}
        className="w-[7%] aspect-square rounded-full outline outline-[4px] outline-dashed outline-[#1e1e1e] outline-offset-[4px]"
      />
    </>
  );
}

function clampProgress(p: number, start: number, end: number) {
  if (p < start) return 0;
  if (p > end) return 1;
  return (p - start) / (end - start);
}

export const twoPcScenes: SceneScript[] = [
  {
    id: "motivation",
    title: "Motivation",
    steps: [
      frame({
        id: "title",
        label: "Title",
        hideCaption: true,
        title: () => (
          <TitleVisual text="The Motivation behind Two-Phase Commit" />
        ),
        visual: () => null,
        loop: false,
      }),
      frame({
        id: "intro-client",
        label: "Intro",
        hideCaption: false,
        narration: "Let's say we have a client",
        durationMs: 2500,
        loop: false,
        visual: ({ progress }) => {
          const scaleP = clampProgress(progress, 0.05, 0.35);
          const scale = scaleP;
          const opacity = clampProgress(progress, 0.0, 0.2);

          return (
            <div className="relative w-full h-full">
              <Abs
                style={{
                  left: "31%",
                  top: "50%",
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  opacity,
                }}
              >
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </Abs>
            </div>
          );
        },
      }),
      frame({
        id: "intro-database",
        label: "Intro",
        hideCaption: false,
        narration: "and a database",
        durationMs: 2500,
        loop: false,
        visual: ({ progress }) => {
          const scaleP = clampProgress(progress, 0.05, 0.35);
          const scale = scaleP;
          const opacity = clampProgress(progress, 0.0, 0.2);

          return (
            <div className="relative w-full h-full">
              <Abs
                style={{
                  left: "31%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </Abs>

              <Abs
                style={{
                  left: "67%",
                  top: "50%",
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  opacity,
                }}
              >
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </Abs>
            </div>
          );
        },
      }),
      frame({
        id: "intro",
        label: "Intro",
        hideCaption: false,
        narration:
          "This client that issues a sequence of read and write operations against a database",
        durationMs: 8000,
        visual: ({ progress }) => {
          const readP = clampProgress(progress, 0.1, 0.7);
          const write1P = clampProgress(progress, 0.2, 0.8);
          const write2P = clampProgress(progress, 0.3, 0.9);

          return (
            <div className="relative w-full h-full">
              {/* Nodes */}
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </div>

              <AnimatedDot
                progress={readP}
                from={{ x: 35, y: 47 }}
                to={{ x: 60, y: 47 }}
                color="#3B82F6"
                label="R"
                size="md"
                start={0.0}
                end={0.7}
              />

              <AnimatedDot
                progress={write1P}
                from={{ x: 35, y: 47 }}
                to={{ x: 60, y: 47 }}
                color="#3B82F6"
                label="W"
                size="md"
                start={0.2}
                end={0.8}
              />

              <AnimatedDot
                progress={write2P}
                from={{ x: 30, y: 47 }}
                to={{ x: 60, y: 47 }}
                color="#3B82F6"
                label="W"
                size="md"
                start={0.3}
                end={0.9}
              />
            </div>
          );
        },
        loop: true,
      }),
      frame({
        id: "intro-transaction",
        label: "Intro",
        hideCaption: false,
        narration:
          "Each client may want to batch certain read and write operations for the database to execute as a single logical unit, we call this logical unit a transaction",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 35, y: 50 }}
                to={{ x: 60, y: 50 }}
                start={0.0}
                end={0.8}
                fade
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      R
                    </div>
                    <div className="h-1 w-4 shrink-0 bg-orange-500" />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div className="h-1 w-4 shrink-0 bg-orange-500" />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-shard",
        label: "Intro",
        hideCaption: false,
        narration:
          "Since our database is monolithic, we can rely on local mechanisms (i.e. write ahead logging) to enforce transaction atomicity, also known as preventing a partially applied transaction",
        durationMs: 4000,
        loop: true,
        visual: ({ progress }) => {
          const ackStart = 0.75;
          const ackEnd = 0.98;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 35, y: 50 }}
                to={{ x: 60, y: 50 }}
                start={0.0}
                end={0.75}
                fade
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      R
                    </div>
                    <div className="h-1 w-4 shrink-0 bg-orange-500" />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div className="h-1 w-4 shrink-0 bg-orange-500" />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </AnimateBetween>

              {progress >= ackStart && (
                <AnimateBetween
                  progress={progress}
                  from={{ x: 60, y: 50 }}
                  to={{ x: 35, y: 50 }}
                  start={ackStart}
                  end={ackEnd}
                  scaleIn
                >
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    <div className="h-8 w-8 rounded-full bg-green-500" />
                  </div>
                </AnimateBetween>
              )}
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-shard",
        label: "Intro",
        hideCaption: false,
        narration: "But if our database gets too big...",
        durationMs: 4200,
        loop: false,
        visual: ({ progress }) => {
          const growth = clampProgress(progress, 0.25, 0.95);
          const dbSize = 190 + growth * 280;
          const traffic = [
            { kind: "W", start: 0.04, end: 0.44, color: "#2563eb" },
            { kind: "W", start: 0.14, end: 0.54, color: "#2563eb" },
            { kind: "W", start: 0.24, end: 0.64, color: "#2563eb" },
            { kind: "W", start: 0.34, end: 0.74, color: "#2563eb" },
            { kind: "W", start: 0.46, end: 0.9, color: "#2563eb" },
          ];

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div
                  className="shrink-0 rounded-full bg-purple-700"
                  style={{
                    width: `${dbSize}px`,
                    height: `${dbSize}px`,
                  }}
                />
              </div>

              {/* <div className="-translate-x-1/2 -translate-y-1/2"> */}
              <div className="flex items-center whitespace-nowrap">
                {traffic.map((packet) => (
                  <AnimateBetween
                    key={`${packet.kind}-${packet.start}`}
                    progress={progress}
                    from={{ x: 25, y: 47 }}
                    to={{ x: 40, y: 47 }}
                    start={packet.start}
                    end={packet.end}
                    fade
                    scaleIn
                  >
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      {packet.kind}
                    </div>
                  </AnimateBetween>
                ))}
              </div>
            </div>
            // </div>
          );
        },
      }),
      frame({
        id: "intro-split-into-shard",
        label: "Intro",
        hideCaption: false,
        narration:
          "We may need to partition our database into independent managed subsets of data. These partitions are also known as shards",
        durationMs: 4200,
        loop: true,
        visual: ({ progress }) => {
          const splitP = clampProgress(progress, 0.25, 0.85);
          const monolithScale = 1 - splitP * 0.45;
          const monolithOpacity = 1 - splitP * 0.85;
          const shardOpacity = clampProgress(progress, 0.35, 0.9);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-16">
                <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                  <div className="flex flex-col justify-center text-white text-bold text-8xl">
                    1
                  </div>
                </div>
                <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                  <div className="flex flex-col justify-center text-white text-bold text-8xl">
                    2
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-shared-desc",
        label: "Intro",
        hideCaption: false,
        narration:
          "Let's say Shard 1 stores rows 100 - 199, and Shard 2 stores rows 200 - 299",
        durationMs: 3000,
        loop: false,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>1</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">100 - 199</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-shared-sole-shard-transaction",
        label: "Intro",
        hideCaption: false,
        narration:
          "If a client issues a transaction, in which all reads and writes only access rows 100 - 199, then the entire transaction is handled by Shard 1",
        durationMs: 4500,
        loop: true,
        visual: ({ progress }) => {
          const txP = clampProgress(progress, 0.05, 1.0);
          const ackP = clampProgress(progress, 0.05, 1.0);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>1</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">100 - 199</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={txP}
                from={{ x: 35, y: 50 }}
                to={{ x: 69, y: 35 }}
                start={0.05}
                end={0.5}
                fade
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div className="h-4 w-1 shrink-0 bg-orange-500" />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={ackP}
                from={{ x: 69, y: 33 }}
                to={{ x: 35, y: 47 }}
                start={0.5}
                end={0.92}
                fade
                scaleIn
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="h-8 w-8 rounded-full bg-green-500" />
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-shared-sole-shard-failed-transaction",
        label: "Intro",
        hideCaption: false,
        narration:
          "If Shard 1 crashes or is unable to handle this transaction, then its local mechanisms will still enforce transaction atomicity",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          const txP = clampProgress(progress, 0.05, 1.0);
          const ackP = clampProgress(progress, 0.05, 1.0);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>1</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">100 - 199</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={txP}
                from={{ x: 35, y: 50 }}
                to={{ x: 69, y: 35 }}
                start={0.05}
                end={0.5}
                fade
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div className="h-4 w-1 shrink-0 bg-orange-500" />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={ackP}
                from={{ x: 69, y: 33 }}
                to={{ x: 35, y: 47 }}
                start={0.5}
                end={0.92}
                fade
                scaleIn
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="h-8 w-8 rounded-full bg-red-500" />
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-shared-multi-shard-transaction",
        label: "Intro",
        hideCaption: false,
        narration:
          "But what happens if a client issues a transaction that updates rows in different shards?",
        durationMs: 4500,
        loop: true,
        visual: ({ progress }) => {
          const txStart = 0.0;
          const txEnd = 0.76;
          const txLinear = clampProgress(progress, txStart, txEnd);
          const txPt = pointBetween(
            { x: 37, y: 50 },
            { x: 58, y: 50 },
            txLinear,
          );
          const lineGrow = clampProgress(progress, 0.0, 0.72);
          const lineHeight = 16 + lineGrow * 164;
          const fadeOut = 1 - segment(progress, 0.82, 0.98);
          const txOpacity = progress < txStart ? 0 : fadeOut;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>1</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">100 - 199</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Abs
                style={{
                  left: `${txPt.x}%`,
                  top: `${txPt.y}%`,
                  opacity: txOpacity,
                  transform: `scale(${0.9 + 0.1 * txLinear})`,
                }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div
                      className="w-1 shrink-0 bg-orange-500"
                      style={{ height: `${lineHeight}px` }}
                    />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </Abs>
            </div>
          );
        },
      }),
      frame({
        id: "intro-shared-multi-shard-transaction-2",
        label: "Intro",
        hideCaption: false,
        narration:
          "Let's say a transaction containing two writes updates both Shard 1 and Shard 2",
        durationMs: 4000,
        loop: true,
        visual: ({ progress }) => {
          const txStart = 0.0;
          const txEnd = 0.76;
          const txLinear = clampProgress(progress, txStart, txEnd);
          const txPt = pointBetween(
            { x: 37, y: 50 },
            { x: 58, y: 50 },
            txLinear,
          );
          const lineGrow = clampProgress(progress, 0.0, 0.72);
          const lineHeight = 16 + lineGrow * 164;
          const fadeOut = 1 - segment(progress, 0.82, 0.98);
          const txOpacity = progress < txStart ? 0 : fadeOut;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>1</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">100 - 199</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Abs
                style={{
                  left: `${txPt.x}%`,
                  top: `${txPt.y}%`,
                  opacity: txOpacity,
                  transform: `scale(${0.9 + 0.1 * txLinear})`,
                }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div
                      className="w-1 shrink-0 bg-orange-500"
                      style={{ height: `${lineHeight}px` }}
                    />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </Abs>
            </div>
          );
        },
      }),
      frame({
        id: "intro-shared-multi-shard-transaction-fail",
        label: "Intro",
        hideCaption: false,
        narration:
          "If Shard 1 fails to commit but Shard 2 commits successfully, the transaction becomes partially applied, violating atomicity",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          const txStart = 0.0;
          const txEnd = 0.5;
          const txLinear = clampProgress(progress, txStart, txEnd);
          const txPt = pointBetween(
            { x: 37, y: 50 },
            { x: 58, y: 50 },
            txLinear,
          );
          const lineGrow = clampProgress(progress, 0.0, 0.4);
          const lineHeight = 16 + lineGrow * 164;
          const fadeOut = 1 - segment(progress, 0.5, 0.62);
          const txOpacity = progress < txStart ? 0 : fadeOut;
          const returnStart = 0.55;
          const returnEnd = 0.9;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>1</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">100 - 199</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Abs
                style={{
                  left: `${txPt.x}%`,
                  top: `${txPt.y}%`,
                  opacity: txOpacity,
                  transform: "scale(1)",
                }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div
                      className="w-1 shrink-0 bg-orange-500"
                      style={{ height: `${lineHeight}px` }}
                    />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </Abs>

              {progress >= returnStart && (
                <AnimateBetween
                  progress={progress}
                  from={{ x: 65, y: 35 }}
                  to={{ x: 37, y: 47 }}
                  start={returnStart}
                  end={returnEnd}
                  scaleIn
                >
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    <div className="h-8 w-8 rounded-full bg-red-500" />
                  </div>
                </AnimateBetween>
              )}

              {progress >= returnStart && (
                <AnimateBetween
                  progress={progress}
                  from={{ x: 65, y: 65 }}
                  to={{ x: 37, y: 53 }}
                  start={returnStart}
                  end={returnEnd}
                  scaleIn
                >
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    <div className="h-8 w-8 rounded-full bg-green-500" />
                  </div>
                </AnimateBetween>
              )}
            </div>
          );
        },
      }),
      frame({
        id: "intro-final",
        label: "Intro",
        hideCaption: true,
        narration: "",
        durationMs: 6000,
        loop: false,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex flex-col justify-center items-center h-full my-24 gap-16 text-3xl text-center">
                <div className="">
                  To prevent such partial commits, the system must coordinate
                  the commit decision across{" "}
                  <span className="font-bold text-pink-700">shards</span>,
                  ensuring that either all{" "}
                  <span className="font-bold text-pink-700">shards</span> commit
                  or none do
                </div>
                <div>
                  This is the motivation behind{" "}
                  <span className="font-bold">Two-Phase Commit (2PC)</span>
                </div>
              </div>
            </div>
          );
        },
      }),
    ],
  },
  {
    id: "two-phase-commit",
    title: "Two Phase Commit Protocol",
    steps: [
      frame({
        id: "intro-transaction-coordinator",
        label: "Transaction Coordinator",
        hideCaption: true,
        narration: "",
        title: () => <TitleVisual text="Two-Phase Commit (2PC) Protocol" />,
        visual: () => null,
        loop: false,
      }),
      frame({
        id: "intro-transaction-coordinator",
        label: "Transaction Coordinator",
        hideCaption: false,
        narration:
          "This is a Transaction Coordinator. It’s responsible for managing the protocol, ensuring all nodes reach a unanimous decision, maintaining consistency and integrity",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-purple-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "This is a Participant. They execute transaction operations given to them by the transaction coordinator. In a database system, a participant is typically a shard responsible for a subset of the data",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration: "A participant may be in 1 of 4 states",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "A participant starts off as Active, from here it may either Abort or Prepare",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "A participant may be in the Prepared state, from here it may either Abort or Commit",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700 outline outline-8 outline-dashed outline-black" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "A participant may be in the Aborted state. This is a terminal state",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700 outline outline-8 outline-red-500" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "And a participant may be in the Commited state, which is also a terminal state",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700 outline outline-8 outline-green-500" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "In this protocol, all transactions issued by a client go through the transaction coordinator which routes transaction operations to the appropriate shards",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-64">
                <div className="aspect-square w-48 shrink-0 rounded-full bg-green-700" />
                <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                <div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">21 - 30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 24, y: 47 }}
                to={{ x: 42, y: 47 }}
                start={0.02}
                end={0.32}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white"></div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 55, y: 47 }}
                to={{ x: 78, y: 27 }}
                start={0.35}
                end={0.65}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 55, y: 47 }}
                to={{ x: 78, y: 47 }}
                start={0.68}
                end={0.98}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-explanation",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "While the coordinator may communicate with all shards, participant status is defined per transaction and includes only shards involved in that transaction",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-64">
                <div className="aspect-square w-48 shrink-0 rounded-full bg-green-700" />
                <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                <div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">21 - 30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 24, y: 47 }}
                to={{ x: 42, y: 47 }}
                start={0.02}
                end={0.32}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white"></div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 55, y: 47 }}
                to={{ x: 78, y: 27 }}
                start={0.35}
                end={0.65}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 55, y: 47 }}
                to={{ x: 78, y: 47 }}
                start={0.68}
                end={0.98}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-explanation-shard",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "For this transaction, only the first two shards are considered participants, since they contain the affected rows",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">21 - 30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-coordinator-req",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "Upon receiving a transaction, the coordinator sends a PREPARE request to all participants of the transaction, asking the participants to prepare to commit the transaction",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 44 }}
                to={{ x: 67, y: 36 }}
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-2xl text-white">
                  5
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 51 }}
                to={{ x: 67, y: 58 }}
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-2xl text-white">
                  15
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-participant-checking",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "Still in the ACTIVE state, each participant conducts local checks to ensure that it can guarantee a commit if instructed by the coordinator",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div className="px-7">
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="flex flex-row gap-2 items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">1 - 10</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid aspect-square h-12 w-12 shrink-0 place-items-center rounded-full bg-yellow-600 text-2xl text-white">
                      5
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">11 - 20</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid aspect-square h-12 w-12 shrink-0 place-items-center rounded-full bg-yellow-600 text-2xl text-white">
                      15
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-yes",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "If a participant passes local checks, it votes YES, indicating that it has entered a PREPARED state and can commit if instructed",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline-dashed outline-4 outline-offset-1">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 36 }}
                to={{ x: 47, y: 46 }}
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-green-700 text-2xl text-white">
                  5
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-no",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "If a participant fails local checks, it votes NO, indicating to the coordinator that the transaction cannot commit and must be aborted",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-red-500 outline-4">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 56 }}
                to={{ x: 47, y: 46 }}
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-500 text-2xl text-white">
                  15
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-in-db",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "These local checks include acquiring locks, validating constraints (i.e. there’s enough storage), and writing and flushing a PREPARED record to its write-ahead log (WAL)",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div className="">
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="flex flex-row items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">1 - 10</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <TxBox
                        x="89%"
                        y="40%"
                        scale={1.2}
                        borderColor="#0f766e"
                        lines={["PREPARE TO UPDATE ROW 5"]}
                      ></TxBox>
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">11 - 20</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <TxBox
                        x="89%"
                        y="60%"
                        scale={1.2}
                        borderColor="#0f766e"
                        lines={["PREPARE TO UPDATE ROW 15"]}
                      ></TxBox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "prepare-req-commit-if-all-yes",
        label: "Commit",
        hideCaption: false,
        narration:
          "If all participants vote YES, the coordinator sends a COMMIT request to all participants to finalize the transaction",
        durationMs: 8000,
        loop: false,
        visual: ({ progress }) => {
          const preparedOpacity = 1;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedOpacity }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedOpacity }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 36 }}
                to={{ x: 40, y: 46 }}
                start={0.04}
                end={0.38}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-green-600 text-2xl text-white">
                  5
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 56 }}
                to={{ x: 40, y: 52 }}
                start={0.08}
                end={0.42}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-green-600 text-2xl text-white">
                  15
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 44 }}
                to={{ x: 67, y: 36 }}
                start={0.58}
                end={0.8}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 52 }}
                to={{ x: 67, y: 58 }}
                start={0.58}
                end={0.8}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "participants-commit-and-ack",
        label: "Committed",
        hideCaption: false,
        narration:
          "Upon receiving the coordinator's COMMIT request, each participant finalizes the transaction, enters the COMMITTED state, and acknowledges the decision",
        durationMs: 7000,
        loop: true,
        visual: ({ progress }) => {
          const committedP = clampProgress(progress, 0.18, 0.56);
          const ackOpacity = committedP;
          const commitReqOpacity = 1 - segment(progress, 0.18, 0.28);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - committedP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: committedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - committedP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: committedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Abs
                style={{ left: "68%", top: "40%", opacity: commitReqOpacity }}
              >
                <div className="grid aspect-square w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Abs>

              <Abs
                style={{ left: "68%", top: "60%", opacity: commitReqOpacity }}
              >
                <div className="grid aspect-square w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Abs>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 36 }}
                to={{ x: 47, y: 44 }}
                start={0.34}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div
                  className="aspect-square w-10 rounded-full bg-green-700"
                  style={{ opacity: ackOpacity }}
                />
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 58 }}
                to={{ x: 47, y: 52 }}
                start={0.34}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div
                  className="aspect-square w-10 rounded-full bg-green-700"
                  style={{ opacity: ackOpacity }}
                />
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "commit-phase-if-all-yes-done",
        label: "Commit Done",
        hideCaption: false,
        narration:
          "At this point, the transaction is finished and its effects are durably committed",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "transition-to-abort",
        label: "Abort Path",
        hideCaption: true,
        durationMs: 5000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-12">
                <p className="m-0 text-center text-[2.05rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>Now let&apos;s see what happens if a </span>
                  <span className="font-bold text-blue-700">participant</span>
                  <span> aborts</span>
                </p>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "commit-phase-if-even-one-no",
        label: "Abort Vote",
        hideCaption: false,
        narration:
          "If any participant votes NO, the coordinator sends an ABORT request to all participants, instructing them to rollback their PREPARED transaction",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          const abortedP = clampProgress(progress, 0.72, 0.92);
          const preparedTopOpacity = 1 - abortedP;
          const abortTopOpacity = abortedP;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedTopOpacity }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-500"
                      style={{ opacity: abortTopOpacity }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-red-500">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 72, y: 37 }}
                to={{ x: 43, y: 46 }}
                start={0.05}
                end={0.4}
                fade
                scaleIn
              >
                <div className="aspect-square w-10 rounded-full bg-green-600" />
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 72, y: 57 }}
                to={{ x: 43, y: 52 }}
                start={0.05}
                end={0.4}
                fade
                scaleIn
              >
                <div className="aspect-square w-10 rounded-full bg-red-500" />
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 46 }}
                to={{ x: 67, y: 37 }}
                start={0.48}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-700 text-xl font-bold text-white">
                  A
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 52 }}
                to={{ x: 67, y: 57 }}
                start={0.48}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-700 text-xl font-bold text-white">
                  A
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "two-phase-commit-final-note",
        label: "2PC Summary",
        hideCaption: true,
        durationMs: 7000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-16 py-12">
                <div className="text-center text-[1.95rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>The </span>
                  <span className="font-extrabold text-teal-700">PREPARED</span>
                  <span> state allows </span>
                  <span className="font-bold text-blue-700">participants</span>
                  <span> to hold </span>
                  <span className="font-bold text-orange-700">
                    transactions
                  </span>
                  <span>
                    {" "}
                    that have not yet committed, so their changes remain
                    invisible and can be rolled back if the{" "}
                  </span>
                  <span className="font-bold text-figmaPurple">
                    coordinator
                  </span>
                  <span> decides to </span>
                  <span className="font-bold text-red-700">abort</span>
                </div>
              </div>
            </div>
          );
        },
      }),
    ],
  },
  {
    id: "exploring-partition-tolerance",
    title: "Exploring Partition Tolerance with Two-Phase Commit (2PC)",
    steps: [
      frame({
        id: "intro-failure-modes",
        label: "Potential Failure Modes",
        hideCaption: true,
        narration: "",
        title: () => (
          <TitleVisual text="Exploring Partition Tolerance with Two-Phase Commit (2PC)" />
        ),
        visual: () => null,
        loop: false,
      }),
      frame({
        id: "coordinator-crash",
        label: "Coordinator Crash",
        hideCaption: true,
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-16">
                <p className="m-0 max-w-[86%] text-center text-[2.05rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>Let&apos;s explore what happens if the </span>
                  <span className="font-bold text-figmaPurple">
                    coordinator
                  </span>
                  <span>
                    {" "}
                    becomes unreachable (i.e. coordinator crash, network
                    partition, routing failure, etc)
                  </span>
                </p>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-crash-before-active",
        label: "Before Active",
        hideCaption: false,
        narration:
          "If the coordinator begins sending PREPARE requests and crashes after, we run into a problem",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          const preparedP = clampProgress(progress, 0.5, 0.95);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg"></div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 46 }}
                to={{ x: 72, y: 37 }}
                start={0.2}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  X
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 52 }}
                to={{ x: 72, y: 57 }}
                start={0.2}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  Y
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "prepared-blocked-before-decision",
        label: "Prepared Blocking",
        hideCaption: false,
        narration:
          "Once participants enter the PREPARED state but before the coordinator gets to send out either a COMMIT or ABORT request, they may not unilaterally abort",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-unreachable-participant-blocked",
        label: "Participant Blocked",
        hideCaption: false,
        narration:
          "Considering a coordinator crash, once in the PREPARED state, a participant cannot independently roll back the transaction",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "prepared-unilateral-abort-breaks-atomicity",
        label: "Atomicity Risk",
        hideCaption: false,
        narration:
          "If participants were able to unilaterally abort, after entering the PREPARED state, then atomicity could be violated",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participants-a-b-timeout-abort",
        label: "Timeout Abort Hypothesis",
        hideCaption: false,
        narration:
          "Let's say Participant A and Participant B, after entering the PREPARED state, have the ability to unilaterally abort, based on a timeout to reach the coordinator",
        durationMs: 10000,
        loop: true,
        visual: ({ progress }) => {
          const aTimeoutP = clampProgress(progress, 0.08, 0.5);
          const bTimeoutP = clampProgress(progress, 0.2, 0.78);
          const aAbortP = clampProgress(progress, 0.5, 0.62);
          const bAbortP = clampProgress(progress, 0.78, 0.9);

          const aRemainingDeg = (1 - aTimeoutP) * 360;
          const bRemainingDeg = (1 - bTimeoutP) * 360;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${aRemainingDeg}deg, transparent ${aRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - aAbortP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400 z-10"
                      style={{ opacity: aAbortP }}
                    />
                    <span className="relative z-20">A</span>
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${bRemainingDeg}deg, transparent ${bRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - bAbortP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400 z-10"
                      style={{ opacity: bAbortP }}
                    />
                    <span className="relative z-20">B</span>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participant-a-aborts-first",
        label: "A Aborts",
        hideCaption: false,
        narration:
          "Let's say Participant A independently aborts after not hearing back from the coordinator after some time",
        durationMs: 9500,
        loop: false,
        visual: ({ progress }) => {
          const aTimeoutP = clampProgress(progress, 0.1, 0.55);
          const bTimeoutP = clampProgress(progress, 0.1, 1.25);
          const aAbortStateP = clampProgress(progress, 0.55, 0.68);

          const aRemainingDeg = (1 - aTimeoutP) * 360;
          const bRemainingDeg = (1 - bTimeoutP) * 360;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${aRemainingDeg}deg, transparent ${aRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - aAbortStateP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400 z-10"
                      style={{ opacity: aAbortStateP }}
                    />
                    <span className="relative z-20">A</span>
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${bRemainingDeg}deg, transparent ${bRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <span className="relative z-20">B</span>
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-recovers-b-commits",
        label: "B Commits",
        hideCaption: false,
        narration:
          "If the coordinator recovers from the crash and sends out the COMMIT request, before Participant B's timeout clock finishes, Participant B commits",
        durationMs: 6500,
        loop: true,
        visual: ({ progress }) => {
          const bCommitP = clampProgress(progress, 0.58, 0.88);
          const bTimeoutDrainP = clampProgress(progress, 0.12, 0.95);
          const bTimeoutRemainderP = 0.2 - 0.25 * bTimeoutDrainP;
          const bRemainingDeg = bTimeoutRemainderP * 360;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-red-400">
                    A
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${bRemainingDeg}deg, transparent ${bRemainingDeg}deg 360deg)`,
                        opacity: 1 - bCommitP,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <span className="relative z-20">B</span>
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - bCommitP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500 z-10"
                      style={{ opacity: bCommitP }}
                    />
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 37 }}
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 57 }}
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "a-cannot-commit-after-abort",
        label: "A Cannot Commit",
        hideCaption: false,
        narration:
          "Participant A rolled back the transaction though, even if it wanted to, it can't commit",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-red-400">
                    A
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-green-500">
                    B
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "unilateral-abort-breaks-atomicity-summary",
        label: "Atomicity Violation",
        hideCaption: false,
        narration:
          "Hence, giving participants the ability to unilaterally abort violates atomicity as the transaction is now partially committed",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-red-400">
                    A
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-green-500">
                    B
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "two-pc-is-blocking",
        label: "Blocking Protocol",
        hideCaption: false,
        narration:
          "This is why Two-Phase Commit (2PC) is a blocking protocol, once in the PREPARED state, participants may no longer independently abort or rollback",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    A
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    B
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participants-stay-blocked-if-no-recovery",
        label: "Indefinite Blocking",
        hideCaption: false,
        narration:
          "And if the coordinator never comes back up, then the participants may remain blocked in PREPARED indefinitely",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    A
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    B
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-intro",
        label: "Participant Crash",
        hideCaption: true,
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-16">
                <p className="m-0 max-w-[86%] text-center text-[2.05rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>Let&apos;s explore what happens if the </span>
                  <span className="font-bold text-blue-700">participant</span>
                  <span>
                    {" "}
                    becomes unreachable (i.e. participant crash, network
                    partition, routing failure, etc)
                  </span>
                </p>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-in-active",
        label: "Participant Crash - In Active",
        hideCaption: false,
        narration:
          "If a participant becomes unreachable before it enters PREPARED (it hasn’t durably logged a PREPARE record and voted YES),",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-blue-700" />
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 37 }}
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 57 }}
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-coordinator-aborts-prepared",
        label: "Abort Remaining Prepared",
        hideCaption: false,
        narration:
          "The coordinator sends out an ABORT request due to timeout to participants that did enter PREPARED",
        durationMs: 12000,
        loop: true,
        visual: ({ progress }) => {
          const coordinatorTimeoutP = clampProgress(progress, 0.08, 0.62);
          const coordinatorRemainingDeg = (1 - coordinatorTimeoutP) * 360;
          const participantAbortP = clampProgress(progress, 0.82, 0.96);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="relative aspect-square w-72 shrink-0">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${coordinatorRemainingDeg}deg, transparent ${coordinatorRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-purple-700 z-10" />
                  </div>
                </div>

                <div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - participantAbortP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400"
                      style={{ opacity: participantAbortP }}
                    />
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 57 }}
                to={{ x: 42, y: 47 }}
                start={0.22}
                end={0.46}
                fade
                fadeOut={true}
                scaleIn
              >
                <div className="aspect-square w-12 rounded-full bg-green-700" />
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 37 }}
                start={0.64}
                end={0.86}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold text-white">
                  A
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 57 }}
                start={0.64}
                end={0.86}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold text-white">
                  A
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-after-prepared",
        label: "Crash After Prepared",
        hideCaption: false,
        narration: "If a participant crashes after it enters PREPARED",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          const preparedP = clampProgress(progress, 0.56, 0.72);
          const crashTopP = clampProgress(progress, 0.8, 0.95);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP * (1 - crashTopP) }}
                    />
                    <div
                      className="absolute inset-0 rounded-full bg-slate-500"
                      style={{ opacity: crashTopP }}
                    />
                  </div>
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP }}
                    />
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 37 }}
                start={0.12}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 57 }}
                start={0.12}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 37 }}
                to={{ x: 47, y: 47 }}
                start={0.54}
                end={0.84}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-11 shrink-0 place-items-center rounded-full bg-green-700 text-base font-bold text-white">
                  Y
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 67, y: 57 }}
                to={{ x: 47, y: 47 }}
                start={0.54}
                end={0.84}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-11 shrink-0 place-items-center rounded-full bg-green-700 text-base font-bold text-white">
                  Y
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-blocks-until-participant-recovers",
        label: "Blocking Until Recovery",
        hideCaption: false,
        narration:
          "The coordinator blocks transaction completion till the participant comes back up so it can deliver its decision (either COMMIT or ABORT)",
        durationMs: 6500,
        loop: true,
        visual: ({ progress }) => {
          const bottomCommitP = clampProgress(progress, 0.58, 0.88);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - bottomCommitP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: bottomCommitP }}
                    />
                  </div>
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 37 }}
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </AnimateBetween>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 57 }}
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "participant-recovers-coordinator-retries",
        label: "Retry Decision",
        hideCaption: false,
        narration:
          "When the participant comes back up, the coordinator will retry its decision",
        durationMs: 6500,
        loop: true,
        visual: ({ progress }) => {
          const topCommitP = clampProgress(progress, 0.58, 0.88);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - topCommitP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: topCommitP }}
                    />
                  </div>
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500" />
                </div>
              </div>

              <AnimateBetween
                progress={progress}
                from={{ x: 47, y: 47 }}
                to={{ x: 67, y: 37 }}
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </AnimateBetween>
            </div>
          );
        },
      }),
      frame({
        id: "participant-never-recovers-indefinite-block",
        label: "Indefinite Block",
        hideCaption: false,
        narration:
          "If the participant never comes back up, then the coordinator will block transaction completion indefinitely",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" />
                </div>

                <div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500" />
                </div>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "fin",
        label: "Fin",
        hideCaption: true,
        durationMs: 7000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-12">
                <div className="flex flex-col items-center gap-6">
                  <h1 className="m-0 text-center text-7xl font-bold tracking-tight text-slate-700">
                    Fin
                  </h1>
                  <p className="m-0 text-center text-2xl font-medium text-slate-500">
                    Protocol explanation and failure mode handling
                    visualizations are inspired by{" "}
                    <em>Designing Data-Intensive Applications</em> by Martin
                    Kleppmann
                  </p>
                </div>
              </div>
            </div>
          );
        },
      }),
    ],
  },
];
