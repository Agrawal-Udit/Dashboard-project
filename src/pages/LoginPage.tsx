import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useAppStore } from "../store/store";
import { Button } from "../components/ui/Button";
import type { Role } from "../store/uiSlice";

const highlights = [
  "Smart expense tracking",
  "Role-based access control",
  "Real-time visual insights",
];

const valueProps = [
  {
    title: "Automated insights",
    description: "See where your money goes with category-level analysis.",
  },
  {
    title: "Fast and secure",
    description: "Protected routes plus streamlined access for your team.",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Viewer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    // Simple auth - in real app, this would call an API
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    // Login successful
    login(username, role);
    navigate("/");
  };

  return (
    <div className="finrise-auth-bg finrise-auth-grid relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-12%] top-[-18%] h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-25%] right-[-10%] h-104 w-104 rounded-full bg-cyan-500/20 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            className="finrise-glass hidden rounded-3xl p-8 text-zinc-100 lg:flex lg:flex-col lg:justify-between xl:p-10"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
                <Sparkles size={14} />
                Premium Finance Workspace
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="finrise-accent-gradient flex h-11 w-11 items-center justify-center rounded-xl">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">
                    Finrise Console
                  </p>
                  <h1 className="text-2xl font-semibold text-white">
                    Control your money, beautifully.
                  </h1>
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-zinc-200"
                  >
                    <CheckCircle2 size={16} className="text-cyan-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {valueProps.map((item) => (
                <div key={item.title} className="finrise-badge rounded-2xl p-4">
                  <p className="text-sm font-semibold text-zinc-100">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="finrise-panel w-full rounded-3xl p-6 text-zinc-100 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">
                  Welcome back
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  Sign in
                </h2>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-2.5">
                <ShieldCheck size={18} className="text-cyan-300" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium text-zinc-200"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-300/30"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-zinc-200"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 pr-11 text-sm text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-300/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-300 transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1.5 block text-sm font-medium text-zinc-200"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-zinc-100 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-300/30"
                >
                  <option value="Viewer" className="bg-zinc-900 text-zinc-100">
                    Viewer (Read Only)
                  </option>
                  <option value="Admin" className="bg-zinc-900 text-zinc-100">
                    Admin (Full Access)
                  </option>
                </select>
              </div>

              {error && (
                <motion.div
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full rounded-xl py-3"
                icon={<LogIn size={18} />}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/12 bg-white/4 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-300">
                Demo credentials
              </p>
              <div className="space-y-1 text-xs text-zinc-300">
                <p>
                  Username:{" "}
                  <span className="font-mono text-zinc-200">demo</span>
                </p>
                <p>
                  Password:{" "}
                  <span className="font-mono text-zinc-200">demo123</span>
                </p>
              </div>
              <p className="mt-3 flex items-center gap-1 text-[11px] text-zinc-300">
                <ArrowRight size={12} /> Any credentials work for demo mode
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
