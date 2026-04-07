import { waitlist } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Waitlist() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Lista de Espera</h1>
        <p className="text-muted-foreground mt-1">
          Alumnos que esperan un hueco — reasignación rápida
        </p>
      </div>

      {waitlist.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay alumnos en lista de espera</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {waitlist.map((entry) => (
            <Card key={entry.id} className="animate-fade-in">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{entry.position}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      Esperando hueco el {entry.date} a las {entry.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Posición #{entry.position}</Badge>
                  <Button
                    size="sm"
                    onClick={() =>
                      toast.success(`${entry.studentName} ha sido asignado/a al hueco de las ${entry.time}`)
                    }
                  >
                    Asignar
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">¿Cómo funciona?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Cuando una clase está llena, el alumno puede unirse a la lista de espera</li>
            <li>Si se libera un hueco, puedes reasignar con un clic</li>
            <li>El alumno recibe notificación automática</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
