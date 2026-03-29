import { Brain, Archive, BookOpen, RotateCcw, Mic, MessageSquare } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useApiHealth } from "@/hooks/useApiHealth";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Vault", path: "/", icon: Archive },
  { title: "Study", path: "/study", icon: BookOpen },
  { title: "Review", path: "/review", icon: RotateCcw },
  { title: "Voice", path: "/voice", icon: Mic },
  { title: "Agent", path: "/agent", icon: MessageSquare },
];

export function AppSidebar() {
  const location = useLocation();
  const apiOnline = useApiHealth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <Brain className="w-6 h-6 text-primary shrink-0" />
        <span className="text-primary font-semibold text-sm hidden lg:block">SecondBrain</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors relative",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r" />
              )}
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* API Status */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full shrink-0", apiOnline ? "bg-forest" : "bg-destructive")} />
          <span className="text-[10px] text-muted-foreground hidden lg:block">
            API: {apiOnline ? "connected" : "offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}
