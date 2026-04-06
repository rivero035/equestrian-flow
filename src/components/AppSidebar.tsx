import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  CreditCard,
  Clock,
  Hexagon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-6">
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
      </SidebarContent>
    </Sidebar>
  );
}
