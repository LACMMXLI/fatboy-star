import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.png" alt="FATBOY Logo" className="h-48 w-auto" />
          <p className="text-zinc-500">Selecciona una sucursal para darnos tu opinión</p>
        </div>
        <div className="grid gap-4">
          <Link href="/r/venecia" className="w-full">
            <Button variant="primary" size="lg" className="w-full h-16 text-xl">
              Venecia
            </Button>
          </Link>
          <Link href="/r/sanmarcos" className="w-full">
            <Button variant="primary" size="lg" className="w-full h-16 text-xl">
              San Marcos
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
