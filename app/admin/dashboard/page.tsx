"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Agregamos un timestamp para evitar caché agresivo del navegador
      const res = await fetch(`/api/admin/dashboard?t=${Date.now()}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    if (!confirm("¿ESTÁS SEGURO? Esta acción eliminará TODAS las reseñas y notas de forma permanente de Supabase.")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews/clear", { method: "DELETE" });
      if (res.ok) {
        alert("Base de datos limpiada correctamente.");
        fetchData();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Sondeo (polling): Actualiza los datos cada 30 segundos automáticamente
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-white uppercase italic">Dashboard</h1>
        <div className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
          LIVE DATA
        </div>
        <button 
          onClick={clearDatabase}
          className="text-[9px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest"
        >
          Limpiar Todo
        </button>
      </div>

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard title="Hoy" value={data.today} color="text-rose-400" />
        <StatCard title="7 días" value={data.sevenDays} color="text-blue-400" />
        <StatCard title="30 días" value={data.thirtyDays} color="text-emerald-400" />
        <StatCard title="Promedio" value={Number(data.average || 0).toFixed(1)} color="text-amber-400" />
        <StatCard title="Positivas" value={`${data.positivePct}%`} color="text-indigo-400" />
        <StatCard title="Negativas" value={`${data.negativePct}%`} color="text-zinc-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* NUEVO: Módulo de Alerta Roja */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
               <h2 className="text-xs sm:text-sm font-black uppercase text-rose-500 tracking-[0.2em]">Prioridad Crítica</h2>
             </div>
             <Link href="/admin/reviews?rating=low&status=pending" className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">Ver todas</Link>
           </div>
           
           <div className="grid gap-3">
             {data.criticalReviews?.length === 0 ? (
               <div className="bg-zinc-900/10 border border-zinc-800/30 p-8 rounded-2xl text-center">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Sin alertas pendientes</p>
               </div>
             ) : data.criticalReviews.map((rev: any) => (
               <Link 
                key={rev.id} 
                href={`/admin/reviews/${rev.id}`}
                className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl hover:bg-zinc-800 transition-all group relative overflow-hidden active:scale-[0.99]"
               >
                 <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl flex items-center justify-center font-black shrink-0">
                      {rev.rating}★
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-rose-400 tracking-tighter mb-0.5 truncate">{rev.branch} • {new Date(rev.created_at).toLocaleDateString()}</p>
                      <p className="text-xs font-medium text-zinc-400 line-clamp-1 italic pr-4">"{rev.comment || "Sin comentario"}"</p>
                    </div>
                 </div>
                 <span className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all sm:block hidden translate-x-2 group-hover:translate-x-0">→</span>
               </Link>
             ))}
           </div>
        </div>

        {/* Resumen por sucursales */}
        <div className="space-y-4">
           <h2 className="text-sm font-black uppercase text-zinc-500 tracking-[0.2em]">Rendimiento Sucursales</h2>
           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {data.branchStats.map((stat: any) => (
              <div key={stat.branch} className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-colors">
                <span className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">{stat.branch}</span>
                <div className="flex items-center gap-4">
                   <div className="flex flex-col items-end">
                     <span className="text-xs font-black text-white">{stat.avg.toFixed(1)}★</span>
                     <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">{stat.total} reviews</span>
                   </div>
                   <Link href={`/admin/reviews?branch=${stat.branch}&rating=low&status=pending`} className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                     <span className="text-xs font-black">!</span>
                   </Link>
                </div>
              </div>
            ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{title}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}
