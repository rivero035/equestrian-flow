import { useAuth } from "@/hooks/use-auth";
import { useCenter } from "@/hooks/use-center";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { CalendarPlus, LayoutDashboard, LogOut } from "lucide-react";
import equioLogo from "@/assets/equio-logo.png";

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const { signOut, studentRecord } = useAuth();
  const { data: center } = useCenter();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 flex items-center border-b border-border px-4 gap-4">
        <div className="flex items-center gap-2">
          {center?.logo_url ? (
            <img src={center.logo_url} alt="" className="w-7 h-7 rounded-md object-cover" />
          ) : (
            <img src={equioLogo} alt="equio" width={28} height={28} />
          )}
          <span className="font-display text-sm text-foreground">{center?.name || "equio"}</span>
        </div>
        <nav className="flex items-center gap-1 ml-4">
          <NavLink to="/student" end className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted/60" activeClassName="bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4 mr-1.5 inline" />Inicio
          </NavLink>
          <NavLink to="/student/reservas" className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted/60" activeClassName="bg-primary text-primary-foreground">
            <CalendarPlus className="h-4 w-4 mr-1.5 inline" />Reservas
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">{studentRecord?.name}</span>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
