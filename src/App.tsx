
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddService from "./pages/AddService";
import EditService from "./pages/EditService";
import ServiceDetail from "./pages/ServiceDetail";
import DatabaseClient from "./pages/DatabaseClient";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/index" element={<Index />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/edit-service/:id" element={<EditService />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/database-client/:id" element={<DatabaseClient />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
