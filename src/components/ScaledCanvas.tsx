import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Size = { width: number; height: number };

export function ScaledCanvas({
  width,
  height,
  children,
  className,
}: {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [hostSize, setHostSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setHostSize({ width: rect.width, height: rect.height });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale =
    hostSize.width > 0 && hostSize.height > 0
      ? Math.min(hostSize.width / width, hostSize.height / height, 1)
      : 1;

  return (
    <div
      ref={hostRef}
      className={["relative h-full w-full overflow-hidden", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
