import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Vault from "./pages/Vault";
import Study from "./pages/Study";
import Review from "./pages/Review";
import Voice from "./pages/Voice";
import Agent from "./pages/Agent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Vault />} />
          <Route path="/study" element={<Study />} />
          <Route path="/review" element={<Review />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
