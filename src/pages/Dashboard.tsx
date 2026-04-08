import { useHorses } from "@/hooks/use-horses";
import { useBookingsByDate } from "@/hooks/use-bookings";
import { useWaitlist } from "@/hooks/use-waitlist";
import { timeSlots } from "@/data/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck, Users, Lightbulb, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) => (
  <Card className="animate-fade-in">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-semibold mt-1 text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: horses = [], isLoading: loadingHorses } = useHorses();
  const { data: bookings = [], isLoading: loadingBookings } = useBookingsByDate(today);
  const { data: waitlistEntries = [], isLoading: loadingWaitlist } = useWaitlist();

  if (loadingHorses || loadingBookings || loadingWaitlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const availableHorses = horses.filter((h) => h.available);
  const totalSlots = timeSlots.length * availableHorses.length;
  const bookedSlots = bookings.length;
  const emptySlots = Math.max(0, totalSlots - bookedSlots);
  const occupancyPct = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  const todayWaitlist = waitlistEntries.filter((w) => w.date === today);

  const horseUsage = availableHorses.map((horse) => {
    const used = bookings.filter((b) => b.horse_id === horse.id).length;
    return { ...horse, used, total: timeSlots.length };
  });

  const suggestions: string[] = [];
  if (todayWaitlist.length > 0 && emptySlots > 0) {
    suggestions.push(
      `Hay ${todayWaitlist.length} alumno${todayWaitlist.length > 1 ? "s" : ""} en lista de espera que podrían ocupar huecos libres`
    );
  }
  const underusedHorses = horseUsage.filter((h) => h.used === 0);
  if (underusedHorses.length > 0) {
    suggestions.push(
      `${underusedHorses.map((h) => h.name).join(", ")} no tiene${underusedHorses.length > 1 ? "n" : ""} clases hoy — podrías reorganizar horarios`
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Panel Principal</h1>
        <p className="text-muted-foreground mt-1">Resumen del día — todo en un vistazo</p>
      </div>

      <Card className="border-primary/15 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-lg font-display text-foreground">
                Hoy tienes {emptySlots} {emptySlots === 1 ? "hueco" : "huecos"} sin cubrir
              </p>
              {todayWaitlist.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {todayWaitlist.length} alumno{todayWaitlist.length > 1 ? "s" : ""} en lista de espera podrían ocuparlos
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Ocupación</p>
                <p className="text-2xl font-semibold text-foreground">{occupancyPct}%</p>
              </div>
              <Progress value={occupancyPct} className="w-24 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Clases reservadas" value={bookedSlots} sub={`de ${totalSlots} disponibles`} icon={CalendarCheck} />
        <StatCard label="Huecos sin cubrir" value={emptySlots} sub="disponibilidad no aprovechada" icon={Clock} />
        <StatCard label="Lista de espera" value={todayWaitlist.length} sub="alumnos esperando hueco" icon={Users} />
      </div>

      <div>
        <h2 className="text-xl text-foreground mb-4">Uso de caballos hoy</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {horseUsage.map((horse) => {
            const pct = Math.round((horse.used / horse.total) * 100);
            return (
              <Card key={horse.id} className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{horse.image}</span>
                    <span className="font-medium text-sm text-foreground">{horse.name}</span>
                  </div>
                  <Progress value={pct} className="h-1.5 mb-1.5" />
                  <p className="text-xs text-muted-foreground">{horse.used}/{horse.total} horas ocupadas</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div>
          <h2 className="text-xl text-foreground mb-4">Sugerencias</h2>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <Card key={i} className="border-dashed border-accent/30 bg-accent/5 animate-fade-in">
                <CardContent className="p-4 flex items-start gap-3">
                  <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{s}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl text-foreground mb-4">Horario del día</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {timeSlots.map((time) => {
                const slotBookings = bookings.filter((b) => b.time === time);
                const emptyInSlot = availableHorses.length - slotBookings.length;
                const waitlistForSlot = todayWaitlist.filter((w) => w.time === time);

                return (
                  <div key={time} className="flex items-stretch">
                    <div className="w-20 shrink-0 flex items-center justify-center border-r border-border bg-muted/40">
                      <span className="text-sm font-medium text-muted-foreground">{time}</span>
                    </div>
                    <div className="flex-1 p-3 flex flex-wrap gap-2 min-h-[56px]">
                      {slotBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-primary/20 bg-primary/5 text-foreground">
                          <span className="font-medium">{booking.students?.name}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{booking.horses?.name}</span>
                          <Badge variant={booking.paid ? "default" : "secondary"} className="text-[10px] h-5">
                            {booking.paid ? "Pagado" : "Pendiente"}
                          </Badge>
                        </div>
                      ))}
                      {emptyInSlot > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 text-xs text-muted-foreground">
                          {emptyInSlot} {emptyInSlot === 1 ? "hueco disponible" : "huecos disponibles"}
                          {waitlistForSlot.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 ml-1">
                              {waitlistForSlot.length} en espera
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
