import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";

export const LABELS = {
  start: "start",
  green: "green",
  blue: "blue",
  orange: "orange",
} as const;

export type Label = keyof typeof LABELS;

const ORDER = Object.keys(LABELS) as Label[];

const getStepFromUrl = (): Label => {
  const params = new URLSearchParams(window.location.search);
  const step = params.get("step");
  return step && step in LABELS ? (step as Label) : "start";
};

export default function GsapQueryStepper() {
  const container = useRef<HTMLDivElement | null>(null);
  const green = useRef<HTMLDivElement | null>(null);
  const blue = useRef<HTMLDivElement | null>(null);
  const orange = useRef<HTMLDivElement | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const [currentLabel, setCurrentLabel] = useState<Label>(() =>
    getStepFromUrl()
  );

  useGSAP(
    () => {
      gsap.set([green.current, blue.current, orange.current], {
        opacity: 0,
        x: 0,
      });

      tl.current = gsap.timeline({ paused: true });

      tl.current
        .addLabel(LABELS.start)
        .to(green.current, { x: 650, opacity: 1, duration: 1 })
        .addLabel(LABELS.green)
        .to(blue.current, { x: 650, opacity: 1, duration: 1 })
        .addLabel(LABELS.blue)
        .to(orange.current, { x: 650, opacity: 1, duration: 1 })
        .addLabel(LABELS.orange);

      tl.current.seek(currentLabel);
    },
    { scope: container }
  );

  // react to URL changes (back / forward)
  useEffect(() => {
    const onPopState = () => {
      const label = getStepFromUrl();
      setCurrentLabel(label);
      tl.current?.tweenTo(label);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goTo = (label: Label) => {
    setCurrentLabel(label);
    tl.current?.tweenTo(label);

    const params = new URLSearchParams(window.location.search);
    params.set("step", label);

    window.history.pushState({}, "", `?${params.toString()}`);
  };

  const next = () => {
    const i = ORDER.indexOf(currentLabel);
    if (i < ORDER.length - 1) goTo(ORDER[i + 1]);
  };

  const prev = () => {
    const i = ORDER.indexOf(currentLabel);
    if (i > 0) goTo(ORDER[i - 1]);
  };

  return (
    <div className="space-y-6">
      <div
        ref={container}
        className="relative h-40 w-[700px] border border-dashed"
      >
        <div
          ref={green}
          className="absolute left-0 top-4 h-10 w-10 bg-green-500"
        />
        <div
          ref={blue}
          className="absolute left-0 top-16 h-10 w-10 bg-blue-500"
        />
        <div
          ref={orange}
          className="absolute left-0 top-28 h-10 w-10 bg-orange-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          disabled={currentLabel === ORDER[0]}
          className="rounded border px-4 py-1 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-neutral-600">?step={currentLabel}</span>

        <button
          onClick={next}
          disabled={currentLabel === ORDER[ORDER.length - 1]}
          className="rounded border px-4 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
