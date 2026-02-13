"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchDetail = async () => {
    const res = await fetch(`/api/admin/reviews/${params.id}`);
    const data = await res.json();
    setReview(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [params.id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/admin/reviews/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchDetail();
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    await fetch(`/api/admin/reviews/${params.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: newNote })
    });
    setNewNote("");
    setSubmittingNote(false);
    fetchDetail();
  };

  if (loading) return <div>Cargando detalle...</div>;
  if (!review) return <div>No se encontró la review.</div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 overflow-x-hidden pb-10">
      <div className="flex items-center justify-between">
        <Link href="/admin/reviews" className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">
          <span className="text-sm">←</span> <span>VOLVER</span>
        </Link>
        <div className="flex gap-2">
           <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-600 rounded text-[8px] font-mono">
             ID: {params.id.substring(0,8)}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <section className="bg-zinc-900/50 border border-zinc-800 p-4 sm:p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-2xl">
                  {review.rating}
                </div>
                <div>
                   <div className="flex gap-0.5 mb-1">
                     {[...Array(5)].map((_, i) => (
                       <span key={i} className={`text-sm ${i < review.rating ? 'text-amber-500' : 'text-zinc-800'}`}>★</span>
                     ))}
                   </div>
                   <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400">{review.branch}</h2>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border self-start
                ${review.status === 'pending' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                  review.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                {review.status}
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Mensaje del Cliente</span>
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/50 italic text-zinc-300 text-sm leading-relaxed">
                "{review.comment || <span className="opacity-20">Sin comentario escrito.</span>}"
              </div>
              <p className="text-[9px] font-bold text-zinc-600 uppercase text-right mt-2">
                 Enviado: {new Date(review.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 p-4 sm:p-6 rounded-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-zinc-600" /> Notas de Seguimiento
            </h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <Textarea 
                  placeholder="Añadir nota interna..." 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="rounded-lg border-zinc-800 bg-zinc-950 p-3 h-24 text-xs font-medium text-zinc-300 focus:border-indigo-500/50 transition-all outline-none resize-none"
                />
                <Button 
                  onClick={addNote} 
                  disabled={submittingNote || !newNote.trim()}
                  className="bg-zinc-800 text-white hover:bg-indigo-600 font-black uppercase text-[9px] h-8 rounded transition-all"
                >
                  GUARDAR NOTA
                </Button>
              </div>
              <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                {review.notes?.length === 0 ? (
                  <p className="text-[10px] text-zinc-700 font-bold uppercase text-center py-4">Sin notas internas aún</p>
                ) : review.notes?.map((note: any) => (
                  <div key={note.id} className="bg-zinc-950/30 border border-zinc-900 p-3 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800" />
                    <p className="text-zinc-400 text-xs font-medium pl-2">{note.note}</p>
                    <p className="mt-2 text-[8px] font-bold text-zinc-700 uppercase tracking-tighter pl-2">
                       {new Date(note.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">Panel de Control</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 tracking-widest ml-1">Cambiar Estado</label>
                <div className="relative">
                  <Select 
                    value={review.status} 
                    onChange={(e) => updateStatus(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-400 rounded-xl text-[10px] h-12 uppercase font-black w-full"
                  >
                    <option value="pending">🟡 PENDIENTE</option>
                    <option value="in_progress">🟠 PROCESANDO</option>
                    <option value="resolved">🟢 RESUELTO</option>
                  </Select>
                </div>
              </div>
              
              {review.status !== 'resolved' && (
                 <button 
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-500 font-black uppercase text-[10px] h-12 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                  onClick={() => updateStatus('resolved')}
                >
                  MARCAR COMO RESUELTO
                </button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800/50">
               <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Auditoría Técnica</p>
               <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/30">
                  <p className="text-[7px] text-zinc-600 mb-1 uppercase">ID del Dispositivo:</p>
                  <span className="text-[8px] font-mono text-zinc-700 break-all">{review.device_hash}</span>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
