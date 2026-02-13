import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { patchReviewSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("id", params.id)
      .single();

    if (reviewError) throw reviewError;

    const { data: notes, error: notesError } = await supabaseAdmin
      .from("review_notes")
      .select("*")
      .eq("review_id", params.id)
      .order("created_at", { ascending: false });

    if (notesError) throw notesError;

    return NextResponse.json({ ...review, notes });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = patchReviewSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .update(validated)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
