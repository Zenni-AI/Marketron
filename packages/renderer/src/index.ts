export * from "./render";
// Deliberately NOT re-exporting ./compositions/EditPlanComposition here:
// this is the package's public surface, consumed by the Next.js API routes
// (a Node/server context). That composition imports the "remotion" client
// runtime, meant to run only inside Remotion's own browser-bundled render
// (see index.entry.tsx) — pulling it into the server bundle breaks at
// runtime ("Remotion requires React.createContext, but it is undefined").
// Only its *types* are needed outside the renderer package, and render.ts
// already imports those with `import type`, which is erased at build time.
export type { EditPlanCompositionProps, ResolvedClip, PlannedCaptionProp } from "./compositions/EditPlanComposition";
