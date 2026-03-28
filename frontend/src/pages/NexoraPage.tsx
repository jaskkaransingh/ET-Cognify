import { useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, UserCircle2 } from "lucide-react";
import NexoraDebate from "../components/NexoraDebate";
import AppShell from "../components/AppShell";

export default function NexoraPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as { topic?: string; language?: string }) || {};

  return (
    <AppShell
      subtitle="Debate Arena Phase 2"
      title="Live Debate"
      contextualNavItems={[
        {
          to: "/arena",
          label: "Arena",
          icon: TrendingUp,
          onClick: () => navigate("/arena"),
        },
        { to: "/nexora", label: "Debate", icon: UserCircle2, active: true },
      ]}
      contentClassName="flex-1 min-h-0 p-2 sm:p-3 md:p-4 lg:p-6 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-0 pointer-events-none" />
      <div className="flex-1 min-h-0 z-10 relative lg:overflow-hidden">
        <NexoraDebate
          topic={
            state.topic || "Impact of Artificial Intelligence on Global Markets"
          }
          initialLanguage={state.language}
          autoStart={true}
        />
      </div>
    </AppShell>
  );
}
