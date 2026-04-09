import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  credits: number;
  created_at: string;
  center_id: string | null;
}

export function useStudents() {
  const { centerId } = useAuth();
  return useQuery({
    queryKey: ["students", centerId],
    enabled: !!centerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("center_id", centerId!)
        .order("name");
      if (error) throw error;
      return data as Student[];
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  const { centerId } = useAuth();
  return useMutation({
    mutationFn: async (student: { name: string; email?: string; phone?: string; credits?: number }) => {
      const { data, error } = await supabase
        .from("students")
        .insert({ ...student, center_id: centerId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Alumno creado");
    },
    onError: () => toast.error("Error al crear alumno"),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Student> & { id: string }) => {
      const { error } = await supabase.from("students").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Alumno actualizado");
    },
    onError: () => toast.error("Error al actualizar alumno"),
  });
}

export function useAddCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: student, error: fetchError } = await supabase
        .from("students")
        .select("credits")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("students")
        .update({ credits: (student.credits || 0) + amount })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Créditos añadidos");
    },
    onError: () => toast.error("Error al añadir créditos"),
  });
}
