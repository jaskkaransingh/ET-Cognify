import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Radio,
  LogOut,
  LayoutGrid,
  Dna,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

interface AppShellProps {
  children: ReactNode;
  subtitle: string;
  title?: string;
  actions?: ReactNode;
  contentClassName?: string;
  onBeforeLogout?: () => void | Promise<void>;
  contextualNavItems?: Array<{
    to: string;
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    active?: boolean;
  }>;
}

const LEFT_NAV_ITEM = { to: "/", label: "Feed", icon: LayoutGrid };
const RIGHT_NAV_ITEMS = [{ to: "/dna", label: "DNA", icon: Dna }];

export default function AppShell({
  children,
  subtitle,
  title = "ETCOGNIFY",
  actions,
  contentClassName = "flex-1 min-h-0 flex flex-col overflow-hidden",
  onBeforeLogout,
  contextualNavItems = [],
}: AppShellProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    if (onBeforeLogout) {
      await onBeforeLogout();
    }
    await signOut(auth);
    navigate("/auth");
  };

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Operative";
  const initials = displayName[0]?.toUpperCase() || "O";

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-[7px] sm:text-[8.5px] md:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] md:tracking-[0.22em] whitespace-nowrap transition-all ${
      isActive
        ? "border-[#ED1C24] bg-[#ED1C24] text-white shadow-[0_0_20px_rgba(237,28,36,0.25)]"
        : "border-[#ED1C24]/45 bg-white/[0.03] text-white/65 hover:text-white hover:border-[#ED1C24]"
    }`;

  const utilityItemClass =
    "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-[7px] sm:text-[8.5px] md:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] md:tracking-[0.22em] whitespace-nowrap transition-all";

  const profileCard = (
    <div className="hidden lg:flex items-center gap-2 shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1">
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt="avatar"
          className="w-6 h-6 rounded-md border border-white/20 object-cover"
        />
      ) : (
        <div className="w-6 h-6 rounded-md border border-[#ED1C24]/50 bg-[#ED1C24]/20 flex items-center justify-center">
          <span className="text-[10px] font-black text-white">{initials}</span>
        </div>
      )}
      <div className="min-w-0 max-w-[140px]">
        <p className="text-[7px] font-black uppercase tracking-[0.22em] text-white/30">
          {title}
        </p>
        <p className="text-[10px] font-bold text-white truncate">
          {displayName}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-[#ED1C24]/45 text-[7px] font-black uppercase tracking-[0.18em] text-white/65 hover:text-white hover:border-[#ED1C24] hover:bg-[#ED1C24]/10 transition-all shrink-0"
      >
        <LogOut className="w-3 h-3" />
        Exit
      </button>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-transparent text-white font-sans selection:bg-[#ED1C24] selection:text-white flex flex-col relative">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="px-2 sm:px-4 md:px-5 py-2 sm:py-2.5 flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 min-h-fit">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 sm:gap-3 text-left shrink-0 mr-0 xl:mr-3"
          >
            <div className="relative shrink-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#ED1C24] flex items-center justify-center shadow-[0_0_16px_rgba(237,28,36,0.45)] transform -skew-x-12">
                <Radio className="text-white w-4 h-4 sm:w-5 sm:h-5 animate-pulse skew-x-12" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tighter text-white italic leading-none">
                ET<span className="text-[#ED1C24]">COGNIFY</span>
              </h1>
              <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] sm:tracking-[0.28em] text-white/35 truncate">
                {subtitle}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto custom-scrollbar max-w-full order-3 xl:order-none basis-full xl:basis-auto pb-1">
            <NavLink
              to={LEFT_NAV_ITEM.to}
              className={({ isActive }) => navItemClass(isActive)}
            >
              <LEFT_NAV_ITEM.icon className="w-3 h-3" />
              {LEFT_NAV_ITEM.label}
            </NavLink>

            {contextualNavItems.length > 0 ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {contextualNavItems.map(
                  ({ to, label, icon: Icon, onClick, active }) => (
                    <div
                      key={`${to}-${label}`}
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <ChevronRight className="w-3 h-3 text-white/35" />
                      {onClick ? (
                        <button
                          type="button"
                          onClick={onClick}
                          className={navItemClass(Boolean(active))}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </button>
                      ) : (
                        <NavLink
                          to={to}
                          className={({ isActive }) =>
                            navItemClass(active ?? isActive)
                          }
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </NavLink>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto max-w-full order-2 xl:order-none">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {RIGHT_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={`${to}-${label}`}
                  to={to}
                  className={({ isActive }) =>
                    `${utilityItemClass} ${
                      isActive
                        ? "border-[#FFD700] bg-[#FFD700]/12 text-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.18)]"
                        : "border-[#FFD700]/40 bg-[#FFD700]/[0.04] text-[#FFD700]/85 hover:text-[#FFD700] hover:border-[#FFD700]"
                    }`
                  }
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </NavLink>
              ))}
              {actions ? (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {actions}
                </div>
              ) : null}
            </div>

            {profileCard}
          </div>

          <button
            onClick={handleLogout}
            className="lg:hidden flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#ED1C24]/45 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/65 hover:text-white hover:border-[#ED1C24] hover:bg-[#ED1C24]/10 transition-all shrink-0"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </header>

      <div className={`${contentClassName}`}>{children}</div>
    </div>
  );
}
