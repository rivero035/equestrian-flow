import { useState } from "react";
import { useHorses } from "@/hooks/use-horses";
import { useStudents } from "@/hooks/use-students";
import { useBookingsByDate, useCreateBooking, useCancelBooking } from "@/hooks/use-bookings";
import { timeSlots } from "@/data/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Check, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Bookings() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ id: string; studentId: string; studentName: string } | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");
  const { data: horses = [], isLoading: lh } = useHorses();
  const { data: students = [], isLoading: ls } = useStudents();
  const { data: bookings = [], isLoading: lb } = useBookingsByDate(dateStr);
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  const availableHorses = horses.filter((h) => h.status === "available");

  const isSlotTaken = (time: string, horseId: string) => {
    return bookings.some((b) => b.time === time && b.horse_id === horseId);
  };

  const handleBook = () => {
    if (!selectedTime || !selectedHorse || !selectedStudent) return;
    createBooking.mutate(
      { student_id: selectedStudent, horse_id: selectedHorse, date: dateStr, time: selectedTime },
      {
        onSuccess: () => {
          setSelectedTime(null);
          setSelectedHorse(null);
          setSelectedStudent(null);
        },
      }
    );
  };

  const handleCancel = () => {
    if (!cancelDialog) return;
    // Refund credit if cancellation is more than 24h before
    const bookingDate = new Date(dateStr);
    const hoursUntil = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);
    cancelBooking.mutate(
      { id: cancelDialog.id, studentId: cancelDialog.studentId, refundCredit: hoursUntil > 24 },
      { onSuccess: () => setCancelDialog(null) }
    );
  };

  const loading = lh || ls || lb;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Reservas</h1>
        <p className="text-muted-foreground mt-1">Reserva una clase en segundos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    locale={es}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alumno</label>
              <Select value={selectedStudent || ""} onValueChange={setSelectedStudent}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleccionar alumno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.credits} créditos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Button
            onClick={handleBook}
            className="w-full"
            size="lg"
            disabled={!selectedTime || !selectedHorse || !selectedStudent || createBooking.isPending}
          >
            {createBooking.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Confirmar Reserva
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Selecciona hora y caballo
              </label>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-muted-foreground py-2 px-2">Hora</th>
                      {availableHorses.map((h) => (
                        <th key={h.id} className="text-center text-xs text-muted-foreground py-2 px-2">
                          {h.image} {h.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time} className="border-t border-border">
                        <td className="py-2 px-2 text-sm font-medium text-muted-foreground">{time}</td>
                        {availableHorses.map((horse) => {
                          const taken = isSlotTaken(time, horse.id);
                          const selected = selectedTime === time && selectedHorse === horse.id;
                          return (
                            <td key={horse.id} className="py-2 px-2 text-center">
                              {taken ? (
                                <Badge variant="secondary" className="text-[10px]">Ocupado</Badge>
                              ) : (
                                <button
                                  onClick={() => { setSelectedTime(time); setSelectedHorse(horse.id); }}
                                  className={cn(
                                    "w-full py-1.5 px-2 rounded-md text-xs transition-all border",
                                    selected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-border hover:border-primary/40 hover:bg-primary/5 text-foreground"
                                  )}
                                >
                                  Libre
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Today's bookings list */}
          {bookings.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  Reservas del día
                </label>
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{b.time}</span>
                        <span className="text-sm text-foreground">{b.students?.name}</span>
                        <span className="text-sm text-muted-foreground">· {b.horses?.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setCancelDialog({
                            id: b.id,
                            studentId: b.student_id,
                            studentName: b.students?.name || "",
                          })
                        }
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cancelar la reserva de {cancelDialog?.studentName}?
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-muted text-sm text-foreground">
            <p className="font-medium mb-1">Política de cancelación</p>
            <p className="text-muted-foreground">
              Si cancelas con más de 24 horas de antelación, se devolverá el crédito al alumno.
              Las cancelaciones con menos de 24 horas no devuelven crédito.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)}>Volver</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelBooking.isPending}>
              {cancelBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
