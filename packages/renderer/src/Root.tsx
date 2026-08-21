import React from "react";
import { Composition } from "remotion";
import { EditPlanComposition, type EditPlanCompositionProps } from "./compositions/EditPlanComposition";
import type { Template } from "@marketron/core";

const FPS = 30;

/**
 * Only used for the Remotion Studio preview / as a fallback shape — every
 * real render call (see render.ts) passes its own inputProps and overrides
 * this entirely. Deliberately a local literal rather than importing the
 * real template registry: this file is part of the browser-bundled entry
 * point, and @marketron/core's barrel re-exports Node-only modules
 * (ffmpeg-static, @prisma/client) that don't resolve inside Remotion's
 * headless-browser bundle. Only *type* imports from @marketron/core belong
 * here — those get erased at compile time.
 */
const DEFAULT_TEMPLATE: Template = {
  id: "before-after-hook",
  name: "Before/After Hook",
  description: "Studio preview placeholder — real renders always pass the actual template.",
  maxClips: 6,
  captionStyle: {
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    fontSizePct: 6,
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.55)",
    position: "bottom",
  },
  logoPosition: "bottom-right",
  logoSizePct: 12,
  defaultTransition: { type: "fade", durationSec: 0.4 },
  hookDurationSec: 2,
};

const defaultProps: EditPlanCompositionProps = {
  resolvedClips: [],
  captions: [],
  template: DEFAULT_TEMPLATE,
  logoUrl: undefined,
  fps: FPS,
  totalDurationSec: 8,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EditPlan"
      component={EditPlanComposition}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={Math.round(defaultProps.totalDurationSec * FPS)}
      defaultProps={defaultProps}
      calculateMetadata={async ({ props }) => ({
        durationInFrames: Math.max(1, Math.round(props.totalDurationSec * props.fps)),
      })}
    />
  );
};
