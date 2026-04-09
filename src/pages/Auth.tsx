import { useState } from "react";
import equioLogo from "@/assets/equio-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [centerName, setCenterName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;

        // After signup, update center name if provided
        if (centerName.trim()) {
          // The trigger auto-creates the center; we update the name after a short delay
          setTimeout(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from("centers")
                .update({ name: centerName.trim() })
                .eq("owner_id", user.id);
            }
          }, 1000);
        }

        toast.success("Cuenta creada. Revisa tu email para confirmar.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={equioLogo} alt="equio logo" width={64} height={64} />
          <h1 className="text-2xl font-display mt-3 text-foreground">
            equio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin
              ? "Gestiona tus clases, alumnos y caballos"
              : "Empieza a gestionar tu hípica en minutos"}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Nombre de tu centro
                  </label>
                  <Input
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="Ej: Club Hípico El Robledal"
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-1"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLogin ? (
                  "Iniciar sesión"
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
