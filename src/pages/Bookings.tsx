import { useState } from "react";
import { horses, timeSlots, todayBookings, students } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Bookings() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const availableHorses = horses.filter((h) => h.available);

  const isSlotTaken = (time: string, horseId: string) => {
    return todayBookings.some(
      (b) => b.time === time && b.horseId === horseId && b.status !== "cancelada"
    );
  };

  const handleBook = () => {
    if (!selectedTime || !selectedHorse || !selectedStudent) {
      toast.error("Selecciona alumno, hora y caballo");
      return;
    }
    const student = students.find((s) => s.id === selectedStudent);
    if (student && student.credits <= 0) {
      toast.error("El alumno no tiene créditos disponibles");
      return;
    }
    toast.success("¡Reserva creada con éxito!");
    setSelectedTime(null);
    setSelectedHorse(null);
    setSelectedStudent(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Reservas</h1>
        <p className="text-muted-foreground mt-1">Reserva una clase en segundos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Date & student */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fecha
              </label>
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Alumno
              </label>
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

          <Button onClick={handleBook} className="w-full" size="lg" disabled={!selectedTime || !selectedHorse || !selectedStudent}>
            <Check className="mr-2 h-4 w-4" />
            Confirmar Reserva
          </Button>
        </div>

        {/* Right: Time & horse grid */}
        <div className="lg:col-span-2">
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
                                  onClick={() => {
                                    setSelectedTime(time);
                                    setSelectedHorse(horse.id);
                                  }}
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
        </div>
      </div>
    </div>
  );
}
