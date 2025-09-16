// services/exercises.ts
import { supabase } from "@/src/lib/supabase";

export type Exercise = {
  id: string;
  name: string;
  muscle_group?: string | null; // <- CONFIRA o nome da coluna
  equipment?: string | null;
  demo_url?: string | null;
};

type Params = {
  q?: string;
  muscle?: string;      // ← passamos "pernas", "peito", etc.
  equipment?: string;
  limit?: number;
  offset?: number;
};

export async function listarExercicios({
  q = "",
  muscle,
  equipment,
  limit = 30,
  offset = 0,
}: Params = {}) {
  let query = supabase
    .from("exercises")
    .select("id,name,muscle_group,equipment,demo_url")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  // Busca textual (somente se tiver q)
  if (q.trim()) {
    const like = `%${q.trim()}%`;
    query = query.or(
      `name.ilike.${like},muscle_group.ilike.${like},equipment.ilike.${like}`
    );
  }

  // ⬇️ Filtro por grupo muscular (AND)
  if (muscle && muscle.trim()) {
    const like = `%${muscle.trim()}%`; // case-insensitive
    query = query.ilike("muscle_group", like);
  }

  // (opcional) filtro por equipamento
  if (equipment && equipment.trim()) {
    const like = `%${equipment.trim()}%`;
    query = query.ilike("equipment", like);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
