import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Center {
  id: string;
  name: string;
  logo_url: string | null;
  owner_id: string;
}

export function useCenter() {
  const { centerId } = useAuth();
  return useQuery({
    queryKey: ["center", centerId],
    enabled: !!centerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centers")
        .select("id, name, logo_url, owner_id")
        .eq("id", centerId!)
        .single();
      if (error) throw error;
      return data as Center;
    },
  });
}

export function useUpdateCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("centers").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["center"] });
      toast.success("Centro actualizado");
    },
    onError: () => toast.error("Error al actualizar centro"),
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ centerId, file }: { centerId: string; file: File }) => {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("center-logos")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("center-logos")
        .getPublicUrl(path);

      const { error } = await supabase
        .from("centers")
        .update({ logo_url: urlData.publicUrl })
        .eq("id", centerId);
      if (error) throw error;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["center"] });
      toast.success("Logo actualizado");
    },
    onError: () => toast.error("Error al subir logo"),
  });
}

export function useSearchCenters(query: string) {
  return useQuery({
    queryKey: ["centers-search", query],
    enabled: query.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centers")
        .select("id, name, logo_url")
        .ilike("name", `%${query}%`)
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}
