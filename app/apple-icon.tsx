import { ImageResponse } from "next/og";

// Apple touch icons must be raster — SVG is only supported for `icon`.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A2647",
          color: "#FFFFFF",
          fontSize: 62,
          fontWeight: 700,
          letterSpacing: 2,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 22,
            background: "#B31942",
          }}
        />
        JVS
      </div>
    ),
    size
  );
}
