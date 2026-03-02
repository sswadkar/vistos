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
    '<span class="text-figmaDark font-extrabold">PREPARED</span>',
  ],
  [/\bPREPARE\b/g, '<span class="text-figmaTeal font-bold">PREPARE</span>'],

  [/\bCOMMIT\b/g, '<span class="text-figmaDark font-extrabold">COMMIT</span>'],
  [/\bABORT\b/g, '<span class="text-figmaDark font-extrabold">ABORT</span>'],
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
  scaleIn?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const p = segment(progress, start, end);
  const pt = pointBetween(from, to, p);

  const fadeOffset = 0.06;

  const fadeIn = segment(progress, start + 0.02, start + fadeOffset);
  const fadeOut = 1 - segment(progress, end - fadeOffset, end - 0.02);

  const opacity = fade ? Math.min(fadeIn, fadeOut) : 1;
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
          "In a database, these local checks include acquiring locks, validating constraints (i.e. there’s enough storage), and writing and flushing a PREPARED record to its write-ahead log (WAL)",
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
        durationMs: 6500,
        loop: true,
        visual: ({ progress }) => {
          const preparedP = clampProgress(progress, 0.02, 0.32);
          const finalizeP = clampProgress(progress, 0.82, 0.98);
          const preparedOpacity = preparedP * (1 - finalizeP);

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
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: finalizeP }}
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
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: finalizeP }}
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
                to={{ x: 47, y: 46 }}
                start={0.04}
                end={0.28}
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
                to={{ x: 47, y: 52 }}
                start={0.08}
                end={0.32}
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
                start={0.38}
                end={0.72}
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
                start={0.42}
                end={0.76}
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
    ],
  },
];
