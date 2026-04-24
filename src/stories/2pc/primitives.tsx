import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import type { FrameRenderProps } from "../../types";
import {
  MotionAnchor,
  MotionFlight,
  MotionScene,
  type Attach,
} from "../../lib/scene-motion";

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

export function frame(spec: FrameSpec) {
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

export function tint(text: string) {
  const stash: string[] = [];
  const makeToken = (i: number) => `\uE000${i}\uE001`;

  let out = text;

  for (const [re, html] of phraseRules) {
    out = out.replace(re, () => {
      const token = makeToken(stash.length);
      stash.push(html);
      return token;
    });
  }

  for (const [re, html] of rules) {
    out = out.replace(re, html);
  }

  for (let i = 0; i < stash.length; i++) {
    const tokenRe = new RegExp(makeToken(i), "g");
    out = out.replace(tokenRe, stash[i]);
  }

  return out;
}

export function clampProgress(progress: number, start: number, end: number) {
  if (progress < start) return 0;
  if (progress > end) return 1;
  return (progress - start) / (end - start);
}

export function FrameTemplate({
  reducedMotion,
  title,
  caption,
  hideCaption = false,
  className,
  children,
}: FrameRenderProps & {
  title?: ReactNode;
  caption?: ReactNode;
  hideCaption?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={[
        "relative h-[982px] w-[1512px] overflow-hidden bg-figmaBg",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? (
        <div className="absolute inset-x-0 top-0 bottom-[132px]">{title}</div>
      ) : null}
      <div className="absolute inset-x-0 top-0 bottom-[132px] pointer-events-none">
        <MotionScene reducedMotion={reducedMotion}>{children}</MotionScene>
      </div>
      {!hideCaption && caption ? (
        <div className="absolute left-[7%] right-[7%] bottom-[72px] text-center text-[26px] leading-[1.24] text-figmaInk">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

export const Abs = forwardRef(function Abs(
  {
    children,
    style,
    className,
  }: {
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
  },
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={["absolute", className ?? ""].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
});

export function TitleVisual({ text }: { text: string }) {
  return (
    <Abs className="inset-0 grid place-items-center px-12">
      <h1 className="m-0 max-w-4xl text-center text-5xl font-bold leading-tight tracking-tight text-slate-600">
        {text}
      </h1>
    </Abs>
  );
}

export const TxBox = forwardRef(function TxBox(
  {
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
  },
  ref: Ref<HTMLDivElement>,
) {
  return (
    <Abs
      ref={ref}
      style={{
        left: x,
        top: y,
        borderColor,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
      className="border-2 bg-transparent px-[14px] py-[10px] text-[clamp(1rem,1.4vw,1.4rem)] font-mono leading-[1.2] text-[#3b3b3b]"
    >
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </Abs>
  );
});

export const Node = forwardRef(function Node(
  {
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
  },
  ref: Ref<HTMLDivElement>,
) {
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
      ref={ref}
      style={{ left: x, top: y }}
      className={`${sizeClass} grid aspect-square place-items-center rounded-full font-bold text-white shadow-[0_8px_30px_rgba(33,42,58,0.08)] ${variantClass}`}
    >
      {label}
    </Abs>
  );
});

export const Msg = forwardRef(function Msg(
  {
    x,
    y,
    text,
    tone,
  }: {
    x: string;
    y: string;
    text: string;
    tone: "teal" | "green" | "red" | "dark";
  },
  ref: Ref<HTMLDivElement>,
) {
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
      ref={ref}
      style={{ left: x, top: y }}
      className={`text-[clamp(0.75rem,1vw,0.95rem)] font-extrabold tracking-[0.05em] ${toneClass}`}
    >
      {text}
    </Abs>
  );
});

export const Line = forwardRef(function Line(
  {
    left,
    top,
    width,
    rotate,
  }: {
    left: string;
    top: string;
    width: string;
    rotate: number;
  },
  ref: Ref<HTMLDivElement>,
) {
  return (
    <Abs
      ref={ref}
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
});

export function PreparedDashed({
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
        className="aspect-square w-[7%] rounded-full outline outline-[4px] outline-dashed outline-[#1e1e1e] outline-offset-[4px]"
      />
    </>
  );
}

export function HiddenAnchor({
  id,
  x,
  y,
}: {
  id: string;
  x: string;
  y: string;
}) {
  return (
    <MotionAnchor id={id}>
      <Abs
        style={{
          left: x,
          top: y,
          width: 0,
          height: 0,
        }}
      />
    </MotionAnchor>
  );
}

export function Flight({
  progress,
  from,
  to,
  start = 0,
  end = 1,
  fade = false,
  fadeOut = true,
  scaleIn = false,
  className = "",
  layer = 0,
  fromAttach,
  toAttach,
  payloadAttach = "center",
  children,
}: {
  progress: number;
  from: string;
  to: string;
  start?: number;
  end?: number;
  fade?: boolean;
  fadeOut?: boolean;
  scaleIn?: boolean;
  className?: string;
  layer?: number;
  fromAttach?: Attach;
  toAttach?: Attach;
  payloadAttach?: Attach;
  children: ReactNode;
}) {
  return (
    <MotionFlight
      progress={progress}
      from={from}
      to={to}
      start={start}
      end={end}
      layer={layer}
      fadeIn={fade}
      fadeOut={fade && fadeOut}
      fromAttach={fromAttach}
      toAttach={toAttach}
      payloadAttach={payloadAttach}
      className={className}
    >
      {({ opacity }) => (
        <div
          style={{
            opacity,
            transform: `scale(${scaleIn ? 0.8 + 0.2 * opacity : 1})`,
          }}
        >
          {children}
        </div>
      )}
    </MotionFlight>
  );
}

export function FlightDot({
  progress,
  from,
  to,
  color = "#0f8b83",
  start = 0.05,
  end = 0.55,
  size = "sm",
  label,
  className = "",
  fade = true,
  fadeOut = true,
  scaleIn = true,
  layer = 0,
  fromAttach,
  toAttach,
  payloadAttach = "center",
}: {
  progress: number;
  from: string;
  to: string;
  color?: string;
  start?: number;
  end?: number;
  size?: "xs" | "sm" | "md" | "lg" | number;
  label?: string;
  className?: string;
  fade?: boolean;
  fadeOut?: boolean;
  scaleIn?: boolean;
  layer?: number;
  fromAttach?: Attach;
  toAttach?: Attach;
  payloadAttach?: Attach;
}) {
  const sizeClass =
    typeof size === "number"
      ? ""
      : {
          xs: "h-6 w-6 text-xs",
          sm: "h-8 w-8 text-xs",
          md: "h-12 w-12 text-lg",
          lg: "h-16 w-16 text-lg",
        }[size];

  const inlineSize =
    typeof size === "number"
      ? { width: size, height: size, fontSize: size * 0.6 }
      : {};

  return (
    <Flight
      progress={progress}
      from={from}
      to={to}
      start={start}
      end={end}
      fade={fade}
      fadeOut={fadeOut}
      scaleIn={scaleIn}
      layer={layer}
      fromAttach={fromAttach}
      toAttach={toAttach}
      payloadAttach={payloadAttach}
    >
      <div
        style={{
          background: color,
          ...inlineSize,
        }}
        className={`flex items-center justify-center rounded-full font-semibold text-white ${sizeClass} ${className}`}
      >
        {label}
      </div>
    </Flight>
  );
}

export { MotionAnchor, MotionFlight, MotionScene };
