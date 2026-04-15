import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "manager" | "student";

interface StudentRecord {
  id: string;
  center_id: string | null;
  credits: number;
  name: string;
}

interface AuthContext {
  user: User | null;
  session: Session | null;
  centerId: string | null;
  role: AppRole | null;
  studentRecord: StudentRecord | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  session: null,
  centerId: null,
  role: null,
  studentRecord: null,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
});

async function fetchUserData(userId: string) {
  // Fetch role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const role = (roleData?.role as AppRole) ?? null;

  let centerId: string | null = null;
  let studentRecord: StudentRecord | null = null;

  if (role === "manager") {
    const { data } = await supabase
      .from("centers")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();
    centerId = data?.id ?? null;
  } else if (role === "student") {
    const { data } = await supabase
      .from("students")
      .select("id, center_id, credits, name")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      studentRecord = data as StudentRecord;
      centerId = data.center_id;
    }
  }

  return { role, centerId, studentRecord };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [studentRecord, setStudentRecord] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (u: User | null) => {
    if (!u) {
      setRole(null);
      setCenterId(null);
      setStudentRecord(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchUserData(u.id);
      setRole(data.role);
      setCenterId(data.centerId);
      setStudentRecord(data.studentRecord);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        await loadUserData(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadUserData(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const refreshAuth = useCallback(async () => {
    if (user) {
      setLoading(true);
      await loadUserData(user);
    }
  }, [user, loadUserData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCenterId(null);
    setRole(null);
    setStudentRecord(null);
  };

  return (
    <AuthCtx.Provider value={{ user, session, centerId, role, studentRecord, loading, signOut, refreshAuth }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
