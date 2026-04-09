import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface WaitlistEntry {
  id: string;
  student_id: string;
  date: string;
  time: string;
  position: number;
  created_at: string;
  center_id: string | null;
  students?: { name: string };
}

export function useWaitlist() {
  const { centerId } = useAuth();
  return useQuery({
    queryKey: ["waitlist", centerId],
    enabled: !!centerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*, students(name)")
        .eq("center_id", centerId!)
        .order("date")
        .order("time")
        .order("position");
      if (error) throw error;
      return data as WaitlistEntry[];
    },
  });
}

export function useAddToWaitlist() {
  const qc = useQueryClient();
  const { centerId } = useAuth();
  return useMutation({
    mutationFn: async (entry: { student_id: string; date: string; time: string }) => {
      const { data: existing } = await supabase
        .from("waitlist")
        .select("position")
        .eq("date", entry.date)
        .eq("time", entry.time)
        .order("position", { ascending: false })
        .limit(1);

      const nextPos = existing && existing.length > 0 ? existing[0].position + 1 : 1;

      const { data, error } = await supabase
        .from("waitlist")
        .insert({ ...entry, position: nextPos, center_id: centerId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waitlist"] });
      toast.success("Añadido a lista de espera");
    },
    onError: () => toast.error("Error al añadir a lista de espera"),
  });
}

export function useRemoveFromWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waitlist").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waitlist"] });
      toast.success("Eliminado de lista de espera");
    },
    onError: () => toast.error("Error al eliminar"),
  });
}
