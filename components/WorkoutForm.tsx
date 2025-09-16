// components/WorkoutForm.tsx
import { supabase } from "@/src/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Aluno = { id: string; name: string };
type SubmitPayload = { title: string; description: string; alunoId: string };

type Props = {
  initialTitle?: string;
  initialDescription?: string;
  defaultAlunoId?: string;
  onSubmit: (data: SubmitPayload) => Promise<void> | void;
  submitLabel?: string;
  hideAlunoPicker?: boolean; // caso queira reaproveitar sem escolher aluno
};

export default function WorkoutForm({
  initialTitle = "",
  initialDescription = "",
  defaultAlunoId,
  onSubmit,
  submitLabel = "Salvar treino",
  hideAlunoPicker = false,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoId, setAlunoId] = useState<string | undefined>(defaultAlunoId);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!hideAlunoPicker);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // carrega alunos (role USER)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (hideAlunoPicker) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id,name")
        .eq("role", "USER")
        .order("name", { ascending: true });
      if (!mounted) return;
      if (error) setError(error.message);
      setAlunos(data ?? []);
      setLoading(false);
      // se veio defaultAlunoId, garante seleção válida
      if (defaultAlunoId) setAlunoId(defaultAlunoId);
    })();
    return () => {
      mounted = false;
    };
  }, [hideAlunoPicker, defaultAlunoId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return alunos;
    return alunos.filter((a) => (a.name ?? "").toLowerCase().includes(q));
  }, [alunos, query]);

  async function handleSubmit() {
    try {
      setError(null);
      if (!title.trim()) return setError("Informe um título para o treino.");
      if (!hideAlunoPicker && !alunoId) return setError("Selecione um aluno.");
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        alunoId: (alunoId as string) ?? "",
      });
      // feedback de sucesso visual simples
      setTitle("");
      setDescription("");
      if (!defaultAlunoId) setAlunoId(undefined);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar treinamento.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = title.trim().length > 0 && (hideAlunoPicker || !!alunoId);

  return (
    <View className="p-4">
      {/* Card container */}
      <View className="rounded-2xl border border-zinc-200 bg-white/90 dark:bg-zinc-900/90 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <View className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900">
          <Text className="text-white dark:text-zinc-100 text-lg font-semibold">
            Configurar Treino
          </Text>
          <Text className="text-white dark:text-zinc-400 text-xs mt-1">
            Defina título, descrição e o aluno que receberá este treino.
          </Text>
        </View>

        {/* Body */}
        <View className="px-5 py-5 gap-4">
          {/* Título */}
          <View>
            <Text className="text-white dark:text-zinc-300 mb-2 font-medium">
              Título
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Treino A"
              placeholderTextColor="#9CA3AF"
              className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
            />
          </View>

          {/* Descrição */}
          <View>
            <Text className="text-zinc-700 dark:text-zinc-300 mb-2 font-medium">
              Descrição
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Exercícios, séries, repetições, carga, descanso…"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 min-h-[120px] text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
            />
          </View>

          {/* Picker de aluno */}
          {!hideAlunoPicker && (
            <View className="gap-2">
              <Text className="text-zinc-700 dark:text-zinc-300 font-medium">
                Selecionar aluno
              </Text>

              {/* Busca */}
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nome…"
                placeholderTextColor="#9CA3AF"
                className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
              />

              {/* Lista */}
              <View className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                {loading ? (
                  <View className="py-6 items-center">
                    <ActivityIndicator />
                    <Text className="text-xs text-zinc-500 mt-2">
                      Carregando alunos…
                    </Text>
                  </View>
                ) : filtered.length === 0 ? (
                  <View className="py-6 items-center">
                    <Text className="text-xs text-zinc-500">
                      Nenhum aluno encontrado.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => {
                      const selected = alunoId === item.id;
                      return (
                        <Pressable
                          onPress={() => setAlunoId(item.id)}
                          className={`px-4 py-3 flex-row items-center justify-between
                                      border-b border-zinc-200 dark:border-zinc-700
                                      ${selected ? "bg-zinc-100/80 dark:bg-zinc-800/60" : "bg-white dark:bg-zinc-900"}`}
                        >
                          <Text className="text-zinc-800 dark:text-zinc-100">
                            {item.name || "Sem nome"}
                          </Text>
                          <View
                            className={`w-5 h-5 rounded-full border
                                        ${selected ? "bg-yellow-400 border-yellow-700" : "border-zinc-300 dark:border-zinc-600"}`}
                          />
                        </Pressable>
                      );
                    }}
                    ItemSeparatorComponent={() => <View />}
                  />
                )}
              </View>
            </View>
          )}

          {/* Erro */}
          {error && (
            <View className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
              <Text className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </Text>
            </View>
          )}

          {/* Ações */}
          <View className="flex-row items-center gap-3">
            <Pressable
              disabled={submitting || !canSubmit}
              onPress={handleSubmit}
              className={`flex-1 rounded-xl px-4 py-3 items-center justify-center
                          ${canSubmit && !submitting ? "bg-emerald-600" : "bg-emerald-600/50"} `}
            >
              <Text className="text-white font-semibold">
                {submitting ? "Salvando…" : submitLabel}
              </Text>
            </Pressable>

            <Pressable
              disabled={submitting}
              onPress={() => {
                setTitle("");
                setDescription("");
                if (!defaultAlunoId) setAlunoId(undefined);
                setError(null);
              }}
              className="rounded-xl px-4 py-3 items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            >
              <Text className="text-zinc-800 dark:text-zinc-100 font-medium">
                Limpar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
