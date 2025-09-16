import Header from "@/components/Header/Header";
import {
  getTreinosDoAlunoLogado,
  StudentWorkout,
} from "@/services/workout-student";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Gym() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [treinos, setTreinos] = useState<StudentWorkout[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 600);

    load();

    return () => clearTimeout(timeout);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const rows = await getTreinosDoAlunoLogado();
      setTreinos(rows);
    } catch (e: any) {
      console.error("❌ Gym.load:", e);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("🚀 Gym mount, user?.id:", user?.id);
    load();

    // opcional: realtime para atualizar quando o personal criar/excluir
    const channel = supabase
      .channel("workouts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workouts" },
        (payload) => {
          console.log("🔔 realtime workouts change:", payload.eventType);
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <SafeAreaView className="flex-1 items-center justify-normal bg-[#141414]">
      <StatusBar style="light" backgroundColor="#141414" translucent />
      <LinearGradient
        colors={["transparent", "rgba(237,50,65,0.3)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 480 }}
        start={{ x: 0, y: 0.56 }}
        end={{ x: 0, y: 0 }}
      />

      <Header />

      <View className="flex-1 w-full px-5 pt-2">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="text-zinc-400 mt-2">Carregando seus treinos…</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-400">Erro: {error}</Text>
          </View>
        ) : treinos.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-zinc-400 text-center">
              Nenhum treino ativo ainda. Peça ao seu Personal para criar um
              treino.
            </Text>
          </View>
        ) : (
          <FlatList
            data={treinos}
            keyExtractor={(t) => t.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  console.log("➡️ Abrir treino", item.id);
                  router.push({
                    pathname: "/workouts/[id]",
                    params: { id: item.id },
                  });
                }}
                className="mb-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <Text className="text-white font-medium">{item.title}</Text>
                <Text className="text-zinc-400 text-xs mt-1">
                  {item.frequency_per_week
                    ? `${item.frequency_per_week}x/sem`
                    : "—"}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
