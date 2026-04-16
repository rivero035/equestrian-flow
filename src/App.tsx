import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/AppLayout";
import { StudentLayout } from "@/components/StudentLayout";
import { EquioLoader } from "@/components/EquioLoader";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Horses from "./pages/Horses";
import Students from "./pages/Students";
import Credits from "./pages/Credits";
import Waitlist from "./pages/Waitlist";
import CenterSettings from "./pages/CenterSettings";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import StudentDashboard from "./pages/StudentDashboard";
import StudentBookings from "./pages/StudentBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, role, centerId, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <EquioLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // No role or no center yet → onboarding
  if (!role || !centerId) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  // Student routes
  if (role === "student") {
    return (
      <StudentLayout>
        <Routes>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/reservas" element={<StudentBookings />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </StudentLayout>
    );
  }

  // Manager routes
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reservas" element={<Bookings />} />
        <Route path="/caballos" element={<Horses />} />
        <Route path="/alumnos" element={<Students />} />
        <Route path="/creditos" element={<Credits />} />
        <Route path="/espera" element={<Waitlist />} />
        <Route path="/ajustes" element={<CenterSettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
