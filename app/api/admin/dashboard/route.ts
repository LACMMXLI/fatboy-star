import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Queries en paralelo para mejor performance
    const [
      { count: countToday },
      { count: count7d },
      { count: count30d },
      { data: allStats }
    ] = await Promise.all([
      supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }).gte("created_at", today),
      supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
      supabaseAdmin.from("reviews").select("rating, branch")
    ]);

    const total = allStats?.length || 0;
    const avg = total > 0 ? (allStats?.reduce((acc, r) => acc + r.rating, 0) || 0) / total : 0;
    const positive = allStats?.filter(r => r.rating >= 4).length || 0;
    const negative = allStats?.filter(r => r.rating <= 3).length || 0;

    // Resumen por sucursal
    const branchStats = ["venecia", "sanmarcos"].map(branch => {
      const branchReviews = allStats?.filter(r => r.branch === branch) || [];
      return {
        branch,
        total: branchReviews.length,
        avg: branchReviews.length > 0 ? branchReviews.reduce((acc, r) => acc + r.rating, 0) / branchReviews.length : 0
      };
    });

    // NUEVO: Obtener las 3 reviews críticas más recientes que están pendientes
    const { data: criticalReviews } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .lte("rating", 2)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3);

    return NextResponse.json({
      today: countToday || 0,
      sevenDays: count7d || 0,
      thirtyDays: count30d || 0,
      average: Number(avg || 0).toFixed(1),
      positivePct: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativePct: total > 0 ? Math.round((negative / total) * 100) : 0,
      branchStats,
      criticalReviews: criticalReviews || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
