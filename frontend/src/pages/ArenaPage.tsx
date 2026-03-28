import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Zap,
  TrendingUp,
  User,
  Landmark,
  Briefcase,
  TrendingDown,
  Users,
  Loader2,
  Globe,
  X,
  Send,
  Bot,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  generateInsight,
  ETCognifyInsight,
  Perspective,
} from "../services/geminiService";
import {
  useReadingTracker,
  savePerspectiveClick,
} from "../hooks/useReadingTracker";
import NexoraCTA from "../components/NexoraCTA";
import AppShell from "../components/AppShell";

// --- Background Decoration ---
const UnifiedSquares = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastX = 0;
    let lastY = 0;

    const updatePosition = () => {
      if (containerRef.current && contentRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Only update DOM if it actually moved to save paint cycles
        if (rect.left !== lastX || rect.top !== lastY) {
          contentRef.current.style.transform = `translate(${-rect.left}px, ${-rect.top}px)`;
          lastX = rect.left;
          lastY = rect.top;
        }
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20 mix-blend-screen"
    >
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          willChange: "transform",
        }}
      >
        {/* Row 1: Right to Left */}
        <div className="absolute top-[35vh] left-[-5vw] flex rotate-[-12deg] origin-left">
          <div
            className="flex animate-slide-infinite w-max"
            style={{ animationDuration: "24s" }}
          >
            <div className="flex gap-16 pr-16">
              {[...Array(12)].map((_, i) => (
                <div
                  key={`g1-${i}`}
                  className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.25] shadow-[0_0_40px_rgba(237,28,36,0.3)]"
                />
              ))}
            </div>
            <div className="flex gap-16 pr-16">
              {[...Array(12)].map((_, i) => (
                <div
                  key={`g2-${i}`}
                  className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.25] shadow-[0_0_40px_rgba(237,28,36,0.3)]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Left to Right */}
        <div className="absolute top-[55vh] right-[-5vw] flex rotate-[-12deg] origin-right">
          <div
            className="flex gap-20 animate-slide-right-hero w-max"
            style={{ animationDuration: "14s" }}
          >
            {[...Array(3)].map((_, groupIdx) => (
              <div key={groupIdx} className="flex gap-20">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.2] shadow-[0_0_30px_rgba(237,28,36,0.2)]"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Types ---
interface ChatMessage {
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

interface StoryData {
  id: string;
  tag: string;
  title: string;
  impact: string;
  time: string;
  link: string;
}

const Seismograph = () => {
  const [tremors] = useState([
    {
      id: "ALPHA",
      company: "ZEE ENT",
      confidence: 74,
      status: "VOLATILE",
      color: "text-red-500",
    },
    {
      id: "BETA",
      company: "ADANI PORTS",
      confidence: 62,
      status: "STABLE",
      color: "text-emerald-500",
    },
    {
      id: "GAMMA",
      company: "RELIANCE",
      confidence: 51,
      status: "WATCH",
      color: "text-amber-500",
    },
    {
      id: "DELTA",
      company: "HDFC BANK",
      confidence: 88,
      status: "CRITICAL",
      color: "text-red-600",
    },
  ]);

  return (
    <section className="bg-black border-b border-white/5 py-2 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
      <div className="flex items-center gap-12 px-4 whitespace-nowrap animate-marquee">
        {Array(4)
          .fill(0)
          .map((_, groupIdx) => (
            <React.Fragment key={groupIdx}>
              <div className="flex items-center gap-3 text-[#FFD700] font-black text-[9px] uppercase tracking-[0.4em]">
                <Activity className="w-4 h-4" />
                Live Signal
              </div>
              {tremors.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 text-[11px] font-bold group cursor-crosshair"
                >
                  <span className="text-white/20 font-mono tracking-tighter">
                    [{t.id}]
                  </span>
                  <span className="text-white group-hover:text-[#ED1C24] transition-colors">
                    {t.company}
                  </span>
                  <div
                    className={`h-1 w-8 bg-white/5 rounded-full overflow-hidden`}
                  >
                    <div
                      className={`h-full bg-current ${t.color}`}
                      style={{ width: `${t.confidence}%` }}
                    />
                  </div>
                  <span
                    className={`${t.color} text-[8px] font-black border border-current/30 px-1.5 py-0.5 rounded-sm`}
                  >
                    {t.status}
                  </span>
                  <span className="text-white/10">/</span>
                </div>
              ))}
            </React.Fragment>
          ))}
      </div>
    </section>
  );
};

// --- RAG Chatbot Component ---
const RAGChatbot = ({
  storyTitle,
  articleLink,
}: {
  storyTitle: string;
  articleLink?: string;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: `I've analyzed the article: **"${storyTitle}"**. Ask me anything about this piece — key insights, market impact, what it means for your portfolio, or how it fits into the bigger picture.`,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // Auto-ingest article into Vector Database when it changes
  useEffect(() => {
    if (!articleLink) return;
    const mockUserId = "et_premium_user_01";
    fetch("http://localhost:8000/api/rag/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: articleLink, user_id: mockUserId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("[RAG] Ingested successfully:", articleLink);
          if (data.insight_message) {
            console.log("[RAG] Insight generated:", data.insight_message);
          }
        }
      })
      .catch((err) => console.error("[RAG] Ingest error:", err));
  }, [articleLink]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8000/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg.content,
          article_id: articleLink,
        }),
      });
      const data = await res.json();
      const botReply: ChatMessage = {
        role: "bot",
        content: data.answer || "I'm having trouble analyzing this right now.",
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Error connecting to the backend intelligence engine. Is it running?",
          timestamp: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "What is the key impact?",
    "Investment angle?",
    "Key risks?",
    "Sector implications?",
  ];

  return (
    <div className="bg-transparent border border-white/10 rounded-xl flex flex-col relative overflow-hidden h-full z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <UnifiedSquares />
      {/* Header */}
      <div className="bg-white/5 px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10 flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg flex items-center justify-center">
            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFD700]" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border border-black animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white">
            Intel Analyst
          </h3>
          <p className="text-[7px] sm:text-[8px] text-white/40 font-medium">
            RAG · Context-Aware
          </p>
        </div>
        <div className="ml-auto px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[6px] sm:text-[7px] font-black text-emerald-500 uppercase tracking-tighter shrink-0">
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-1.5 sm:gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-md flex items-center justify-center mt-1">
                  <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFD700]" />
                </div>
              )}
              <div className={`max-w-[75%] sm:max-w-[80%] group`}>
                <div
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm leading-relaxed font-medium shadow-md ${
                    msg.role === "user"
                      ? "bg-[#ED1C24] text-white rounded-br-sm"
                      : "bg-white/5 border border-white/10 text-white/90 rounded-bl-sm backdrop-blur-md"
                  }`}
                >
                  {msg.content}
                </div>
                <div
                  className={`text-[6px] sm:text-[7px] text-white/20 font-mono mt-0.5 sm:mt-1 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  {msg.timestamp}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 bg-white/5 border border-white/10 rounded-md flex items-center justify-center mt-1">
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/50" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1.5 sm:gap-2 items-center"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-md flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFD700]" />
            </div>
            <div className="bg-white/5 border border-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl rounded-bl-sm flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#FFD700]/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-2 sm:px-3 pb-1.5 sm:pb-2 flex gap-1 flex-wrap shrink-0">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(s);
            }}
            className="text-[7px] sm:text-[8px] font-bold text-white/40 border border-white/10 px-2 py-1 rounded-full hover:border-[#FFD700]/40 hover:text-[#FFD700] transition-all whitespace-nowrap"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-2 pb-2 shrink-0">
        <div className="flex gap-1.5 bg-transparent border border-white/30 rounded-lg focus-within:border-white/60 transition-colors overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about this story…"
            className="flex-1 min-w-0 bg-transparent text-[11px] text-white placeholder-white/40 px-2 py-2 outline-none font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 px-3 py-2 bg-[#ED1C24] hover:bg-[#c41018] text-white flex items-center justify-center gap-1.5 transition-all duration-200 border-l border-[#ED1C24]/60 disabled:opacity-50"
          >
            <Send className="w-3 h-3 text-white" />
            <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Perspectives + Article Component (full center column) ---
