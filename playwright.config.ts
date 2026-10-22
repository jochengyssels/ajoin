import { defineConfig, devices } from "@playwright/test";

/**
 * E2E_BASE_URL runs the suite against a deployed site (e.g. the Vercel preview).
 * Without it, a local production build is started on port 3200.
 */
const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: external ?? "http://localhost:3200",
    trace: "retain-on-failure",
  },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: external
    ? undefined
    : { command: "npm run build && npx next start -p 3200", url: "http://localhost:3200/nl", timeout: 240_000, reuseExistingServer: true },
});
