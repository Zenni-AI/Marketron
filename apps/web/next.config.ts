import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages spawn native binaries / use Node-specific APIs (headless
  // Chromium, ffmpeg, the Anthropic SDK's streaming) that don't survive
  // Next's default Server Components bundling.
  serverExternalPackages: [
    "@anthropic-ai/sdk",
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/cli",
    "ffmpeg-static",
    "ffprobe-static",
  ],
};

export default nextConfig;
