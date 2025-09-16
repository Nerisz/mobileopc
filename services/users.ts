import { supabase } from '@/src/lib/supabase';

export async function listarAlunos(q?: string) {
  let query = supabase
    .from('users')
    .select('id,name,avatar_url,role')
    .eq('role', 'USER')
    .order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  const lista = data ?? [];
  if (!q) return lista;
  const s = q.trim().toLowerCase();
  return lista.filter(u => (u.name ?? '').toLowerCase().includes(s));
}
