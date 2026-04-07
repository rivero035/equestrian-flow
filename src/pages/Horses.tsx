import { horses, todayBookings, timeSlots } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Horses() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Caballos</h1>
        <p className="text-muted-foreground mt-1">Estado y disponibilidad del día</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {horses.map((horse) => {
          const bookingsToday = todayBookings.filter(
            (b) => b.horseId === horse.id && b.status !== "cancelada"
          );
          const freeSlots = timeSlots.length - bookingsToday.length;
          const usagePct = Math.round((bookingsToday.length / timeSlots.length) * 100);

          return (
            <Card key={horse.id} className="animate-fade-in">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{horse.image}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{horse.name}</h3>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {horse.level}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={horse.available ? "default" : "secondary"}>
                    {horse.available ? "Activo" : "Descanso"}
                  </Badge>
                </div>

                {horse.available && (
                  <div className="mt-4 space-y-3">
                    {/* Utilization bar */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Ocupación hoy</span>
                        <span>{bookingsToday.length}/{timeSlots.length} horas</span>
                      </div>
                      <Progress value={usagePct} className="h-1.5" />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {timeSlots.map((time) => {
                        const booked = bookingsToday.find((b) => b.time === time);
                        return (
                          <span
                            key={time}
                            className={`text-[11px] px-2 py-1 rounded-md border ${
                              booked
                                ? "bg-primary/10 border-primary/20 text-foreground"
                                : "border-dashed border-border text-muted-foreground"
                            }`}
                          >
                            {time} {booked ? `· ${booked.studentName.split(" ")[0]}` : ""}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {freeSlots} {freeSlots === 1 ? "hueco disponible" : "huecos disponibles"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