const ArenaCenterColumn = ({
  headline,
  summary,
  perspectives,
  articleContent,
  articleLink,
}: {
  headline: string;
  summary: string;
  perspectives: ETCognifyInsight["perspectives"];
  articleContent: string;
  articleLink?: string;
}) => {
  const [activePerspective, setActivePerspective] =
    useState<Perspective | null>("Neutral");
  const [showArticleModal, setShowArticleModal] = useState(false);

  const icons: Record<Perspective, React.ReactNode> = {
    Neutral: <Landmark className="w-4 h-4" />,
    Shareholder: <Briefcase className="w-4 h-4" />,
    "Gig Worker": <Users className="w-4 h-4" />,
    FII: <TrendingUp className="w-4 h-4" />,
    Farmer: <Landmark className="w-4 h-4" />,
    "Short Seller": <TrendingDown className="w-4 h-4" />,
  };

  const perspectiveNames: Record<Perspective, string> = {
    Neutral: "Neutral",
    Shareholder: "Shareholder",
    "Gig Worker": "Gig Worker",
    FII: "FII",
    Farmer: "Farmer",
    "Short Seller": "Short Seller",
  };

  const articleParagraphs = articleContent
    ? articleContent.split("\n\n").filter((p) => p.trim())
    : [];

  return (
    <>
      <AnimatePresence>
        {showArticleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4"
          >
            <div
              className="absolute inset-0 bg-[#050505]/60 backdrop-blur-md"
              onClick={() => setShowArticleModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl md:max-w-4xl max-h-[85vh] bg-paper/95 backdrop-blur-3xl border border-white/20 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_100px_rgba(237,28,36,0.15)] ring-1 ring-[#ED1C24]/10"
            >
              {/* Modal Header */}
              <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0 z-20 gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <div className="w-0.5 sm:w-1 h-4 sm:h-5 bg-[#ED1C24]" />
                  <h3 className="text-[7px] sm:text-[8px] md:text-xs font-black uppercase tracking-tight text-[#ED1C24] whitespace-nowrap">
                    Intelligence
                  </h3>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {articleLink && (
                    <a
                      href={articleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#ED1C24]/10 text-white font-black uppercase text-[7px] sm:text-[8px] md:text-[9px] tracking-widest hover:bg-[#ED1C24] transition-colors rounded-lg border border-[#ED1C24]/30 whitespace-nowrap"
                    >
                      <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                      Read on ET
                    </a>
                  )}
                  <button
                    onClick={() => setShowArticleModal(false)}
                    className="p-1.5 sm:p-2 hover:bg-[#ED1C24]/20 rounded-full transition-colors text-white hover:text-[#ED1C24]"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 custom-scrollbar space-y-2 sm:space-y-3 relative z-10 custom-scrollbar">
                <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-white leading-[0.95] mb-2 sm:mb-3">
                  {headline}
                </h1>

                <div className="border-l-2 border-[#FFD700] pl-2 sm:pl-3 md:pl-4 mb-3 sm:mb-4 bg-[#FFD700]/5 py-2 sm:py-3 pr-2 sm:pr-3 rounded-r-xl">
                  <p className="text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-tight text-[#FFD700] mb-1">
                    Summary
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium leading-relaxed">
                    {summary}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3 pb-6">
                  {articleParagraphs.length > 0 ? (
                    articleParagraphs.map((para, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`leading-[1.8] sm:leading-[1.9] font-medium text-sm sm:text-base md:text-lg ${
                          i === 0
                            ? "text-white first-letter:text-4xl sm:first-letter:text-6xl first-letter:font-black first-letter:text-[#ED1C24] first-letter:float-left first-letter:leading-none first-letter:mr-2 sm:first-letter:mr-3 first-letter:mt-1"
                            : "text-white/70"
                        }`}
                      >
                        {para}
                      </motion.p>
                    ))
                  ) : (
                    <div className="text-center py-10 sm:py-20">
                      <Globe className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-white/10 mx-auto mb-3 sm:mb-4" />
                      <p className="text-base sm:text-lg md:text-xl text-white/40 font-medium">
                        Full article unavailable.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-full flex flex-col gap-1.5 sm:gap-2 overflow-hidden transition-all duration-500">
        {/* Header bar with bigger headline */}
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl p-1.5 sm:p-2 md:p-3 lg:p-4 shrink-0 relative overflow-hidden z-20">
          <UnifiedSquares />
          <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4 flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <div className="bg-[#ED1C24] text-white text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-black px-1.5 sm:px-2 md:px-2.5 py-0.25 sm:py-0.5 rounded-sm uppercase tracking-wide shrink-0">
                    Flash Report
                  </div>
                  <div className="h-[1px] w-8 sm:w-10 md:w-12 bg-white/20 hidden sm:block" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowArticleModal(true)}
                  className="bg-[#FFD700] hover:bg-[#ED1C24] hover:text-white text-black text-[7px] sm:text-[8px] md:text-[9px] font-black px-1.5 sm:px-2 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 uppercase tracking-tight transition-all duration-300 flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_0_20px_rgba(237,28,36,0.6)] rounded-sm whitespace-nowrap"
                >
                  <FileText className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-inherit" /> Read
                </button>
              </div>
              <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-black text-white leading-[0.95] tracking-tighter italic uppercase drop-shadow-md">
                {headline.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className={i % 2 === 0 ? "text-white" : "text-[#ED1C24]"}
                  >
                    {word}{" "}
                  </span>
                ))}
              </h2>
            </div>
          </div>
        </div>

        {/* Perspectives Container (Takes remaining height) */}
        <div className="flex-1 min-h-0 overflow-hidden bg-transparent border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl flex flex-col relative z-20">
          <UnifiedSquares />
          {/* Perspectives header label + buttons */}
          <div className="px-2 sm:px-3 pt-2 pb-1 border-b border-white/5 shrink-0 bg-white/[0.02] relative z-20">
            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/30 mb-1.5">Perspectives</p>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap overflow-x-auto custom-scrollbar pb-1">
            {(Object.keys(perspectives) as Perspective[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setActivePerspective(p);
                  savePerspectiveClick(p);
                }}
                className={`flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 md:px-2.5 py-0.5 sm:py-1 md:py-1.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-tight border transition-all whitespace-nowrap ${
                  activePerspective === p
                    ? "bg-[#ED1C24] text-white border-[#ED1C24] shadow-[0_5px_15px_rgba(237,28,36,0.4)]"
                    : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="[&>svg]:w-2 [&>svg]:h-2 sm:[&>svg]:w-2.5 sm:[&>svg]:h-2.5 md:[&>svg]:w-3 md:[&>svg]:h-3">
                  {icons[p]}
                </div>
                {perspectiveNames[p]}
              </button>
            ))}
            <button
              onClick={() => setActivePerspective(null)}
              className={`flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 md:px-2.5 py-0.5 sm:py-1 md:py-1.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-tight border transition-all whitespace-nowrap ${
                activePerspective === null
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-white/5 text-white/30 border-white/10 hover:text-white"
              }`}
            >
              <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> Clear
            </button>
            </div>{/* end flex buttons row */}
          </div>{/* end perspectives header */}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 sm:p-2 md:p-3 lg:p-4 relative z-20">
            <AnimatePresence mode="wait">
              {activePerspective ? (
                <motion.div
                  key={activePerspective}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 sm:space-y-4 md:space-y-5"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#ED1C24]/10 border border-[#ED1C24]/30 rounded-xl flex items-center justify-center shrink-0">
                      <div className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                        {icons[activePerspective]}
                      </div>
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[8px] text-white/30 font-black uppercase tracking-wide">
                        Viewing
                      </p>
                      <h3 className="text-sm sm:text-base font-black text-white italic uppercase tracking-tighter leading-none">
                        {activePerspective}
                      </h3>
                    </div>
                    <div className="ml-auto px-1.5 sm:px-2 py-0.5 bg-[#ED1C24]/10 border border-[#ED1C24]/20 rounded text-[7px] sm:text-[8px] font-black text-[#ED1C24] uppercase tracking-tight">
                      AI Lens
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 md:p-4 relative">
                    <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-[#FFD700] text-black text-[7px] sm:text-[8px] font-black uppercase tracking-tight rounded-sm shadow-lg">
                      {activePerspective} View
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-white/90 italic font-medium leading-relaxed">
                      "{perspectives[activePerspective]}"
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-3 hover:bg-white/[0.04] transition-colors">
                      <p className="text-[7px] sm:text-[8px] text-white/30 font-black uppercase tracking-tight mb-1.5 flex items-center gap-1">
                        <TrendingDown className="w-2 h-2 text-[#ED1C24]" /> Risk
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-white/70 font-medium leading-relaxed">
                        Market volatility driven by macroeconomic headwinds may impact this stakeholder's position disproportionately.
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-3 hover:bg-white/[0.04] transition-colors">
                      <p className="text-[7px] sm:text-[8px] text-white/30 font-black uppercase tracking-tight mb-1.5 flex items-center gap-1">
                        <TrendingUp className="w-2 h-2 text-emerald-400" /> Opportunity
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-white/70 font-medium leading-relaxed">
                        Structural tailwinds in this sector present a medium-term accumulation opportunity at corrected valuations.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[150px] gap-2"
                >
                  <Globe className="w-8 h-8 text-white/10" />
                  <p className="text-[11px] sm:text-xs text-white/30 text-center max-w-sm">
                    Select a perspective above to see the story through
                    different stakeholder lenses.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main Export ─────────────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<ETCognifyInsight | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [currentStory, setCurrentStory] = useState<StoryData | null>(null);
  const { startTracking } = useReadingTracker();

  const topics = [
    "Latest Indian Market Trends and Global Economic Impact",
    "The Rise of AI in Indian Fintech and Regulatory Challenges",
    "Green Energy Transition in India: Investment Opportunities and Risks",
    "Global Supply Chain Shifts: India's Role as a Manufacturing Hub",
    "The Impact of US Fed Rates on Emerging Market Equities",
    "Digital Rupee and the Future of Programmable Money in India",
  ];

  const fetchArticleContent = async (url: string) => {
    if (!url) return;
    try {
      const apiUrl = "http://localhost:8000";
      const res = await fetch(
        `${apiUrl}/api/article?url=${encodeURIComponent(url)}`,
      );
      const data = await res.json();
      setArticleContent(data.content || "");
    } catch {
      setArticleContent("");
    }
  };

  const fetchInsight = async (index: number, story?: StoryData) => {
    setCurrentStory(story || null);
    try {
      setLoading(true);
      const data = await generateInsight(topics[index], story?.link);
      setInsight(data);
    } catch (error: any) {
      const headline =
        story?.title ||
        "RBI Monetary Policy: Stability Amidst Global Volatility";
      const summary = story
        ? `[${story.tag}] ${story.impact} — This story was published at ${story.time} and is classified as ${story.impact} by our intelligence engine.`
        : "The Reserve Bank of India has maintained its benchmark interest rates, signaling a focus on inflation management while supporting domestic growth momentum.";
      const debateTopic =
        story?.title || "Is the RBI being overly cautious on inflation?";

      setInsight({
        headline,
        summary,
        perspectives: {
          Neutral:
            "This development represents a balanced signal in current market conditions. The macroeconomic implications are significant but the market has partially priced in this scenario.",
          Shareholder:
            "Banking stocks may see positive momentum as net interest margins remain protected, though NBFCs might face continued pressure on borrowing costs.",
          "Gig Worker":
            "Stable economic signals prevent immediate spikes in EMI for personal loans, providing some relief to urban workers and delivery partners.",
          FII: "Foreign investors view the consistency as a sign of macroeconomic stability, potentially increasing debt market inflows into Indian government bonds.",
          Farmer:
            "Rural demand remains sensitive to credit availability; the status quo ensures that agricultural loan rates don't rise before the crucial sowing season.",
          "Short Seller":
            "Risks remain in the mid-cap space where high valuations are predicated on future catalysts that are now being pushed further into the year.",
        },
        butterflyEffect: {
          trigger: story?.tag || "Market Signal",
          directImpact: story
            ? `${story.impact} detected in ${story.tag} sector. Analysis suggests downstream effects across related industries.`
            : "10-year G-Sec yields stabilize at 7.1%",
          personalRipples: [
            {
              label: "Portfolio Impact",
              value: story
                ? `Monitor ${story.tag} sector exposure`
                : "No immediate change",
              cost: "Dependent on allocation",
            },
            {
              label: "Watch Level",
              value: story?.impact || "Medium Impact",
              cost: story?.time || "Now",
            },
          ],
        },
        debate: {
          topic: debateTopic,
          bull: "Prudence now prevents a hard landing later. Maintaining high real rates is essential to anchor inflation expectations permanently.",
          bear: "High borrowing costs are stifling private capex. The central bank risks falling behind the curve as other major economies begin their pivot.",
        },
        newsDNA: {
          profile: "Adaptive Market Watcher",
          blindSpot: story
            ? `Focusing only on this headline may cause you to miss adjacent sector movements triggered by ${story.tag} dynamics.`
            : "Impact of global 'higher for longer' rates on domestic tech valuations.",
        },
      });
    } finally {
      setLoading(false);
    }

    // Fetch article content separately
    if (story?.link) {
      fetchArticleContent(story.link);
    }
  };

  useEffect(() => {
    const story = location.state?.story as StoryData | undefined;
    fetchInsight(0, story);
    if (story) startTracking(story.id, story.title, story.tag);
  }, []);

  return (
    <AppShell
      subtitle="Intelligence OS v4.0"
      title="Arena"
      contextualNavItems={[
        { to: "/arena", label: "Arena", icon: TrendingUp, active: true },
      ]}
    >
      <Seismograph />

      <main className="flex-1 min-h-0 p-2 sm:p-3 md:p-4 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 overflow-hidden">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-12 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm rounded-lg border border-white/5 h-full"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-[#ED1C24] animate-spin" />
                  <div className="absolute inset-0 bg-[#ED1C24]/20 blur-xl rounded-full animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">
                    Synthesizing Intelligence
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                    Analyzing Global Market Ripples
                  </p>
                </div>
              </motion.div>
            ) : (
              insight && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-2 lg:gap-2.5 h-full"
                >
                  {/* Left Column - RAG Chatbot */}
                  <div className="col-span-1 lg:col-span-3 h-full min-h-[200px] lg:min-h-0">
                    <RAGChatbot
                      storyTitle={currentStory?.title || insight.headline}
                      articleLink={currentStory?.link}
                    />
                  </div>

                  {/* Center Column - Article / Perspectives tabs */}
                  <div className="col-span-1 lg:col-span-6 h-full min-h-[250px] lg:min-h-0 overflow-hidden">
                    <ArenaCenterColumn
                      headline={insight.headline}
                      summary={insight.summary}
                      perspectives={insight.perspectives}
                      articleContent={articleContent}
                      articleLink={currentStory?.link}
                    />
                  </div>

                  {/* Right Column - CTA & Butterfly Effect */}
                  <div className="col-span-1 lg:col-span-3 flex flex-col gap-1.5 sm:gap-2 h-full min-h-0">
                    {/* Nexora Debate System */}
                    <div className="relative group rounded-xl overflow-hidden z-20 flex-1 min-h-0">
                      <NexoraCTA topic={insight.headline} />
                    </div>

                    {/* Butterfly Effect */}
                    <div className="bg-transparent border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl p-1 sm:p-2 md:p-2.5 lg:p-3 flex flex-col relative z-20 group overflow-hidden flex-1 min-h-0">
                      <UnifiedSquares />
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 relative z-10 gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <Zap className="text-[#FFD700] w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                          <h3 className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-white italic uppercase tracking-tight">
                            Butterfly
                          </h3>
                        </div>
                        <div className="px-1.5 py-0.25 bg-white/5 border border-white/10 rounded-sm">
                          <span className="text-[6px] sm:text-[7px] font-black text-[#FFD700] uppercase tracking-tight">
                            {insight.butterflyEffect.trigger}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 overflow-y-auto pr-1.5 sm:pr-2 md:pr-3 custom-scrollbar relative z-10 pl-2 sm:pl-3 md:pl-4 border-l border-white/10 ml-1 sm:ml-1.5 border-dashed py-1">
                        {/* Origin Node / Direct Impact */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="relative group/node"
                        >
                          <div className="absolute -left-[20px] top-2 w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.8)] z-20 flex items-center justify-center">
                            <div className="w-0.5 h-0.5 bg-black rounded-full animate-ping" />
                          </div>
                          <div className="absolute -left-[18px] top-3 w-4 h-px bg-[#FFD700]/50" />
                          <div className="bg-black/50 border border-[#FFD700]/30 p-2 rounded-lg relative overflow-hidden group-hover/node:bg-[#FFD700]/5 transition-colors">
                            <div className="absolute top-0 right-0 px-1 py-0.25 bg-[#FFD700]/10 border-b border-l border-[#FFD700]/20 text-[6px] text-[#FFD700] font-black uppercase tracking-tight">
                              GZ
                            </div>
                            <h4 className="text-white/40 font-black uppercase text-[6px] tracking-tight mb-1">
                              Direct Impact
                            </h4>
                            <p className="text-white/90 text-[10px] sm:text-xs font-medium leading-relaxed">
                              {insight.butterflyEffect.directImpact}
                            </p>
                          </div>
                        </motion.div>

                        {/* Ripples */}
                        {insight.butterflyEffect.personalRipples.map(
                          (ripple, idx) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + idx * 0.1 }}
                              key={idx}
                              className="relative group/node"
                            >
                              <div className="absolute -left-[16px] top-2 w-1.5 h-1.5 rounded-full border border-white/50 bg-black z-20 group-hover/node:bg-white group-hover/node:border-white group-hover/node:scale-125 transition-all duration-300" />
                              <div className="absolute -left-[15px] top-3 w-4 h-px bg-white/20 group-hover/node:bg-white/50 group-hover/node:w-6 transition-all duration-300" />

                              <div className="bg-white/5 border border-white/10 p-2 rounded-lg group-hover/node:bg-white/10 transition-all group-hover/node:translate-x-2 group-hover/node:border-white/30">
                                <div className="flex justify-between items-start mb-1 cursor-default gap-1">
                                  <span className="text-[6px] sm:text-[7px] font-black uppercase text-emerald-400 tracking-tight bg-emerald-400/10 px-1 py-0.25 rounded-sm whitespace-nowrap">
                                    R{idx + 1}
                                  </span>
                                  {ripple.cost && (
                                    <span className="text-[7px] sm:text-[8px] font-black text-[#FFD700] bg-[#FFD700]/10 px-1 py-0.25 rounded-sm border border-[#FFD700]/20 whitespace-nowrap">
                                      {ripple.cost}
                                    </span>
                                  )}
                                </div>
                                <p className="text-white/70 text-[10px] sm:text-[11px] font-medium leading-relaxed line-clamp-2">
                                  {ripple.value}
                                </p>
                              </div>
                            </motion.div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(237,28,36,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(237,28,36,0.5); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </AppShell>
  );
}
