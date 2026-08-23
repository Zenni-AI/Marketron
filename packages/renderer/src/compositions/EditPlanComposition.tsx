import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide, type SlideDirection } from "@remotion/transitions/slide";
import type { Template, Transition } from "@marketron/core";
import { Caption } from "../components/Caption";
import { Logo } from "../components/Logo";

/**
 * A single clip already resolved to a renderable URL by the (deterministic)
 * render.ts caller — this component does no lookups of its own, it only
 * lays out what it's told to, per the template's style rules.
 */
export type ResolvedClip = {
  assetId: string;
  kind: "video" | "photo";
  url: string;
  order: number;
  /** On-screen duration is (outSec - inSec). See EditPlan's PlannedClip docs. */
  inSec: number;
  outSec: number;
  role?: string;
};

export type PlannedCaptionProp = {
  text: string;
  startSec: number;
  endSec: number;
};

// A `type` (not `interface`) so it structurally satisfies Remotion's
// `Record<string, unknown>` generic constraint on <Composition props>.
export type EditPlanCompositionProps = {
  resolvedClips: ResolvedClip[];
  captions: PlannedCaptionProp[];
  template: Template;
  logoUrl?: string;
  fps: number;
  totalDurationSec: number;
};

/**
 * Ken-Burns pan/zoom variants for static photos. Photos otherwise render as
 * a single dead frame for their whole hold duration, which reads as cheap
 * for social content. Each variant is a (zoom direction, off-center origin)
 * pair — cycling through them per clip (see `variantIndex` below) means a
 * run of consecutive photos doesn't repeat the same motion. This is a purely
 * mechanical rendering choice (no content judgment), so it stays here rather
 * than in the planner.
 */
const KEN_BURNS_VARIANTS: ReadonlyArray<{
  originXPct: number;
  originYPct: number;
  scaleFrom: number;
  scaleTo: number;
}> = [
  { originXPct: 50, originYPct: 50, scaleFrom: 1, scaleTo: 1.15 }, // zoom in, center
  { originXPct: 50, originYPct: 50, scaleFrom: 1.15, scaleTo: 1 }, // zoom out, center
  { originXPct: 22, originYPct: 22, scaleFrom: 1, scaleTo: 1.18 }, // zoom in, toward top-left
  { originXPct: 78, originYPct: 78, scaleFrom: 1, scaleTo: 1.18 }, // zoom in, toward bottom-right
  { originXPct: 78, originYPct: 22, scaleFrom: 1, scaleTo: 1.18 }, // zoom in, toward top-right
  { originXPct: 22, originYPct: 78, scaleFrom: 1, scaleTo: 1.18 }, // zoom in, toward bottom-left
  { originXPct: 22, originYPct: 22, scaleFrom: 1.18, scaleTo: 1 }, // zoom out, from top-left
  { originXPct: 78, originYPct: 78, scaleFrom: 1.18, scaleTo: 1 }, // zoom out, from bottom-right
];

const KenBurnsPhoto: React.FC<{ src: string; durationInFrames: number; variantIndex: number }> = ({
  src,
  durationInFrames,
  variantIndex,
}) => {
  const frame = useCurrentFrame();
  const variant = KEN_BURNS_VARIANTS[variantIndex % KEN_BURNS_VARIANTS.length];
  const scale = interpolate(frame, [0, Math.max(durationInFrames - 1, 1)], [variant.scaleFrom, variant.scaleTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: `${variant.originXPct}% ${variant.originYPct}%`,
        }}
      />
    </AbsoluteFill>
  );
};

const SLIDE_DIRECTIONS: readonly SlideDirection[] = ["from-right", "from-left", "from-bottom", "from-top"];

/**
 * Maps the template's data-driven `defaultTransition` to an actual
 * `@remotion/transitions` presentation. Returns `undefined` for "cut" (a
 * hard cut needs no transition component at all). Slide direction cycles by
 * index for the same "don't repeat the same motion" reason as the Ken-Burns
 * variants above.
 */
function resolveTransitionPresentation(
  transition: Transition,
  index: number,
): TransitionPresentation<Record<string, unknown>> | undefined {
  switch (transition.type) {
    case "cut":
      return undefined;
    case "fade":
      return fade();
    case "slide":
      return slide({ direction: SLIDE_DIRECTIONS[index % SLIDE_DIRECTIONS.length] });
    default:
      return undefined;
  }
}

export const EditPlanComposition: React.FC<EditPlanCompositionProps> = ({
  resolvedClips,
  captions,
  template,
  logoUrl,
  fps,
}) => {
  const sorted = [...resolvedClips].sort((a, b) => a.order - b.order);
  const transitionFrames = Math.max(1, Math.round(template.defaultTransition.durationSec * fps));

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {sorted.map((clip, i) => {
          const durationInFrames = Math.max(1, Math.round((clip.outSec - clip.inSec) * fps));
          const isLast = i === sorted.length - 1;
          const presentation = resolveTransitionPresentation(template.defaultTransition, i);
          return (
            <React.Fragment key={`${clip.assetId}-${clip.order}`}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                {clip.kind === "video" ? (
                  <OffthreadVideo
                    src={clip.url}
                    startFrom={Math.round(clip.inSec * fps)}
                    endAt={Math.round(clip.outSec * fps)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <KenBurnsPhoto src={clip.url} durationInFrames={durationInFrames} variantIndex={i} />
                )}
              </TransitionSeries.Sequence>
              {!isLast && presentation && (
                <TransitionSeries.Transition
                  presentation={presentation}
                  timing={linearTiming({ durationInFrames: transitionFrames })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {captions.map((caption, i) => (
        <Sequence
          key={i}
          from={Math.round(caption.startSec * fps)}
          durationInFrames={Math.max(1, Math.round((caption.endSec - caption.startSec) * fps))}
        >
          <Caption text={caption.text} style={template.captionStyle} />
        </Sequence>
      ))}

      {logoUrl && (
        <Logo src={logoUrl} position={template.logoPosition} sizePct={template.logoSizePct} />
      )}
    </AbsoluteFill>
  );
};
