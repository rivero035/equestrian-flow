import { useState } from "react";
import { useWaitlist, useAddToWaitlist, useRemoveFromWaitlist } from "@/hooks/use-waitlist";
import { useStudents } from "@/hooks/use-students";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useHorses } from "@/hooks/use-horses";
import { timeSlots } from "@/data/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, ArrowRight, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Waitlist() {
  const { data: entries = [], isLoading } = useWaitlist();
  const { data: students = [] } = useStudents();
  const { data: horses = [] } = useHorses();
  const addToWaitlist = useAddToWaitlist();
  const removeFromWaitlist = useRemoveFromWaitlist();
  const createBooking = useCreateBooking();

  const [showAdd, setShowAdd] = useState(false);
  const [assignEntry, setAssignEntry] = useState<typeof entries[0] | null>(null);
  const [form, setForm] = useState({ student_id: "", date: "", time: "" });
  const [assignHorse, setAssignHorse] = useState("");

  const handleAdd = () => {
    if (!form.student_id || !form.date || !form.time) return;
    addToWaitlist.mutate(form, { onSuccess: () => { setShowAdd(false); setForm({ student_id: "", date: "", time: "" }); } });
  };

  const handleAssign = () => {
    if (!assignEntry || !assignHorse) return;
    createBooking.mutate(
      { student_id: assignEntry.student_id, horse_id: assignHorse, date: assignEntry.date, time: assignEntry.time },
      {
        onSuccess: () => {
          removeFromWaitlist.mutate(assignEntry.id);
          setAssignEntry(null);
          setAssignHorse("");
          toast.success("Alumno asignado desde lista de espera");
        },
      }
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const availableHorses = horses.filter((h) => h.status === "available");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground">Lista de Espera</h1>
          <p className="text-muted-foreground mt-1">Alumnos que esperan un hueco — reasignación rápida</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Añadir</Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay alumnos en lista de espera</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="animate-fade-in">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{entry.position}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{entry.students?.name || "Alumno"}</p>
                    <p className="text-xs text-muted-foreground">
                      Esperando hueco el {entry.date} a las {entry.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Posición #{entry.position}</Badge>
                  <Button size="sm" onClick={() => setAssignEntry(entry)}>
                    Asignar <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeFromWaitlist.mutate(entry.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">¿Cómo funciona?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Cuando una clase está llena, el alumno puede unirse a la lista de espera</li>
            <li>Si se libera un hueco, puedes reasignar con un clic</li>
            <li>La reserva consume 1 crédito del alumno</li>
          </ul>
        </CardContent>
      </Card>

      {/* Add to waitlist dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Añadir a lista de espera</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Alumno</label>
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar alumno" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Fecha</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Hora</label>
              <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar hora" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={addToWaitlist.isPending}>
              {addToWaitlist.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Añadir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign from waitlist dialog */}
      <Dialog open={!!assignEntry} onOpenChange={() => setAssignEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Asignar hueco</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Asignar a {assignEntry?.students?.name} el {assignEntry?.date} a las {assignEntry?.time}
          </p>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Caballo</label>
            <Select value={assignHorse} onValueChange={setAssignHorse}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar caballo" /></SelectTrigger>
              <SelectContent>
                {availableHorses.map((h) => <SelectItem key={h.id} value={h.id}>{h.image} {h.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignEntry(null)}>Cancelar</Button>
            <Button onClick={handleAssign} disabled={!assignHorse || createBooking.isPending}>
              {createBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar asignación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
