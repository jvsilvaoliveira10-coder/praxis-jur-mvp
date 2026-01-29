import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientForm from "./pages/ClientForm";
import Cases from "./pages/Cases";
import CaseForm from "./pages/CaseForm";
import Petitions from "./pages/Petitions";
import PetitionForm from "./pages/PetitionForm";
import Templates from "./pages/Templates";
import TemplateForm from "./pages/TemplateForm";
import Agenda from "./pages/Agenda";
import DeadlineForm from "./pages/DeadlineForm";
import Jurisprudence from "./pages/Jurisprudence";
import NotFound from "./pages/NotFound";

// Layout
import MainLayout from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/:id/edit" element={<ClientForm />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/new" element={<CaseForm />} />
              <Route path="/cases/:id/edit" element={<CaseForm />} />
              <Route path="/petitions" element={<Petitions />} />
              <Route path="/petitions/new" element={<PetitionForm />} />
              <Route path="/petitions/:id/edit" element={<PetitionForm />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/new" element={<TemplateForm />} />
              <Route path="/templates/:id/edit" element={<TemplateForm />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/agenda/new" element={<DeadlineForm />} />
              <Route path="/agenda/:id/edit" element={<DeadlineForm />} />
              <Route path="/jurisprudence" element={<Jurisprudence />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
