import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Centers from "./pages/Centers";
import Entries from "./pages/Entries";
import Balance from "./pages/Balance";
import CAGE from "./pages/CAGE";
import Analytics from "./pages/Analytics";
import ImportExport from "./pages/ImportExport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/centers" element={<Centers />} />
          <Route path="/entries" element={<Entries />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/cage" element={<CAGE />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/import-export" element={<ImportExport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
