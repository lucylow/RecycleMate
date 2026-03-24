import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TIMEOUT_MS = 45_000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

    const { image } = body;
    if (!image || typeof image !== "string") {
      return errorResponse("'image' field is required and must be a base64 string", 400);
    }

    const base64Data = image.replace(/^data:image\/[a-z+]+;base64,/, "");
    if (base64Data.length > MAX_IMAGE_SIZE) {
      return errorResponse("Image too large. Maximum 5MB.", 413);
    }
    if (!/^[A-Za-z0-9+/=\s]+$/.test(base64Data.slice(0, 100))) {
      return errorResponse("Invalid base64 image data", 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[ai-vision] LOVABLE_API_KEY not configured");
      return errorResponse("AI service not configured", 500);
    }

    console.log(`[ai-vision] Processing image (${(base64Data.length / 1024).toFixed(0)}KB)`);

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
            content: `You are **RecycleMate Vision AI v3** — an advanced waste detection and classification system.

For EVERY item you detect, provide rich metadata:

Detection fields:
- **label**: snake_case identifier (e.g. plastic_bottle, aluminum_can)
- **displayName**: Human name with material detail (e.g. "Plastic Bottle (PET #1)")
- **confidence**: 0.70-0.99 based on clarity
- **bbox**: [x, y, width, height] as fractions 0.0-1.0

Enhanced fields (NEW — always include):
- **recyclable**: boolean — can this item be recycled in most municipal programs?
- **category**: one of "plastic", "metal", "paper", "glass", "organic", "hazardous", "ewaste", "textile", "other"
- **materialDetail**: specific material info e.g. "Polyethylene Terephthalate (PET/PETE), Resin Code #1"
- **co2SavedGrams**: estimated CO₂ saved by recycling this item vs landfill (integer, in grams). Use real EPA/academic estimates.
- **decompositionYears**: approximate years to decompose in landfill (integer). Use 0 for compostable items.
- **funFact**: one surprising, educational fact about recycling this material (1 sentence)

Supported categories:
- Plastics: plastic_bottle, plastic_bag, yogurt_container, plastic_cup, plastic_wrap, chip_bag, styrofoam, plastic_straw, plastic_lid
- Metals: aluminum_can, tin_can, aerosol_can, foil, metal_cap
- Paper: newspaper, cardboard, paper_cup, paper_bag, magazine, pizza_box, egg_carton, milk_carton, tissue_paper, receipt
- Glass: glass_bottle, glass_jar, broken_glass
- Organic: food_waste, fruit_peel, coffee_grounds, tea_bag, eggshell, yard_waste
- Hazardous: battery, light_bulb, medication_bottle, paint_can, motor_oil, cleaning_product
- E-waste: electronic_waste, phone, cable, charger, headphones, keyboard
- Textile: clothing, shoe, fabric_scrap, towel
- Other: tire, wood_scrap, water_jug, ceramic, rubber

Rules:
- Only report items you can clearly identify
- If no waste items visible, return EMPTY array
- Lower confidence for obscured/blurry items
- Maximum 15 items per image
- ALWAYS include all enhanced fields for every detection`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image. Detect and classify all waste/recyclable items with full metadata including environmental impact data.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Data}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_detections",
              description: "Report all waste items detected with rich metadata",
              parameters: {
                type: "object",
                properties: {
                  detections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        displayName: { type: "string" },
                        confidence: { type: "number" },
                        bbox: { type: "array", items: { type: "number" } },
                        recyclable: { type: "boolean" },
                        category: { type: "string", enum: ["plastic", "metal", "paper", "glass", "organic", "hazardous", "ewaste", "textile", "other"] },
                        materialDetail: { type: "string" },
                        co2SavedGrams: { type: "integer" },
                        decompositionYears: { type: "integer" },
                        funFact: { type: "string" },
                      },
                      required: ["label", "displayName", "confidence", "bbox", "recyclable", "category", "materialDetail", "co2SavedGrams", "decompositionYears", "funFact"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["detections"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_detections" } },
      }),
    }, TIMEOUT_MS);

    if (!response.ok) {
      const errBody = await response.text();
      if (response.status === 429) return errorResponse("Rate limited. Please wait a moment.", 429);
      if (response.status === 402) return errorResponse("AI credits exhausted.", 402);
      console.error(`[ai-vision] Gateway ${response.status}:`, errBody.slice(0, 500));
      return errorResponse("Vision AI temporarily unavailable", 502);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        const detections = (parsed.detections || []).slice(0, 15).map((d: any) => ({
          label: String(d.label || "unknown").replace(/\s+/g, "_").toLowerCase(),
          displayName: String(d.displayName || d.label || "Unknown Item"),
          confidence: Math.min(Math.max(Number(d.confidence) || 0.75, 0), 1),
          bbox: Array.isArray(d.bbox) && d.bbox.length === 4
            ? d.bbox.map((v: number) => Math.min(Math.max(Number(v) || 0, 0), 1))
            : [0.2, 0.2, 0.4, 0.4],
          recyclable: typeof d.recyclable === "boolean" ? d.recyclable : true,
          category: String(d.category || "other"),
          materialDetail: String(d.materialDetail || ""),
          co2SavedGrams: Math.max(0, Math.round(Number(d.co2SavedGrams) || 0)),
          decompositionYears: Math.max(0, Math.round(Number(d.decompositionYears) || 0)),
          funFact: String(d.funFact || ""),
        }));

        console.log(`[ai-vision] Detected ${detections.length} items in ${Date.now() - start}ms`);
        return new Response(JSON.stringify({ detections }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseErr) {
        console.error("[ai-vision] Parse error:", parseErr);
        return errorResponse("AI returned invalid format", 502);
      }
    }

    // Fallback: try content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        const detections = parsed.detections || (Array.isArray(parsed) ? parsed : []);
        return new Response(JSON.stringify({ detections }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch { /* not JSON */ }
    }

    return new Response(JSON.stringify({ detections: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return errorResponse("Vision analysis timed out. Try a smaller image.", 504);
    }
    console.error(`[ai-vision] Error after ${Date.now() - start}ms:`, e);
    return errorResponse(e instanceof Error ? e.message : "Vision analysis failed", 500);
  }
});
