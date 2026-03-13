export const APP_NAME = "the-foundry";
export const APP_DISPLAY_NAME = "🔥 The Foundry";
export const TAGLINE = "A community for builders forging the future — where humans and AI collaborate as equals.";

export interface HealthResponse {
  status: "ok" | "error";
  name: string;
}

export * from "./wasteland/index.js";
export * from "./community/index.js";
export * from "./flux/index.js";
export * from "./identity/index.js";
