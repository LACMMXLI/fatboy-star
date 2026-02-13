"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface FeedbackClientProps {
  branch: "venecia" | "sanmarcos";
}

const RATING_TEXT = {
  1: "Lo sentimos 😕",
  2: "Ayúdanos a mejorar",
  3: "Gracias por tu feedback",
  4: "¡Genial! ¿Nos dejas reseña en Google?",
  5: "¡Excelente! ¿Nos dejas reseña en Google?",
};

export default function FeedbackClient({ branch }: FeedbackClientProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar");
      }
      
      if (data.googleUrl) {
        setRedirectUrl(data.googleUrl);
      }
      
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  if (status === "success") {
    return (
      <Card className="text-center py-12 animate-in fade-in zoom-in duration-300">
        <CardContent className="space-y-6">
          <div className="text-6xl">🙌</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {rating >= 4 ? "¡Muchísimas gracias!" : "Gracias por tu opinión"}
            </h2>
            <p className="text-zinc-500">
              {rating >= 4 
                ? "Si puedes, déjanos tu reseña en Google para que más gente nos conozca ⭐"
                : "Tu feedback es muy valioso. Lo revisaremos hoy mismo para mejorar nuestro servicio."}
            </p>
          </div>
          {rating >= 4 && redirectUrl && (
            <Button 
              className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all" 
              onClick={() => window.location.href = redirectUrl}
            >
              Abrir Google Reviews
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border-zinc-300/50 bg-white/90 backdrop-blur-3xl ring-1 ring-black/10 rounded-[32px] w-full">
      <CardHeader className="text-center p-3 pb-1 relative z-10">
        <div className="bg-zinc-900 w-fit mx-auto px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-100 mb-1 shadow-md">
          Feedback
        </div>
        <CardTitle className="text-xl font-black tracking-tight text-black leading-tight">
          ¿Cómo fue tu visita?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 space-y-4 relative z-10">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-4xl sm:text-5xl transition-all duration-300 transform active:scale-75 ${
                  rating >= star 
                    ? "text-amber-500 scale-105 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" 
                    : "text-zinc-200 hover:text-zinc-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="h-4">
            {rating > 0 && (
              <p className="text-[10px] font-black text-black bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-widest animate-in slide-in-from-top-1 duration-300">
                {RATING_TEXT[rating as keyof typeof RATING_TEXT]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Textarea
              placeholder="¿Qué podríamos mejorar? (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              className="resize-none min-h-[90px] border-zinc-200 bg-white p-4 text-sm rounded-[20px] shadow-sm placeholder:text-zinc-400 text-black font-medium focus:ring-2 focus:ring-black/5"
            />
          </div>

          {status === "error" && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-[10px] font-black text-center border border-red-100">
              {errorMessage || "¡VAYA! INTÉNTALO DE NUEVO"}
            </div>
          )}

          <Button
            className={`w-full h-14 text-base font-black rounded-2xl shadow-2xl active:scale-[0.98] transition-all transform duration-200 ${
              rating === 0 
                ? "bg-zinc-100 text-zinc-400 border-none cursor-not-allowed" 
                : "bg-black hover:bg-zinc-900 text-white border border-white/10"
            }`}
            disabled={rating === 0 || status === "loading"}
            onClick={handleSubmit}
          >
            {status === "loading" ? "ENVIANDO..." : "ENVIAR MI OPINIÓN"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
