import React from "react";
import { Img } from "remotion";
import type { LogoPosition } from "@marketron/core";

const POSITION_STYLE: Record<LogoPosition, React.CSSProperties> = {
  "top-left": { top: "4%", left: "4%" },
  "top-right": { top: "4%", right: "4%" },
  "bottom-left": { bottom: "4%", left: "4%" },
  "bottom-right": { bottom: "4%", right: "4%" },
};

export const Logo: React.FC<{ src: string; position: LogoPosition; sizePct: number }> = ({
  src,
  position,
  sizePct,
}) => (
  <Img
    src={src}
    style={{
      position: "absolute",
      width: `${sizePct}%`,
      ...POSITION_STYLE[position],
    }}
  />
);
