import { useState } from "react";
import equioLogo from "@/assets/equio-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, School, User } from "lucide-react";
import { toast } from "sonner";

type SelectedRole = "manager" | "student" | null;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
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
        if (!selectedRole) {
          toast.error("Selecciona tu rol");
          setLoading(false);
          return;
        }

        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: `${name.trim()} ${surname.trim()}`.trim(),
              phone: phone.trim() || undefined,
              selected_role: selectedRole,
            },
          },
        });
        if (error) throw error;

        // Assign role immediately after signup
        if (signUpData.user) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: signUpData.user.id, role: selectedRole });
          if (roleError) console.error("Role assignment error:", roleError);
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
          <img src={equioLogo} alt="equio logo" width={72} height={72} className="mx-auto" />
          <h1 className="text-2xl font-display mt-3 text-foreground">equio</h1>
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
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Juan"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Apellidos</label>
                      <Input
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="García López"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Teléfono (opcional)</label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 600 000 000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">¿Cómo vas a usar equio?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole("manager")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedRole === "manager"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <School className="h-4 w-4 text-primary mb-1" />
                        <p className="text-sm font-medium text-foreground">Encargado</p>
                        <p className="text-[11px] text-muted-foreground">Gestionar centro</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("student")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedRole === "student"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <User className="h-4 w-4 text-accent mb-1" />
                        <p className="text-sm font-medium text-foreground">Alumno</p>
                        <p className="text-[11px] text-muted-foreground">Reservar clases</p>
                      </button>
                    </div>
                  </div>
                </>
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
