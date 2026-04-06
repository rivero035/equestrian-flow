import { todayBookings, timeSlots, horses, pricePerCredit, waitlist } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, AlertTriangle, TrendingDown, Clock } from "lucide-react";

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  variant?: "default" | "warning" | "success";
}) => {
  const variantClasses = {
    default: "border-border",
    warning: "border-destructive/20 bg-destructive/5",
    success: "border-success/20 bg-success/5",
  };

  return (
    <Card className={`${variantClasses[variant]} animate-fade-in`}>
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
};

export default function Dashboard() {
  const totalSlots = timeSlots.length * horses.filter((h) => h.available).length;
  const bookedSlots = todayBookings.filter((b) => b.status !== "cancelada").length;
  const emptySlots = totalSlots - bookedSlots;
  const lostRevenue = emptySlots * pricePerCredit;
  const paidCount = todayBookings.filter((b) => b.paid).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Panel Principal</h1>
        <p className="text-muted-foreground mt-1">
          Resumen del día — todo en un vistazo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Reservas hoy"
          value={bookedSlots}
          sub={`de ${totalSlots} posibles`}
          icon={CalendarCheck}
          variant="success"
        />
        <StatCard
          label="Huecos vacíos"
          value={emptySlots}
          sub="sin ocupar"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Ingresos perdidos"
          value={`${lostRevenue}€`}
          sub="estimado hoy"
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          label="Lista de espera"
          value={waitlist.length}
          sub="alumnos esperando"
          icon={Clock}
        />
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-xl text-foreground mb-4">Horario del día</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {timeSlots.map((time) => {
                const slotBookings = todayBookings.filter(
                  (b) => b.time === time && b.status !== "cancelada"
                );
                const availableHorses = horses.filter((h) => h.available);
                const emptyInSlot = availableHorses.length - slotBookings.length;

                return (
                  <div key={time} className="flex items-stretch">
                    {/* Time label */}
                    <div className="w-20 shrink-0 flex items-center justify-center border-r border-border bg-muted/40">
                      <span className="text-sm font-medium text-muted-foreground">
                        {time}
                      </span>
                    </div>

                    {/* Bookings */}
                    <div className="flex-1 p-3 flex flex-wrap gap-2 min-h-[56px]">
                      {slotBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
                            booking.paid
                              ? "border-success/30 bg-success/8 text-foreground"
                              : "border-destructive/30 bg-destructive/8 text-foreground"
                          }`}
                        >
                          <span className="font-medium">{booking.studentName}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{booking.horseName}</span>
                          <Badge
                            variant={booking.paid ? "default" : "destructive"}
                            className="text-[10px] h-5"
                          >
                            {booking.paid ? "Pagado" : "Pendiente"}
                          </Badge>
                        </div>
                      ))}

                      {/* Empty slots */}
                      {emptyInSlot > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-warning/40 bg-warning/5 text-xs text-warning-foreground">
                          <AlertTriangle className="h-3 w-3 text-warning" />
                          {emptyInSlot} {emptyInSlot === 1 ? "hueco" : "huecos"} — {emptyInSlot * pricePerCredit}€ sin facturar
                        </div>
                      )}

                      {slotBookings.length === 0 && emptyInSlot === 0 && (
                        <span className="text-xs text-muted-foreground self-center">Sin actividad</span>
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
