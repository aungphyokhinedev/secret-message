import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

// Inlined to match src/lib/deploy-build-id.ts (injected into client bundle at build time).
const appBuildId =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  "development";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_APP_BUILD_ID: appBuildId,
  },
};

export default withSerwist(nextConfig);
