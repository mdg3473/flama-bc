import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Gate from "./pages/Gate.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Comunidade from "./pages/Comunidade.tsx";
import Admin from "./pages/Admin.tsx";
import Loja from "./pages/Loja.tsx";
import Momentos from "./pages/Momentos.tsx";
import Mensagens from "./pages/Mensagens.tsx";
import Devocional from "./pages/Devocional.tsx";
import Sobre from "./pages/Sobre.tsx";
import Contato from "./pages/Contato.tsx";
import MeusQRCodes from "./pages/MeusQRCodes.tsx";
import Validar from "./pages/Validar.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("flama_gate") === "1"
  );
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={unlocked ? <Index /> : <Gate onUnlock={() => setUnlocked(true)} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/momentos" element={<Momentos />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/devocional" element={<Devocional />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/meus-qrcodes" element={<MeusQRCodes />} />
          <Route path="/validar/:token" element={<Validar />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
