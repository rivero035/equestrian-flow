import { useState } from "react";
import { useHorses, useCreateHorse, useUpdateHorse, useDeleteHorse } from "@/hooks/use-horses";
import { useBookingsByDate } from "@/hooks/use-bookings";
import { timeSlots } from "@/data/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Horse } from "@/hooks/use-horses";

const statusLabels: Record<Horse["status"], string> = {
  available: "Activo",
  resting: "Descanso",
  injured: "Lesionado",
};

const statusColors: Record<Horse["status"], "default" | "secondary" | "destructive"> = {
  available: "default",
  resting: "secondary",
  injured: "destructive",
};

export default function Horses() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: horses = [], isLoading } = useHorses();
  const { data: bookings = [] } = useBookingsByDate(today);
  const createHorse = useCreateHorse();
  const updateHorse = useUpdateHorse();
  const deleteHorse = useDeleteHorse();

  const [showCreate, setShowCreate] = useState(false);
  const [editHorse, setEditHorse] = useState<Horse | null>(null);
  const [form, setForm] = useState({ name: "", level: "principiante" as Horse["level"], image: "🐴", max_daily_hours: 4 });

  const openCreate = () => {
    setForm({ name: "", level: "principiante", image: "🐴", max_daily_hours: 4 });
    setShowCreate(true);
  };

  const openEdit = (h: Horse) => {
    setForm({ name: h.name, level: h.level, image: h.image, max_daily_hours: h.max_daily_hours });
    setEditHorse(h);
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createHorse.mutate(form, { onSuccess: () => setShowCreate(false) });
  };

  const handleUpdate = () => {
    if (!editHorse || !form.name.trim()) return;
    updateHorse.mutate({ id: editHorse.id, name: form.name, level: form.level, image: form.image, max_daily_hours: form.max_daily_hours }, {
      onSuccess: () => setEditHorse(null),
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground">Caballos</h1>
          <p className="text-muted-foreground mt-1">Estado y disponibilidad del día</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo caballo</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {horses.map((horse) => {
          const horseBookings = bookings.filter((b) => b.horse_id === horse.id);
          const usagePct = Math.round((horseBookings.length / horse.max_daily_hours) * 100);

          return (
            <Card key={horse.id} className="animate-fade-in">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{horse.image}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{horse.name}</h3>
                      <Badge variant="secondary" className="text-[10px] mt-1">{horse.level}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(horse)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteHorse.mutate(horse.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={statusColors[horse.status]}>{statusLabels[horse.status]}</Badge>
                  <Select
                    value={horse.status}
                    onValueChange={(v) => updateHorse.mutate({ id: horse.id, status: v as Horse["status"] })}
                  >
                    <SelectTrigger className="h-7 w-auto text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Activo</SelectItem>
                      <SelectItem value="resting">Descanso</SelectItem>
                      <SelectItem value="injured">Lesionado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {horse.status === "available" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Ocupación hoy</span>
                        <span>{horseBookings.length}/{horse.max_daily_hours}h máx</span>
                      </div>
                      <Progress value={Math.min(usagePct, 100)} className="h-1.5" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {timeSlots.map((time) => {
                        const booked = horseBookings.find((b) => b.time === time);
                        return (
                          <span
                            key={time}
                            className={`text-[11px] px-2 py-1 rounded-md border ${
                              booked
                                ? "bg-primary/10 border-primary/20 text-foreground"
                                : "border-dashed border-border text-muted-foreground"
                            }`}
                          >
                            {time} {booked ? `· ${booked.students?.name?.split(" ")[0] || ""}` : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showCreate || !!editHorse} onOpenChange={() => { setShowCreate(false); setEditHorse(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editHorse ? "Editar caballo" : "Nuevo caballo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del caballo" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nivel</label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as Horse["level"] })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="principiante">Principiante</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Máx. horas diarias</label>
              <Input type="number" value={form.max_daily_hours} onChange={(e) => setForm({ ...form, max_daily_hours: parseInt(e.target.value) || 4 })} className="mt-1" min={1} max={12} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emoji</label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditHorse(null); }}>Cancelar</Button>
            <Button onClick={editHorse ? handleUpdate : handleCreate} disabled={createHorse.isPending || updateHorse.isPending}>
              {(createHorse.isPending || updateHorse.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editHorse ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
