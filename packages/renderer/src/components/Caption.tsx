import React from "react";
import { AbsoluteFill } from "remotion";
import type { CaptionStyle } from "@marketron/core";

/**
 * Burned-in caption. All styling comes from the template's CaptionStyle —
 * this component never hardcodes a look, so new templates never require
 * touching render code.
 */
export const Caption: React.FC<{ text: string; style: CaptionStyle }> = ({ text, style }) => {
  const justifyContent =
    style.position === "top" ? "flex-start" : style.position === "center" ? "center" : "flex-end";

  return (
    <AbsoluteFill style={{ justifyContent, alignItems: "center", padding: "6%" }}>
      <div
        style={{
          fontFamily: style.fontFamily,
          fontSize: `${style.fontSizePct}vh`,
          color: style.color,
          backgroundColor: style.backgroundColor,
          padding: "0.4em 0.8em",
          borderRadius: 8,
          textAlign: "center",
          maxWidth: "90%",
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
