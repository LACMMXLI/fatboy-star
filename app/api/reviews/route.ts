import { NextRequest, NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validators";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateDeviceHash } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = reviewSchema.parse(body);
    
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const deviceHash = await generateDeviceHash(userAgent, ip);

    // 1. Verificar si ya existe una reseña de este dispositivo hoy
    const { data: existing } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("device_hash", deviceHash)
      .eq("branch", validated.branch)
      .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya has enviado tu opinión hoy. ¡Gracias!" },
        { status: 429 }
      );
    }

    // 2. Si no hay duplicado, insertar
    const { data: review, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        branch: validated.branch,
        rating: validated.rating,
        comment: validated.comment,
        source: validated.source,
        device_hash: deviceHash,
        status: "pending",
        priority: validated.rating <= 2 ? "high" : "normal"
      })
      .select()
      .single();

    if (error) throw error;

    const googleUrl = validated.branch === "venecia" 
      ? process.env.GOOGLE_REVIEW_URL_VENECIA 
      : process.env.GOOGLE_REVIEW_URL_SANMARCOS;

    return NextResponse.json({
      ok: true,
      id: review.id,
      shouldRedirect: validated.rating >= 4,
      googleUrl: validated.rating >= 4 ? googleUrl : null
    });

  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
