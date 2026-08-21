import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type { Template } from "@marketron/core";
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

export const EditPlanComposition: React.FC<EditPlanCompositionProps> = ({
  resolvedClips,
  captions,
  template,
  logoUrl,
  fps,
}) => {
  const sorted = [...resolvedClips].sort((a, b) => a.order - b.order);
  const transitionFrames = Math.max(1, Math.round(template.defaultTransition.durationSec * fps));
  const useFadeTransition = template.defaultTransition.type === "fade";

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {sorted.map((clip, i) => {
          const durationInFrames = Math.max(1, Math.round((clip.outSec - clip.inSec) * fps));
          const isLast = i === sorted.length - 1;
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
                  <Img
                    src={clip.url}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </TransitionSeries.Sequence>
              {!isLast && useFadeTransition && (
                <TransitionSeries.Transition
                  presentation={fade()}
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
