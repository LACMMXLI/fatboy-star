"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

function ReviewsList() {
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: searchParams.get("branch") || "all",
    rating: searchParams.get("rating") || "all",
    status: searchParams.get("status") || "all",
    q: searchParams.get("q") || ""
  });

  const fetchReviews = async () => {
    const params = new URLSearchParams(filters);
    // Agregamos t para evitar caché
    const res = await fetch(`/api/admin/reviews?${params.toString()}&t=${Date.now()}`);
    const data = await res.json();
    setReviews(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl font-black tracking-tight text-white uppercase italic">Reseñas</h1>
        <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg w-full sm:w-auto overflow-hidden">
           {['all', 'pending', 'in_progress', 'resolved'].map((s) => (
             <button 
                key={s}
                onClick={() => setFilters({ ...filters, status: s })}
                className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${filters.status === s ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
               {s === 'all' ? 'Todas' : s === 'pending' ? 'Pend.' : s === 'in_progress' ? 'Proc.' : 'Res.'}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 border-b border-zinc-900">
          <Select 
            value={filters.branch} 
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            className="rounded-lg border-zinc-800 bg-zinc-900 font-bold text-[10px] h-9 px-2 uppercase text-zinc-400"
          >
            <option value="all">Sucursales</option>
            <option value="venecia">Venecia</option>
            <option value="sanmarcos">San Marcos</option>
          </Select>
          <Select 
            value={filters.rating} 
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="rounded-lg border-zinc-800 bg-zinc-900 font-bold text-[10px] h-9 px-2 uppercase text-zinc-400"
          >
            <option value="all">Rating</option>
            <option value="low">⚠️ Críticas</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
          </Select>
          <div className="col-span-2">
            <Input 
              placeholder="Buscar..." 
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="rounded-lg border-zinc-800 bg-zinc-900 font-medium text-[10px] h-9 px-3 text-zinc-400 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-900/50">
                <th className="px-4 py-3">Cliente / Fecha</th>
                <th className="px-4 py-3">Sucursal</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comentario</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center font-black text-[10px] text-zinc-700 animate-pulse">CARGANDO...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center font-black text-[10px] text-zinc-700 uppercase">SIN RESULTADOS</td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-zinc-200">#{(review.id || '').substring(0,4)}</span>
                      <span className="text-[9px] font-medium text-zinc-600 uppercase">
                        {new Date(review.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[9px] font-black text-zinc-500 uppercase">{review.branch}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={review.rating <= 2 ? 'text-red-500' : review.rating === 3 ? 'text-amber-500' : 'text-emerald-500'}>
                      {review.rating} ★
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate max-w-[200px] text-[11px] text-zinc-400 italic">
                    {review.comment || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link 
                      href={`/admin/reviews/${review.id}`} 
                      className="inline-flex h-7 px-3 items-center justify-center rounded-md bg-zinc-800 text-zinc-300 text-[9px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      GESTIONAR
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile List View */}
          <div className="md:hidden divide-y divide-zinc-900 bg-zinc-950">
            {loading ? (
              <div className="p-10 text-center font-black text-[10px] text-zinc-700 animate-pulse uppercase">CARGANDO...</div>
            ) : reviews.length === 0 ? (
              <div className="p-10 text-center font-black text-[10px] text-zinc-700 uppercase">SIN RESULTADOS</div>
            ) : reviews.map((review) => (
              <div key={review.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-black text-[10px] text-zinc-500 uppercase tracking-widest">{review.branch}</span>
                    <span className="text-[9px] font-medium text-zinc-600 uppercase">
                      {new Date(review.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                  </div>
                  <span className={`text-base font-black ${review.rating <= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {review.rating}★
                  </span>
                </div>
                {review.comment && (
                  <p className="text-[11px] text-zinc-400 italic bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                    "{review.comment}"
                  </p>
                )}
                <Link 
                  href={`/admin/reviews/${review.id}`} 
                  className="w-full flex h-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:border-indigo-500 transition-all"
                >
                  GESTIONAR RESEÑA
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black text-zinc-800 animate-pulse">CARGANDO...</div>}>
      <ReviewsList />
    </Suspense>
  );
}
