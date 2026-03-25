import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TIMEOUT_MS = 30_000;

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const start = Date.now();
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const scanHistory = Array.isArray(body.scanHistory) ? body.scanHistory.slice(0, 30) : [];
    const points = Math.max(Number(body.points) || 0, 0);
    const streak = Math.max(Number(body.streak) || 0, 0);
    const totalScans = Math.max(Number(body.totalScans) || scanHistory.length, 0);

    if (scanHistory.length === 0) {
      return errorResponse("No scan history to analyze. Start scanning items first!", 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[ai-impact-report] LOVABLE_API_KEY not configured");
      return errorResponse("AI service not configured", 500);
    }

    // Build rich analytics from scan history
    const allItems = scanHistory.flatMap((r: any) =>
      (r.items || []).map((i: any) => ({
        name: i.displayName || i.label || "Unknown",
        label: i.label || "unknown",
        recyclable: i.recyclable !== false,
        category: i.category || "other",
        co2: i.co2SavedGrams || 0,
      }))
    );

    const categoryCounts: Record<string, number> = {};
    const materialCounts: Record<string, number> = {};
    let totalCo2 = 0;
    let recyclableCount = 0;

    allItems.forEach((item: any) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      materialCounts[item.label] = (materialCounts[item.label] || 0) + 1;
      totalCo2 += item.co2;
      if (item.recyclable) recyclableCount++;
    });

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(", ");

    const topMaterials = Object.entries(materialCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([mat, count]) => `${mat.replace(/_/g, " ")}: ${count}`)
      .join(", ");

    const recyclingRate = allItems.length > 0
      ? ((recyclableCount / allItems.length) * 100).toFixed(1)
      : "0";

    const userProfile = `User Analytics:
- Total scans: ${totalScans}
- Total items identified: ${allItems.length}
- Points earned: ${points}
- Current streak: ${streak} days
- Recycling rate: ${recyclingRate}%
- Total CO₂ saved: ${totalCo2}g
- Top categories: ${topCategories || "N/A"}
- Most scanned materials: ${topMaterials || "N/A"}
- Recyclable items: ${recyclableCount}/${allItems.length}`;

    const response = await fetchWithTimeout(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are **RecycleMate Impact Analyst** — you generate personalized, data-driven sustainability impact reports.

Generate an engaging, insightful report that makes the user feel proud of their impact while providing actionable next steps. Use the user's actual data to compute real equivalencies and insights.

Report structure:
1. **headline**: A personalized, motivating headline (e.g., "You're an Eco Champion! 🌍")
2. **summary**: 2-3 sentence personalized summary of their impact
3. **grade**: A letter grade A+ to F based on recycling rate and engagement
4. **co2Equivalency**: Convert their CO₂ savings to a relatable real-world comparison (e.g., "equivalent to planting 2 trees" or "same as driving 5 fewer miles")
5. **strengths**: Array of 2-3 things they're doing well (based on actual data)
6. **improvements**: Array of 2-3 specific, actionable improvements they can make
7. **challengeOfTheWeek**: A specific, fun challenge related to their weakest area
8. **funStats**: Array of 2-3 surprising statistics derived from their data (e.g., "You've identified more plastic bottles than 80% of users!")
9. **nextMilestone**: What they should aim for next (e.g., "Scan 10 more items to reach Planet Protector status!")

Be data-driven: reference actual numbers from their profile. Be encouraging but honest.`,
          },
          {
            role: "user",
            content: `${userProfile}\n\nGenerate my personalized sustainability impact report.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_impact_report",
              description: "Generate a personalized sustainability impact report",
              parameters: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  summary: { type: "string" },
                  grade: { type: "string" },
                  co2Equivalency: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  challengeOfTheWeek: { type: "string" },
                  funStats: { type: "array", items: { type: "string" } },
                  nextMilestone: { type: "string" },
                },
                required: ["headline", "summary", "grade", "co2Equivalency", "strengths", "improvements", "challengeOfTheWeek", "funStats", "nextMilestone"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_impact_report" } },
      }),
    }, TIMEOUT_MS);

    if (!response.ok) {
      const errBody = await response.text();
      if (response.status === 429) return errorResponse("Rate limited. Please try again shortly.", 429);
      if (response.status === 402) return errorResponse("AI credits exhausted.", 402);
      console.error(`[ai-impact-report] Gateway ${response.status}:`, errBody.slice(0, 500));
      return errorResponse("AI service temporarily unavailable", 502);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        // Inject computed stats
        parsed.stats = {
          totalScans,
          totalItems: allItems.length,
          recyclableCount,
          recyclingRate: Number(recyclingRate),
          totalCo2,
          points,
          streak,
        };
        console.log(`[ai-impact-report] Report generated in ${Date.now() - start}ms`);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseErr) {
        console.error("[ai-impact-report] Parse error:", parseErr);
        return errorResponse("AI returned invalid report format", 502);
      }
    }

    console.error("[ai-impact-report] No tool call in response");
    return errorResponse("AI did not return a report", 502);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return errorResponse("Report generation timed out. Please try again.", 504);
    }
    console.error(`[ai-impact-report] Error after ${Date.now() - start}ms:`, e);
    return errorResponse(e instanceof Error ? e.message : "Internal error", 500);
  }
});
