import { useState } from "react";
import { students, pricePerCredit } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const creditPacks = [
  { amount: 1, label: "1 clase" },
  { amount: 5, label: "Bono 5 clases" },
  { amount: 10, label: "Bono 10 clases" },
];

export default function Credits() {
  const [topUpStudent, setTopUpStudent] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const student = students.find((s) => s.id === topUpStudent);

  const handleTopUp = () => {
    if (!selectedPack) return;
    const pack = creditPacks.find((p) => String(p.amount) === selectedPack);
    toast.success(`Se añadieron ${pack?.amount} créditos a ${student?.name} (${(pack?.amount || 0) * pricePerCredit}€)`);
    setTopUpStudent(null);
    setSelectedPack(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl text-foreground">Créditos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los créditos de tus alumnos — {pricePerCredit}€/clase
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground uppercase tracking-wider p-4">Alumno</th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider p-4">Créditos</th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider p-4">Estado</th>
                <th className="text-right text-xs text-muted-foreground uppercase tracking-wider p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-semibold text-foreground">{s.credits}</span>
                  </td>
                  <td className="p-4 text-center">
                    {s.credits === 0 ? (
                      <Badge variant="destructive">Sin créditos</Badge>
                    ) : s.credits <= 2 ? (
                      <Badge className="bg-warning text-warning-foreground border-0">Pocos</Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => setTopUpStudent(s.id)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Recargar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Top-up dialog */}
      <Dialog open={!!topUpStudent} onOpenChange={() => setTopUpStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Recargar créditos</DialogTitle>
            <DialogDescription>
              Añade créditos a {student?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={selectedPack || ""} onValueChange={setSelectedPack}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar bono" />
              </SelectTrigger>
              <SelectContent>
                {creditPacks.map((p) => (
                  <SelectItem key={p.amount} value={String(p.amount)}>
                    {p.label} — {p.amount * pricePerCredit}€
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPack && (
              <div className="p-3 rounded-lg bg-muted text-sm text-foreground">
                Total a cobrar: <strong>{Number(selectedPack) * pricePerCredit}€</strong>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpStudent(null)}>Cancelar</Button>
            <Button onClick={handleTopUp} disabled={!selectedPack}>Confirmar recarga</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
