import { useState } from "react";
import { students, todayBookings } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, History } from "lucide-react";

export default function Students() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const student = students.find((s) => s.id === selectedStudent);
  const studentBookings = student
    ? todayBookings.filter((b) => b.studentId === student.id)
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Alumnos</h1>
        <p className="text-muted-foreground mt-1">Perfiles, créditos e historial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((s) => (
          <Card
            key={s.id}
            className="cursor-pointer hover:border-primary/30 transition-colors animate-fade-in"
            onClick={() => setSelectedStudent(s.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.phone}</p>
                  </div>
                </div>
                <Badge variant={s.credits > 0 ? "default" : "secondary"}>
                  {s.credits} clases disponibles
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <History className="h-3 w-3" /> Reservas recientes
              </p>
              {studentBookings.length > 0 ? (
                <div className="space-y-2">
                  {studentBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                      <span className="text-foreground">{b.time} · {b.horseName}</span>
                      <Badge variant={b.paid ? "default" : "secondary"} className="text-[10px]">
                        {b.paid ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin reservas recientes</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
