import { useAuth } from "@/hooks/use-auth";
import { useCenter } from "@/hooks/use-center";
import { useBookingsByDate } from "@/hooks/use-bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarCheck, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function StudentDashboard() {
  const { studentRecord } = useAuth();
  const { data: center } = useCenter();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: bookings = [], isLoading } = useBookingsByDate(today);

  const myBookings = bookings.filter((b) => b.student_id === studentRecord?.id);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Hola, {studentRecord?.name}</h1>
        <p className="text-muted-foreground mt-1">
          {center?.name} · {format(new Date(), "PPPP", { locale: es })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Créditos</p>
              <p className="text-2xl font-semibold text-foreground">{studentRecord?.credits ?? 0}</p>
              <p className="text-xs text-muted-foreground">clases disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Clases hoy</p>
              <p className="text-2xl font-semibold text-foreground">{myBookings.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {myBookings.length > 0 && (
        <div>
          <h2 className="text-xl text-foreground mb-4">Mis clases de hoy</h2>
          <div className="space-y-2">
            {myBookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{b.time}</span>
                    <span className="text-sm text-muted-foreground">· {b.horses?.name}</span>
                  </div>
                  <Badge variant="default" className="text-xs">Confirmada</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
