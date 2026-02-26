import type { PropsWithChildren, ReactNode } from 'react';
import type { FrameRenderProps } from '../../types';

type FrameTemplateProps = PropsWithChildren<
  FrameRenderProps & {
    title?: ReactNode;
    caption?: ReactNode;
    hideCaption?: boolean;
    className?: string;
  }
>;

export function FrameTemplate({
  progress: _progress,
  reducedMotion: _reducedMotion,
  title,
  caption,
  hideCaption = false,
  className,
  children,
}: FrameTemplateProps) {
  return (
    <div
      className={[
        'relative h-[982px] w-[1512px] overflow-hidden bg-figmaBg',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title ? <div className="absolute inset-x-0 top-0 bottom-[132px]">{title}</div> : null}
      <div className="absolute inset-x-0 top-0 bottom-[132px] pointer-events-none">{children}</div>
      {!hideCaption && caption ? (
        <div className="absolute left-[7%] right-[7%] bottom-[72px] text-center text-[26px] leading-[1.24] text-figmaInk">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
