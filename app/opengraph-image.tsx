import { ImageResponse } from "next/og";

export const alt = "Church Member Marketplace: hire trusted members of local churches";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated brand card for link previews. Static text only, no member or church data. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#F5EEE1",
          color: "#2A2018",
          borderLeft: "24px solid #2E5740",
        }}
      >
        <div style={{ fontSize: 34, color: "#B0502D", marginBottom: 24 }}>Church Member Marketplace</div>
        <div style={{ fontSize: 76, lineHeight: 1.1, display: "flex" }}>Hire trusted members of local churches</div>
        <div style={{ fontSize: 34, color: "#6F6456", marginTop: 32, display: "flex" }}>
          Every member is confirmed by their church. Free to join.
        </div>
        <div style={{ fontSize: 28, color: "#2E5740", marginTop: 48 }}>cmmarketplace.org</div>
      </div>
    ),
    { ...size },
  );
}
