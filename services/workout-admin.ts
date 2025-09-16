// services/workout-admin.ts (personal)
import { supabase } from "@/src/lib/supabase";

export async function listarTreinosDoAluno(alunoId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("id, title, description, created_at, frequency_per_week")
    .eq("assigned_to", alunoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function deletarTreino(workoutId: string) {
  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) throw error;
}
