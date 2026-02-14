import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    // Elimina todas las reseñas. Debido a las relaciones (FK), 
    // asegúrate de que las notas también se eliminen si no tienen ON DELETE CASCADE.
    
    // Primero intentamos eliminar las notas vinculadas si existen
    await supabaseAdmin.from("review_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    // Luego eliminamos todas las reseñas
    const { error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Truco para seleccionar todo

    if (error) throw error;

    return NextResponse.json({ message: "Base de datos limpiada correctamente" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
