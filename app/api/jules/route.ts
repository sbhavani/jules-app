import { NextResponse, NextRequest } from "next/server";

const JULES_API_BASE = "https://jules.googleapis.com/v1alpha";

interface Artifact {
  changeSet?: {
    gitPatch?: {
      unidiffPatch?: string;
    };
    unidiffPatch?: string;
    [key: string]: unknown;
  };
  bashOutput?: {
    output?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Activity {
  name?: string;
  createTime?: string;
  originator?: string;
  id?: string;
  progressUpdated?: {
    artifacts?: Artifact[];
  };
  sessionCompleted?: {
    artifacts?: Artifact[];
  };
  artifacts?: Artifact[];
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-jules-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get("path") || "";
    const url = `${JULES_API_BASE}${path}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
    });

    const data = await response.json().catch(() => ({}));

    // Temporarily log activities for debugging
    if (
      path.includes("/activities") &&
      data.activities &&
      data.activities.length > 0
    ) {
      // Log activity types
      const activityTypes = data.activities.map((a: Activity) => {
        const type = Object.keys(a).find(
          (k) =>
            k !== "name" &&
            k !== "createTime" &&
            k !== "originator" &&
            k !== "id",
        );
        return type;
      });
      console.log("[Jules API Proxy] Activity types:", activityTypes);

      // Look for activities with artifacts
      const activitiesWithArtifacts = data.activities.filter((a: Activity) => {
        return (
          (a.progressUpdated?.artifacts &&
            a.progressUpdated.artifacts.length > 0) ||
          (a.sessionCompleted?.artifacts &&
            a.sessionCompleted.artifacts.length > 0) ||
          (a.artifacts && a.artifacts.length > 0)
        ); // Include top-level artifacts check
      });

      if (activitiesWithArtifacts.length > 0) {
        console.log(
          "[Jules API Proxy] Found",
          activitiesWithArtifacts.length,
          "activities with artifacts",
        );
        activitiesWithArtifacts.forEach((a: Activity, idx: number) => {
          const artifacts = (a.progressUpdated?.artifacts ||
            a.sessionCompleted?.artifacts ||
            a.artifacts ||
            []) as Artifact[];
          console.log(
            `[Jules API Proxy] Activity ${idx} has ${artifacts.length} artifacts`,
          );
          artifacts.forEach((artifact: Artifact, artifactIdx: number) => {
            console.log(
              `[Jules API Proxy]   Artifact ${artifactIdx}:`,
              Object.keys(artifact),
            );
            if (artifact.changeSet) {
              console.log(
                `[Jules API Proxy]     Has changeSet with keys:`,
                Object.keys(artifact.changeSet),
              );
              // Check both possible formats
              const hasGitPatch = !!artifact.changeSet.gitPatch?.unidiffPatch;
              const hasDirectPatch = !!artifact.changeSet.unidiffPatch;
              console.log(
                `[Jules API Proxy]     Has gitPatch.unidiffPatch:`,
                hasGitPatch,
              );
              console.log(
                `[Jules API Proxy]     Has direct unidiffPatch:`,
                hasDirectPatch,
              );

              const patch =
                artifact.changeSet.gitPatch?.unidiffPatch ||
                artifact.changeSet.unidiffPatch;
              if (patch) {
                console.log(
                  `[Jules API Proxy]     Patch length: ${patch.length} chars`,
                );
              }
            }
            if (artifact.bashOutput) {
              console.log(
                `[Jules API Proxy]     Has bashOutput:`,
                !!artifact.bashOutput.output,
              );
            }
          });
        });
      } else {
        console.log("[Jules API Proxy] No activities with artifacts found");
      }

      // Look for sessionCompleted activities
      const completedActivity = data.activities.find(
        (a: Activity) => a.sessionCompleted,
      );
      if (completedActivity) {
        console.log(
          "[Jules API Proxy] Found sessionCompleted activity:",
          JSON.stringify(completedActivity, null, 2),
        );
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[Jules API Proxy] Error:", error);
    return NextResponse.json(
      {
        error: "Proxy error",
        message: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-jules-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get("path") || "";
    const url = `${JULES_API_BASE}${path}`;
    const body = await request.text();

    console.log("[Jules API Proxy] POST request:", {
      url,
      path,
      body: JSON.parse(body || "{}"),
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: body || undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Jules API Proxy] POST error:", {
        status: response.status,
        data,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Proxy error",
        message: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-jules-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get("path") || "";
    const url = `${JULES_API_BASE}${path}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Proxy error",
        message: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
