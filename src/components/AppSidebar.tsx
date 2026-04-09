import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  CreditCard,
  Clock,
  Hexagon,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Panel Principal", url: "/", icon: LayoutDashboard },
  { title: "Reservas", url: "/reservas", icon: CalendarPlus },
  { title: "Caballos", url: "/caballos", icon: Hexagon },
  { title: "Alumnos", url: "/alumnos", icon: Users },
  { title: "Créditos", url: "/creditos", icon: CreditCard },
  { title: "Lista de Espera", url: "/espera", icon: Clock },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-6 flex flex-col h-full">
        <div className={`px-4 mb-8 ${collapsed ? "px-2" : ""}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏇</span>
            {!collapsed && (
              <div>
                <h1 className="font-display text-lg leading-tight text-foreground">
                  Centro Ecuestre
                </h1>
                <p className="text-xs text-muted-foreground">Gestión inteligente</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/60 rounded-lg px-3 py-2.5 text-sm"
                      activeClassName="bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          {!collapsed && user && (
            <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="w-full justify-start text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && "Cerrar sesión"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
