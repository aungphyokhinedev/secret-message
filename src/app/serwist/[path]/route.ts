import { createSerwistRoute } from "@serwist/turbopack";

import { getDeployBuildId } from "@/lib/deploy-build-id";

const revision = getDeployBuildId();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
