import { ImageResponse } from "next/og";

export const alt =
  "JVS Painting Inc. — Commercial & Government Painting Contractors in New Jersey";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated share card: same navy ground, red accent and stripe sweep as the
// hero, so a link preview reads as the same brand.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(160deg, #0A2647 0%, #14396B 100%)",
          padding: "72px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "10px",
              background: "#FFFFFF",
              color: "#0A2647",
              fontSize: "22px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            JVS
          </div>
          <div style={{ color: "#FFFFFF", fontSize: "30px" }}>
            JVS Painting Inc.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "22px",
              letterSpacing: "4px",
              marginBottom: "26px",
            }}
          >
            COMMERCIAL &amp; GOVERNMENT PAINTING CONTRACTORS
          </div>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: "68px",
              lineHeight: 1.1,
              maxWidth: "900px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            40+ Years of Painting Trusted by&nbsp;
            <span style={{ color: "#B31942" }}>Government &amp; Commercial</span>
            &nbsp;Clients
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ height: "10px", width: "300px", background: "#B31942" }} />
          <div style={{ height: "10px", width: "220px", background: "#FFFFFF" }} />
          <div style={{ height: "10px", width: "150px", background: "#3D6FB8" }} />
        </div>
      </div>
    ),
    size
  );
}
