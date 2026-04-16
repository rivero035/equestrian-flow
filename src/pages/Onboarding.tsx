import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSearchCenters } from "@/hooks/use-center";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, School, PlusCircle, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import equioLogo from "@/assets/equio-logo.png";

type ManagerStep = "choose" | "create" | "join";
type Step = "manager" | "student-search" | "done";

export default function Onboarding() {
  const { user, role, refreshAuth } = useAuth();
  const [step, setStep] = useState<Step>(role === "student" ? "student-search" : "manager");
  const [managerStep, setManagerStep] = useState<ManagerStep>("choose");
  const [loading, setLoading] = useState(false);
  const [centerName, setCenterName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: centers = [], isLoading: searching } = useSearchCenters(searchQuery);

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

      let centerId: string;
      if (existing) {
        await supabase.from("centers").update({ name: centerName.trim() }).eq("id", existing.id);
        centerId = existing.id;
      } else {
        const { data, error } = await supabase
          .from("centers")
          .insert({ owner_id: user.id, name: centerName.trim() })
          .select("id")
          .single();
        if (error) throw error;
        centerId = data.id;
      }

      // Upload logo if provided
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${user.id}/logo.${ext}`;
        await supabase.storage.from("center-logos").upload(path, logoFile, { upsert: true });
        const { data: urlData } = supabase.storage.from("center-logos").getPublicUrl(path);
        await supabase.from("centers").update({ logo_url: urlData.publicUrl }).eq("id", centerId);
      }

      await refreshAuth();
    } catch (err: any) {
      toast.error(err.message || "Error al crear centro");
    } finally {
      setLoading(false);
    }
  };

  const joinCenterAsManager = async (centerId: string) => {
    // For now, managers can only own one center. This joins by setting owner.
    // Future: support multiple managers per center
    toast.info("Por ahora, solo puedes crear tu propio centro.");
  };

  const joinCenter = async (centerId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Alumno";
      const { error } = await supabase
        .from("students")
        .insert({
          user_id: user.id,
          center_id: centerId,
          name: fullName,
          email: user.email || null,
          phone: user.user_metadata?.phone || null,
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

  const isStudent = role === "student";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={equioLogo} alt="equio logo" width={56} height={56} className="mx-auto" />
          <h1 className="text-2xl font-display mt-3 text-foreground">Bienvenido a equio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isStudent ? "Busca tu centro hípico para empezar" : "Configura tu centro hípico"}
          </p>
        </div>

        {/* Manager flow */}
        {step === "manager" && managerStep === "choose" && (
          <div className="space-y-3">
            <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setManagerStep("create")}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Crear centro nuevo</p>
                  <p className="text-xs text-muted-foreground">Registra tu picadero en equio</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setManagerStep("join")}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Search className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Unirme a un centro existente</p>
                  <p className="text-xs text-muted-foreground">Busca y únete como encargado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "manager" && managerStep === "create" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Datos de tu centro</p>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nombre del centro</label>
                <Input
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="Ej: Club Hípico El Robledal"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Logo / Escudo (opcional)</label>
                <div className="mt-1 flex items-center gap-3">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <label className="text-sm text-primary cursor-pointer hover:underline">
                    {logoFile ? "Cambiar" : "Subir imagen"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setManagerStep("choose")} className="flex-1">Atrás</Button>
                <Button className="flex-1" onClick={createCenter} disabled={!centerName.trim() || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear centro"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "manager" && managerStep === "join" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Busca el centro al que quieres unirte</p>
              <CenterSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                centers={centers}
                searching={searching}
                loading={loading}
                onSelect={joinCenterAsManager}
              />
              <Button variant="outline" onClick={() => setManagerStep("choose")} className="w-full">Atrás</Button>
            </CardContent>
          </Card>
        )}

        {/* Student flow */}
        {step === "student-search" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Busca tu centro hípico</p>
              <CenterSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                centers={centers}
                searching={searching}
                loading={loading}
                onSelect={joinCenter}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CenterSearch({
  searchQuery,
  setSearchQuery,
  centers,
  searching,
  loading,
  onSelect,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  centers: { id: string; name: string; logo_url: string | null }[];
  searching: boolean;
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <>
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
            onClick={() => !loading && onSelect(c.id)}
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
    </>
  );
}
