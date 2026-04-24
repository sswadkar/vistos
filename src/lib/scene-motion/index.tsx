import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { lerp, segment } from "../motion";

type Attach =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "tl"
  | "tr"
  | "bl"
  | "br";

type AnchorBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type MotionSceneContextValue = {
  overlay: HTMLDivElement | null;
  reducedMotion: boolean;
  registerAnchor: (id: string, node: HTMLElement | null) => void;
  getAnchorPoint: (id: string, attach: Attach) => { x: number; y: number } | null;
};

const MotionSceneContext = createContext<MotionSceneContextValue | null>(null);

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as MutableRefObject<T>).current = value;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T) => {
    for (const ref of refs) {
      assignRef(ref, value);
    }
  };
}

function pointForAttach(box: AnchorBox, attach: Attach) {
  if (attach === "top-left" || attach === "tl") {
    return { x: box.left, y: box.top };
  }
  if (attach === "top-right" || attach === "tr") {
    return { x: box.left + box.width, y: box.top };
  }
  if (attach === "top") {
    return { x: box.left + box.width / 2, y: box.top };
  }
  if (attach === "right") {
    return { x: box.left + box.width, y: box.top + box.height / 2 };
  }
  if (attach === "bottom-left" || attach === "bl") {
    return { x: box.left, y: box.top + box.height };
  }
  if (attach === "bottom-right" || attach === "br") {
    return { x: box.left + box.width, y: box.top + box.height };
  }
  if (attach === "bottom") {
    return { x: box.left + box.width / 2, y: box.top + box.height };
  }
  if (attach === "left") {
    return { x: box.left, y: box.top + box.height / 2 };
  }
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function translateForAttach(attach: Attach) {
  if (attach === "top-left" || attach === "tl") {
    return "translate(0, 0)";
  }
  if (attach === "top-right" || attach === "tr") {
    return "translate(-100%, 0)";
  }
  if (attach === "top") {
    return "translate(-50%, 0)";
  }
  if (attach === "right") {
    return "translate(-100%, -50%)";
  }
  if (attach === "bottom-left" || attach === "bl") {
    return "translate(0, -100%)";
  }
  if (attach === "bottom-right" || attach === "br") {
    return "translate(-100%, -100%)";
  }
  if (attach === "bottom") {
    return "translate(-50%, -100%)";
  }
  if (attach === "left") {
    return "translate(0, -50%)";
  }
  return "translate(-50%, -50%)";
}

export function MotionScene({
  children,
  reducedMotion = false,
  className,
}: {
  children: ReactNode;
  reducedMotion?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const anchorsRef = useRef(new Map<string, HTMLElement>());
  const frameRef = useRef<number | null>(null);
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [anchorBoxes, setAnchorBoxes] = useState<Record<string, AnchorBox>>({});
  const [anchorVersion, setAnchorVersion] = useState(0);

  const measureAnchors = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const scaleX = root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1;
    const scaleY = root.offsetHeight > 0 ? rootRect.height / root.offsetHeight : 1;
    const next: Record<string, AnchorBox> = {};

    for (const [id, node] of anchorsRef.current) {
      const rect = node.getBoundingClientRect();
      next[id] = {
        left: (rect.left - rootRect.left) / scaleX,
        top: (rect.top - rootRect.top) / scaleY,
        width: rect.width / scaleX,
        height: rect.height / scaleY,
      };
    }

    setAnchorBoxes(next);
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      measureAnchors();
    });
  }, [measureAnchors]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    measureAnchors();
  }, [measureAnchors, anchorVersion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      scheduleMeasure();
    });

    observer.observe(root);
    for (const node of anchorsRef.current.values()) {
      observer.observe(node);
    }

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [anchorVersion, scheduleMeasure]);

  const registerAnchor = useCallback((id: string, node: HTMLElement | null) => {
    const anchors = anchorsRef.current;
    const current = anchors.get(id);

    if (!node) {
      if (current) {
        anchors.delete(id);
        setAnchorVersion((value) => value + 1);
      }
      return;
    }

    if (current !== node) {
      anchors.set(id, node);
      setAnchorVersion((value) => value + 1);
    }
  }, []);

  const getAnchorPoint = useCallback(
    (id: string, attach: Attach) => {
      const box = anchorBoxes[id];
      if (!box) return null;
      return pointForAttach(box, attach);
    },
    [anchorBoxes],
  );

  const value = useMemo<MotionSceneContextValue>(
    () => ({
      overlay,
      reducedMotion,
      registerAnchor,
      getAnchorPoint,
    }),
    [overlay, reducedMotion, registerAnchor, getAnchorPoint],
  );

  return (
    <MotionSceneContext.Provider value={value}>
      <div
        ref={rootRef}
        className={["relative h-full w-full", className ?? ""]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
        <div
          ref={setOverlay}
          className="pointer-events-none absolute inset-0 overflow-visible"
        />
      </div>
    </MotionSceneContext.Provider>
  );
}

export function MotionAnchor({
  id,
  children,
}: {
  id: string;
  children: ReactElement;
}) {
  const context = useContext(MotionSceneContext);
  const registeredNodeRef = useRef<HTMLElement | null>(null);

  if (!context) {
    return children;
  }

  const { registerAnchor } = context;

  const child = Children.only(children) as ReactElement<any>;

  if (!isValidElement(child)) {
    return null;
  }

  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      if (registeredNodeRef.current && registeredNodeRef.current !== node) {
        registerAnchor(id, null);
      }

      registeredNodeRef.current = node;
      registerAnchor(id, node);
    },
    [id, registerAnchor],
  );

  return cloneElement(
    child,
    {
      ref: handleRef,
    } as any,
  );
}

type MotionFlightChildProps = {
  t: number;
  opacity: number;
};

export function MotionFlight({
  progress,
  from,
  to,
  start,
  end,
  layer = 0,
  fadeIn = false,
  fadeOut = false,
  fromAttach = "center",
  toAttach = "center",
  payloadAttach = "center",
  className,
  children,
}: {
  progress: number;
  from: string;
  to: string;
  start: number;
  end: number;
  layer?: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
  fromAttach?: Attach;
  toAttach?: Attach;
  payloadAttach?: Attach;
  className?: string;
  children: ReactNode | ((props: MotionFlightChildProps) => ReactNode);
}) {
  const context = useContext(MotionSceneContext);

  if (!context || !context.overlay) {
    return null;
  }

  const fromPoint = context.getAnchorPoint(from, fromAttach);
  const toPoint = context.getAnchorPoint(to, toAttach);

  if (!fromPoint || !toPoint) {
    return null;
  }

  const rawT = segment(progress, start, end);
  const t = context.reducedMotion ? (rawT < 0.5 ? 0 : 1) : rawT;

  const fadeWindowStart = 0.14;
  const fadeWindowEnd = 0.86;
  const fadeInOpacity = fadeIn ? segment(rawT, 0, fadeWindowStart) : 1;
  const fadeOutOpacity = fadeOut ? 1 - segment(rawT, fadeWindowEnd, 1) : 1;
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);

  const x = lerp(fromPoint.x, toPoint.x, t);
  const y = lerp(fromPoint.y, toPoint.y, t);

  const content =
    typeof children === "function" ? children({ t, opacity }) : children;

  return createPortal(
    <div
      className={["absolute", className ?? ""].filter(Boolean).join(" ")}
      style={{
        left: x,
        top: y,
        zIndex: layer,
        opacity,
        transform: translateForAttach(payloadAttach),
      }}
    >
      {content}
    </div>,
    context.overlay,
  );
}

export type { Attach, MotionFlightChildProps };
