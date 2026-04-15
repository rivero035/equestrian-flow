import { useState, useRef } from "react";
import { useCenter, useUpdateCenter, useUploadLogo } from "@/hooks/use-center";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, School } from "lucide-react";

export default function CenterSettings() {
  const { data: center, isLoading } = useCenter();
  const updateCenter = useUpdateCenter();
  const uploadLogo = useUploadLogo();
  const [name, setName] = useState("");
  const [initialized, setInitialized] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (center && !initialized) {
    setName(center.name);
    setInitialized(true);
  }

  const handleSaveName = () => {
    if (!center || !name.trim()) return;
    updateCenter.mutate({ id: center.id, name: name.trim() });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !center) return;
    uploadLogo.mutate({ centerId: center.id, file });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Ajustes del centro</h1>
        <p className="text-muted-foreground mt-1">Personaliza tu centro hípico</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Logo / Escudo</label>
            <div className="mt-2 flex items-center gap-4">
              {center?.logo_url ? (
                <img src={center.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
                  <School className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploadLogo.isPending}>
                  {uploadLogo.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Subir logo
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG. Máx 2MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Nombre del centro</label>
            <div className="flex gap-2 mt-1">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <Button onClick={handleSaveName} disabled={updateCenter.isPending || name === center?.name}>
                {updateCenter.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
