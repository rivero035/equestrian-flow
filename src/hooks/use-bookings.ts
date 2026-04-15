import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Booking {
  id: string;
  student_id: string;
  horse_id: string;
  date: string;
  time: string;
  status: "confirmada" | "pendiente" | "cancelada";
  paid: boolean;
  created_at: string;
  center_id: string | null;
  students?: { name: string };
  horses?: { name: string; image: string };
}

export function useBookingsByDate(date: string) {
  const { centerId } = useAuth();
  return useQuery({
    queryKey: ["bookings", date, centerId],
    enabled: !!centerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, students(name), horses(name, image)")
        .eq("center_id", centerId!)
        .eq("date", date)
        .neq("status", "cancelada")
        .order("time");
      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  const { centerId } = useAuth();
  return useMutation({
    mutationFn: async (booking: {
      student_id: string;
      horse_id: string;
      date: string;
      time: string;
    }) => {
      // Check horse status and daily limit
      const { data: horse } = await supabase
        .from("horses")
        .select("status, max_daily_hours, name")
        .eq("id", booking.horse_id)
        .single();

      if (!horse || horse.status !== "available") {
        throw new Error("Este caballo no está disponible");
      }

      // Count existing bookings for this horse on this date
      const { count } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("horse_id", booking.horse_id)
        .eq("date", booking.date)
        .neq("status", "cancelada");

      if ((count ?? 0) >= horse.max_daily_hours) {
        throw new Error(`${horse.name} ha alcanzado su límite de ${horse.max_daily_hours}h diarias`);
      }

      // Check slot not taken
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("horse_id", booking.horse_id)
        .eq("date", booking.date)
        .eq("time", booking.time)
        .neq("status", "cancelada")
        .maybeSingle();

      if (existing) {
        throw new Error("Este caballo ya está reservado en ese horario");
      }

      // Check student credits
      const { data: student } = await supabase
        .from("students")
        .select("credits")
        .eq("id", booking.student_id)
        .single();

      if (!student || student.credits <= 0) {
        throw new Error("El alumno no tiene créditos disponibles");
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...booking, center_id: centerId })
        .select()
        .single();
      if (error) throw error;

      await supabase
        .from("students")
        .update({ credits: student.credits - 1 })
        .eq("id", booking.student_id);

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("¡Reserva creada con éxito!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, studentId, refundCredit }: { id: string; studentId: string; refundCredit: boolean }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelada" as const })
        .eq("id", id);
      if (error) throw error;

      if (refundCredit) {
        const { data: student } = await supabase
          .from("students")
          .select("credits")
          .eq("id", studentId)
          .single();
        if (student) {
          await supabase
            .from("students")
            .update({ credits: student.credits + 1 })
            .eq("id", studentId);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Reserva cancelada");
    },
    onError: () => toast.error("Error al cancelar"),
  });
}
