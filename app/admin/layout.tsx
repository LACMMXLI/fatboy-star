import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="h-14 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/50 flex items-center px-4 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group shrink-0">
              <div className="bg-white p-1 rounded-lg">
                <img src="/logo.png" alt="Logo" className="h-6 w-auto md:h-8 object-contain" />
              </div>
              <span className="font-black text-sm md:text-lg tracking-tighter uppercase italic hidden xs:block">FATBOY</span>
            </Link>
            
            <nav className="flex items-center gap-0.5 md:gap-1">
              <Link href="/admin/dashboard" className="px-2 py-1.5 md:px-3 rounded-md text-[10px] md:text-xs font-bold transition-all hover:bg-zinc-800 text-zinc-400 hover:text-white">
                DASHBOARD
              </Link>
              <Link href="/admin/reviews" className="px-2 py-1.5 md:px-3 rounded-md text-[10px] md:text-xs font-bold transition-all hover:bg-zinc-800 text-zinc-400 hover:text-white">
                RESEÑAS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] md:text-[10px] font-black text-indigo-400 shrink-0">
              AD
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-screen-2xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
