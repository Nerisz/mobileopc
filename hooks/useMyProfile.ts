import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";

export type MyProfile = { id: string; name?: string | null; avatar_url?: string | null };

export function useMyProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MyProfile | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setProfile(null); return; }

      const { data, error } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // realtime opcional: refletir atualizações do Settings
  useEffect(() => {
    const ch = supabase
      .channel("users_profile_changes")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "users" },
        (payload) => {
          const row = payload.new as any;
          setProfile(p => (p && p.id === row.id ? { ...p, ...row } : p));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return { profile, loading, reload: load };
}
