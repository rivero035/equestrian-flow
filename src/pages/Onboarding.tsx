import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSearchCenters } from "@/hooks/use-center";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, School, User, Search } from "lucide-react";
import { toast } from "sonner";
import equioLogo from "@/assets/equio-logo.png";

type Step = "role" | "manager-setup" | "student-search" | "done";

export default function Onboarding() {
  const { user, refreshAuth } = useAuth();
  const [step, setStep] = useState<Step>("role");
  const [loading, setLoading] = useState(false);
  const [centerName, setCenterName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: centers = [], isLoading: searching } = useSearchCenters(searchQuery);

  const selectRole = async (role: "manager" | "student") => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role });
      if (error) throw error;

      if (role === "manager") {
        setStep("manager-setup");
      } else {
        setStep("student-search");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al asignar rol");
    } finally {
      setLoading(false);
    }
  };

  const createCenter = async () => {
    if (!user || !centerName.trim()) return;
    setLoading(true);
    try {
      // Check if trigger already created a center
      const { data: existing } = await supabase
        .from("centers")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("centers")
          .update({ name: centerName.trim() })
          .eq("id", existing.id);
      } else {
        const { error } = await supabase
          .from("centers")
          .insert({ owner_id: user.id, name: centerName.trim() });
        if (error) throw error;
      }

      await refreshAuth();
    } catch (err: any) {
      toast.error(err.message || "Error al crear centro");
    } finally {
      setLoading(false);
    }
  };

  const joinCenter = async (centerId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("students")
        .insert({
          user_id: user.id,
          center_id: centerId,
          name: user.email?.split("@")[0] || "Alumno",
          status: "approved" as const,
        });
      if (error) throw error;

      await refreshAuth();
    } catch (err: any) {
      toast.error(err.message || "Error al unirse al centro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={equioLogo} alt="equio logo" width={56} height={56} className="mx-auto" />
          <h1 className="text-2xl font-display mt-3 text-foreground">Bienvenido a equio</h1>
        </div>

        {step === "role" && (
          <div className="space-y-3">
            <p className="text-center text-muted-foreground text-sm">¿Cómo vas a usar equio?</p>
            <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => !loading && selectRole("manager")}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <School className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Soy un centro hípico</p>
                  <p className="text-xs text-muted-foreground">Gestiona caballos, alumnos y reservas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => !loading && selectRole("student")}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Soy alumno</p>
                  <p className="text-xs text-muted-foreground">Busca tu centro y reserva clases</p>
                </div>
              </CardContent>
            </Card>
            {loading && <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
          </div>
        )}

        {step === "manager-setup" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">¿Cómo se llama tu centro?</p>
              <Input
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="Ej: Club Hípico El Robledal"
              />
              <Button className="w-full" onClick={createCenter} disabled={!centerName.trim() || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "student-search" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Busca tu centro hípico</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre del centro..."
                  className="pl-9"
                />
              </div>
              {searching && <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
              <div className="space-y-2 max-h-64 overflow-auto">
                {centers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => !loading && joinCenter(c.id)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 transition-colors flex items-center gap-3"
                    disabled={loading}
                  >
                    {c.logo_url ? (
                      <img src={c.logo_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                        <School className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium text-foreground text-sm">{c.name}</span>
                  </button>
                ))}
                {searchQuery.length >= 2 && !searching && centers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No se encontraron centros</p>
                )}
              </div>
              {loading && <div className="flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
