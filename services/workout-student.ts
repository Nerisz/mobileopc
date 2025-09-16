// services/workout-student.ts
import { supabase } from "@/src/lib/supabase";

export type StudentWorkout = {
  id: string;
  title: string;
  created_at: string;
  frequency_per_week: number | null;
};

export async function getTreinosDoAlunoLogado(): Promise<StudentWorkout[]> {
  const { data: auth, error: ea } = await supabase.auth.getUser();
  if (ea) throw ea;
  const uid = auth.user?.id;
  if (!uid) throw new Error("Sem sessão (uid indefinido)");

  console.log("👤 getTreinosDoAlunoLogado uid:", uid);

  const { data, error } = await supabase
    .from("workouts")
    .select("id, title, created_at, frequency_per_week, assigned_to")
    .eq("assigned_to", uid)               // <- chave: assigned_to do aluno logado
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ getTreinosDoAlunoLogado error:", error);
    throw error;
  }

  console.log("📦 getTreinosDoAlunoLogado rows:", data?.length);
  return (data ?? []) as any;
}
