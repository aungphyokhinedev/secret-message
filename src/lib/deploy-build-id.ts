/**
 * Single source for the active deployment id (Vercel: deployment or git SHA).
 * Must match between next.config env injection and API route.
 */
export function getDeployBuildId(): string {
  return (
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    "development"
  );
}
