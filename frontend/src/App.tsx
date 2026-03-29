import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ArenaPage from "./pages/ArenaPage";
import AuthPage from "./pages/AuthPage";
import DNAPage from "./pages/DNAPage";
import NexoraPage from "./pages/NexoraPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PremiumBackground from "./components/PremiumBackground";
import { AuthProvider } from "./lib/AuthContext";
import { useAuth } from "./lib/AuthContext";

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PremiumBackground />
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/arena" element={<ProtectedRoute><ArenaPage /></ProtectedRoute>} />
          <Route path="/dna" element={<ProtectedRoute><DNAPage /></ProtectedRoute>} />
          <Route path="/nexora" element={<ProtectedRoute><NexoraPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

