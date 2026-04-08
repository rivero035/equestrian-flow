import { useState } from "react";
import { useStudents, useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import { useBookingsByDate } from "@/hooks/use-bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User, History, Plus, Loader2, Pencil } from "lucide-react";
import { format } from "date-fns";

export default function Students() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: students = [], isLoading } = useStudents();
  const { data: bookings = [] } = useBookingsByDate(today);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editStudent, setEditStudent] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", credits: 0 });

  const student = students.find((s) => s.id === selectedStudent);
  const studentBookings = student ? bookings.filter((b) => b.student_id === student.id) : [];

  const editingStudent = students.find((s) => s.id === editStudent);

  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", credits: 0 });
    setShowCreate(true);
  };

  const openEdit = (s: typeof students[0]) => {
    setForm({ name: s.name, email: s.email || "", phone: s.phone || "", credits: s.credits });
    setEditStudent(s.id);
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createStudent.mutate(
      { name: form.name, email: form.email || undefined, phone: form.phone || undefined, credits: form.credits },
      { onSuccess: () => setShowCreate(false) }
    );
  };

  const handleUpdate = () => {
    if (!editStudent || !form.name.trim()) return;
    updateStudent.mutate(
      { id: editStudent, name: form.name, email: form.email || null, phone: form.phone || null, credits: form.credits },
      { onSuccess: () => setEditStudent(null) }
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground">Alumnos</h1>
          <p className="text-muted-foreground mt-1">Perfiles, créditos e historial</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo alumno</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((s) => (
          <Card key={s.id} className="cursor-pointer hover:border-primary/30 transition-colors animate-fade-in" onClick={() => setSelectedStudent(s.id)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.phone || s.email || "Sin contacto"}</p>
                  </div>
                </div>
                <Badge variant={s.credits > 0 ? "default" : "secondary"}>{s.credits} clases</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student detail dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{student?.name}</DialogTitle>
            <DialogDescription>{student?.email} · {student?.phone}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Clases disponibles</p>
              <p className="text-xl font-semibold text-foreground">{student?.credits}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <History className="h-3 w-3" /> Reservas de hoy
              </p>
              {studentBookings.length > 0 ? (
                <div className="space-y-2">
                  {studentBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                      <span className="text-foreground">{b.time} · {b.horses?.name}</span>
                      <Badge variant={b.paid ? "default" : "secondary"} className="text-[10px]">
                        {b.paid ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin reservas hoy</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedStudent(null); if (student) openEdit(student); }}>
              <Pencil className="h-3 w-3 mr-1" />Editar
            </Button>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit dialog */}
      <Dialog open={showCreate || !!editStudent} onOpenChange={() => { setShowCreate(false); setEditStudent(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editStudent ? "Editar alumno" : "Nuevo alumno"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@ejemplo.com" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+34 600 000 000" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Créditos iniciales</label>
              <Input type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 0 })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditStudent(null); }}>Cancelar</Button>
            <Button onClick={editStudent ? handleUpdate : handleCreate} disabled={createStudent.isPending || updateStudent.isPending}>
              {(createStudent.isPending || updateStudent.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editStudent ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
