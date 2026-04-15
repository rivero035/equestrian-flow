import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCenter } from "@/hooks/use-center";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: center } = useCenter();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 gap-3">
            <SidebarTrigger className="mr-2" />
            {center?.logo_url && (
              <img src={center.logo_url} alt="" className="w-7 h-7 rounded-md object-cover" />
            )}
            <span className="text-sm font-medium text-foreground">{center?.name || ""}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </header>
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
