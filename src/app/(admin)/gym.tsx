import HeaderAdmin from "@/components/Header/HeaderAdmin";
import AlunoProfileModal from "@/components/Modal/AlunoProfileModal"; // ⬅️ abre o perfil
import { listarAlunos } from "@/services/users";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Aluno = { id: string; name: string; avatar_url?: string | null };

export default function HomeCoach() {
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [query, setQuery] = useState("");

  // ⬇️ estados para o Perfil do Aluno
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setAlunos([]);
        return;
      }
      const data = await listarAlunos();
      setAlunos((data as any) ?? []);
    } catch {
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!query.trim()) return alunos;
    const s = query.trim().toLowerCase();
    return alunos.filter((a) => (a.name ?? "").toLowerCase().includes(s));
  }, [alunos, query]);

  // ⬇️ abre o modal de perfil (de lá o Personal cria/deleta treino)
  function openProfile(aluno: Aluno) {
    setSelectedAluno(aluno);
    setProfileVisible(true);
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-normal bg-[#141414]">
      <LinearGradient
        colors={["transparent", "rgba(237,50,65,0.3)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 480 }}
        start={{ x: 0, y: 0.56 }}
        end={{ x: 0, y: 0 }}
      />

      {/* Header custom */}
      <HeaderAdmin />

      <View className="flex-1 w-full">
        {/* Header da lista */}
        <View className="px-4 pt-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Selecione um aluno para gerenciar o treino
          </Text>

          {/* Busca */}
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar aluno por nome…"
            placeholderTextColor="#9CA3AF"
            className="mt-3 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
          />
        </View>

        {/* Lista */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={"#ED3241"} />
            <Text className="text-xs text-zinc-500 mt-2">
              Carregando alunos…
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => openProfile(item)}
                className="mb-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <View className="flex-row items-center">
                  {/* avatar */}
                  <View className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 mr-3 items-center justify-center">
                    <Text className="text-zinc-700 dark:text-zinc-200 font-semibold">
                      {(item.name?.[0] ?? "A").toUpperCase()}
                    </Text>
                  </View>

                  {/* texto */}
                  <View className="flex-1 min-w-0">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-zinc-900 dark:text-zinc-50 font-medium"
                    >
                      {item.name || "Sem nome"}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      Toque para ver perfil e treinos
                    </Text>
                  </View>

                  {/* “Criar” agora só indica ação – também abre o perfil */}
                  <Pressable
                    onPress={() => openProfile(item)}
                    className="ml-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 w-[64px] items-center"
                  >
                    <Text className="text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                      Abrir
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="px-4 py-12 items-center">
                <Text className="text-zinc-500 dark:text-zinc-400">
                  Nenhum aluno encontrado.
                </Text>
              </View>
            }
          />
        )}

        {/* Modal de Perfil do Aluno (de lá abre o Wizard e permite excluir) */}
        {selectedAluno && (
          <AlunoProfileModal
            visible={profileVisible}
            aluno={selectedAluno}
            onClose={() => {
              setProfileVisible(false);
              setSelectedAluno(null);
              // se quiser, recarregue algo aqui:
              // load();
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
