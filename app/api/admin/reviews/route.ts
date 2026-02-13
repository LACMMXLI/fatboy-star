import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch");
  const rating = searchParams.get("rating");
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  try {
    let query = supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (branch && branch !== "all") query = query.eq("branch", branch);
    
    if (rating && rating !== "all") {
      if (rating === "low") {
        query = query.lte("rating", 2);
      } else {
        query = query.eq("rating", parseInt(rating));
      }
    }

    if (status && status !== "all") query = query.eq("status", status);
    if (q) query = query.ilike("comment", `%${q}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ items: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
