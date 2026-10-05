import { defineConfig, devices } from "@playwright/test";

// Runs the exported web build against a mocked BFF (see e2e/journey.spec.ts).
// Build first: EXPO_PUBLIC_BFF_URL=http://bff.test npm run build:web
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:4173", ...devices["Pixel 7"] },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 7"] } }],
  webServer: { command: "npx serve dist -l 4173 -s", url: "http://localhost:4173", reuseExistingServer: true },
});
