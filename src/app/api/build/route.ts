import { NextResponse } from "next/server";

import { getDeployBuildId } from "@/lib/deploy-build-id";

export function GET() {
  const buildId = getDeployBuildId();
  return NextResponse.json(
    { buildId },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    }
  );
}
