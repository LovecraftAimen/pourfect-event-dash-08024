import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Eventos from "./pages/Eventos";
import Financeiro from "./pages/Financeiro";
import Estoque from "./pages/Estoque";
import Drinks from "./pages/Drinks";
import Equipe from "./pages/Equipe";
import Clientes from "./pages/Clientes";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
            <Route path="/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
            <Route path="/drinks" element={<ProtectedRoute><Drinks /></ProtectedRoute>} />
            <Route path="/equipe" element={<ProtectedRoute><Equipe /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
