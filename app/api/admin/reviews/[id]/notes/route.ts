import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { noteSchema } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = noteSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("review_notes")
      .insert({
        review_id: params.id,
        note: validated.note
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
