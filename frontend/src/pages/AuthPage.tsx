import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Radio, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { auth, googleProvider } from "../lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const [emailMode, setEmailMode] = useState<"signin" | "register" | "forgot">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true); setError(null);
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Email and Password required.");
    try {
      setLoading(true); setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid credentials. Check your email/password or create an account.");
      } else { setError(err.message); }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Email and Password required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    try {
      setLoading(true); setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered. Sign in instead.");
      } else { setError(err.message); }
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Enter your email address first.");
    try {
      setLoading(true); setError(null); setSuccessMsg(null);
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Reset link sent to " + email + ". Check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-[#ED1C24] selection:text-white flex flex-col justify-center items-center relative overflow-hidden">

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] bg-[#ED1C24] blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-[#FFD700] blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-xl z-10 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#ED1C24] flex items-center justify-center shadow-[0_0_20px_rgba(237,28,36,0.5)] transform -skew-x-12 mb-4">
            <Radio className="text-white w-6 h-6 animate-pulse skew-x-12" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none text-center">
            OPERATIVE <span className="text-[#ED1C24]">ACCESS</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mt-3 text-center">
            Identify to connect terminal
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-[#ED1C24]/10 border border-[#ED1C24]/50 p-4 rounded-lg mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ED1C24] break-words">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="bg-[#00FF41]/10 border border-[#00FF41]/40 p-4 rounded-lg mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#00FF41] shrink-0 mt-0.5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#00FF41] break-words">{successMsg}</p>
          </div>
        )}

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-[#121212] border border-white/10 hover:border-white/30 text-white font-bold py-4 px-6 rounded-lg uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-4 group mb-6 hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Initialize via Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">or use email</span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {/* Email Mode Tabs */}
        <div className="flex gap-1 bg-[#121212] rounded-lg p-1 border border-white/5 mb-5">
          {(["signin", "register", "forgot"] as const).map(m => (
            <button key={m} onClick={() => { setEmailMode(m); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${
                emailMode === m ? 'bg-[#ED1C24] text-white shadow-[0_0_10px_rgba(237,28,36,0.4)]' : 'text-white/30 hover:text-white/60'
              }`}>
              {m === 'signin' ? 'Sign In' : m === 'register' ? 'Create Account' : 'Reset Password'}
            </button>
          ))}
        </div>

        {/* Email field (always shown) */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/50 pl-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] p-4 text-sm font-mono text-white rounded-lg outline-none transition-all"
            placeholder="operative@cognify.net" />
        </div>

        {/* Password (hidden on reset tab) */}
        {emailMode !== 'forgot' && (
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/50">Password</label>
              {emailMode === 'signin' && (
                <button type="button" onClick={() => { setEmailMode('forgot'); setError(null); setSuccessMsg(null); }}
                  className="text-[8px] font-black uppercase tracking-widest text-[#ED1C24]/70 hover:text-[#ED1C24] transition-colors">
                  Forgot?
                </button>
              )}
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] p-4 text-sm font-mono text-white rounded-lg outline-none transition-all"
              placeholder="••••••••••••" />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={emailMode === 'signin' ? handleSignIn : emailMode === 'register' ? handleRegister : handleForgotPassword}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#ED1C24] via-[#5C0307] to-[#ED1C24] bg-[length:200%_auto] animate-bg-gradient border border-[#ED1C24]/50 p-4 rounded-xl transition-all duration-500 shadow-[0_0_15px_rgba(237,28,36,0.3)] hover:shadow-[0_0_25px_rgba(237,28,36,0.6)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (
            <>
              <span className="text-xs font-black uppercase tracking-widest text-white">
                {emailMode === 'signin' ? 'Sign In' : emailMode === 'register' ? 'Create Account' : 'Send Reset Link'}
              </span>
              {emailMode === 'forgot' ? <ArrowRight className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes bg-gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
        .animate-bg-gradient { animation: bg-gradient 4s linear infinite; }
      `}</style>
    </div>
  );
}
