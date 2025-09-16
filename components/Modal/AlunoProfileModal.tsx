// components/Modal/AlunoProfileModal.tsx
import WorkoutWizardModal from "@/components/Modal/WorkoutWizardModal";
import { deletarTreino, listarTreinosDoAluno } from "@/services/workout-admin";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void | Promise<void>;
  aluno: { id: string; name?: string | null; avatar_url?: string | null };
};

type Workout = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string;
  frequency_per_week?: number | null;
};

export default function AlunoProfileModal({ visible, onClose, aluno }: Props) {
  const [loading, setLoading] = useState(true);
  const [treinos, setTreinos] = useState<Workout[]>([]);
  const [mode, setMode] = useState<"profile" | "wizard">("profile");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listarTreinosDoAluno(aluno.id);
      setTreinos(data as Workout[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!visible) return;
    load();
  }, [visible, aluno?.id]);

  async function handleDelete(id: string) {
    Alert.alert(
      "Excluir treino",
      "Tem certeza que deseja excluir este treino? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id);
            try {
              await deletarTreino(id);
              await load();
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => void onClose()}
      presentationStyle="pageSheet"
    >
      {mode === "wizard" ? (
        <WorkoutWizardModal
          alunoId={aluno.id}
          alunoName={aluno.name ?? ""}
          onClose={async () => {
            setMode("profile");
            await load(); // recarrega após criar
          }}
        />
      ) : (
        <View className="flex-1 bg-zinc-950">
          {/* Header */}
          <View className="px-4 py-4 border-b border-zinc-800 bg-zinc-950">
            <Text className="text-white text-lg font-semibold">
              Perfil do Aluno
            </Text>
          </View>

          {/* Card do aluno */}
          <View className="px-5 py-6 flex-row items-center gap-3">
            {aluno.avatar_url ? (
              <Image
                source={{ uri: aluno.avatar_url }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
              />
            ) : (
              <View className="w-14 h-14 rounded-full bg-zinc-800 items-center justify-center">
                <Text className="text-white text-xl">
                  {(aluno.name?.[0] ?? "A").toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1 min-w-0">
              <Text
                numberOfLines={1}
                className="text-white text-base font-medium"
              >
                {aluno.name || "Sem nome"}
              </Text>
              <Text className="text-zinc-400 text-xs">Aluno da academia</Text>
            </View>
          </View>

          {/* Lista de treinos */}
          <View className="px-5 pb-4">
            <Text className="text-zinc-300 mb-2">Treinos do aluno</Text>

            {loading ? (
              <View className="py-4 items-center">
                <ActivityIndicator />
                <Text className="text-zinc-400 text-xs mt-2">
                  Carregando treinos…
                </Text>
              </View>
            ) : treinos.length === 0 ? (
              <View className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <Text className="text-zinc-300">
                  Nenhum treino cadastrado ainda.
                </Text>
              </View>
            ) : (
              treinos.map((t) => (
                <View
                  key={t.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 mb-3"
                >
                  <Text className="text-white font-medium">{t.title}</Text>
                  <Text className="text-zinc-400 text-xs mt-0.5">
                    {t.frequency_per_week
                      ? `${t.frequency_per_week}x/sem`
                      : "—"}
                  </Text>

                  <View className="flex-row gap-2 mt-3">
                    <Pressable
                      onPress={() => setMode("wizard")}
                      className="px-3 py-2 rounded-xl border border-zinc-700"
                    >
                      <Text className="text-zinc-200">Modificar</Text>
                    </Pressable>

                    <Pressable
                      disabled={deletingId === t.id}
                      onPress={() => handleDelete(t.id)}
                      className={`px-3 py-2 rounded-xl border ${
                        deletingId === t.id
                          ? "border-zinc-700"
                          : "border-red-500"
                      }`}
                    >
                      <Text
                        className={
                          deletingId === t.id ? "text-zinc-500" : "text-red-400"
                        }
                      >
                        {deletingId === t.id ? "Excluindo…" : "Excluir"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Ações principais */}
          <View className="px-5 gap-3 mt-2">
            <Pressable
              onPress={() => setMode("wizard")}
              className="rounded-xl bg-emerald-600 px-4 py-3 items-center"
            >
              <Text className="text-white font-semibold">
                Criar novo treino
              </Text>
            </Pressable>
          </View>

          {/* Rodapé */}
          <View className="mt-auto px-5 py-4">
            <Pressable
              onPress={() => void onClose()}
              className="rounded-xl border border-zinc-700 px-4 py-3 items-center"
            >
              <Text className="text-white">Fechar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Modal>
  );
}
