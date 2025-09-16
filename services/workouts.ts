// services/workouts.ts
import { supabase } from "@/src/lib/supabase";

type CreateWorkoutItem = {
  exercise_id: string;
  sets: number;
  reps: number;
  load_kg?: number | null;      // numeric
  rest_seconds?: number | null; // integer
  notes?: string | null;
};

type CreateWorkoutInput = {
  title: string;
  description?: string | null;
  alunoId: string;                 // -> assigned_to
  frequencyPerWeek?: number | null;
  items: CreateWorkoutItem[];
};

export async function criarTreinoCompleto(input: CreateWorkoutInput) {
  // 1) usuário logado (created_by NOT NULL na workouts)
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Sem sessão: auth.user.id indefinido");

  // 2) cria workout
  const { data: w, error: ew } = await supabase
    .from("workouts")
    .insert({
      title: input.title,
      description: input.description ?? null,
      assigned_to: input.alunoId,                  // CONFIRA o nome da coluna
      created_by: uid,                             // requisito NOT NULL
      frequency_per_week: input.frequencyPerWeek ?? null,
    })
    .select("id")
    .single();

  if (ew) {
    console.error("❌ workouts.insert", ew);
    throw new Error(`workouts.insert: ${ew.message}`);
  }

  // 3) cria itens do treino
  if (input.items?.length) {
    const payload = input.items.map((i) => ({
      workout_id: w.id,
      exercise_id: i.exercise_id,
      sets: i.sets,
      reps: i.reps,
      load_kg: i.load_kg ?? null,
      rest_seconds: i.rest_seconds ?? null,
      notes: i.notes ?? null,
      // sem order_index (não existe na tabela)
    }));

    const { error: ei } = await supabase
      .from("workout_exercises")
      .insert(payload);

    if (ei) {
      console.error("❌ workout_exercises.insert", ei);
      throw new Error(`workout_exercises.insert: ${ei.message}`);
    }
  }

  return w.id as string;
}
