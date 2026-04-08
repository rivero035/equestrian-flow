import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Horse {
  id: string;
  name: string;
  level: "principiante" | "intermedio" | "avanzado";
  available: boolean;
  image: string;
  created_at: string;
}

export function useHorses() {
  return useQuery({
    queryKey: ["horses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Horse[];
    },
  });
}

export function useCreateHorse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (horse: { name: string; level: Horse["level"]; image?: string }) => {
      const { data, error } = await supabase
        .from("horses")
        .insert({ name: horse.name, level: horse.level, image: horse.image || "🐴" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horses"] });
      toast.success("Caballo creado");
    },
    onError: () => toast.error("Error al crear caballo"),
  });
}

export function useUpdateHorse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Horse> & { id: string }) => {
      const { error } = await supabase.from("horses").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horses"] });
      toast.success("Caballo actualizado");
    },
    onError: () => toast.error("Error al actualizar"),
  });
}

export function useDeleteHorse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("horses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horses"] });
      toast.success("Caballo eliminado");
    },
    onError: () => toast.error("Error al eliminar caballo"),
  });
}
