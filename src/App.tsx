import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ThemeSync } from "./components/layout/ThemeSync";
import { DashboardPage } from "./pages/DashboardPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { InsightsPage } from "./pages/InsightsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { useAppStore } from "./store/store";
import { getSurfaceMotion } from "./utils/motionConfig";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AnimatedAppRoutes() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const routeMotion = getSurfaceMotion("route", shouldReduceMotion);

  // Login page doesn't use AppLayout
  if (location.pathname === "/login") {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={routeMotion.initial}
            animate={routeMotion.animate}
            exit={routeMotion.exit}
            transition={routeMotion.transition}
          >
            <Routes location={location}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<AnimatedAppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
