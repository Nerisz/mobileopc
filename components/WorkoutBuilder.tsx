import { Exercise, listarExercicios } from "@/services/exercises";
import { criarTreinoCompleto } from "@/services/workouts";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  alunoId: string;
  alunoName?: string;
  onDone?: () => void;
};

type ItemConfig = {
  exercise: Exercise;
  sets: number;
  reps: number;
  load_kg?: number;
  rest_seconds?: number;
  notes?: string;
};

export default function WorkoutBuilder({ alunoId, alunoName, onDone }: Props) {
  // meta do treino
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [freq, setFreq] = useState<number | undefined>(3);

  // catálogo e seleção
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Record<string, ItemConfig>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listarExercicios();
        setCatalog(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return catalog;
    const s = q.trim().toLowerCase();
    return catalog.filter((e) => (e.name ?? "").toLowerCase().includes(s));
  }, [catalog, q]);

  function toggleExercise(ex: Exercise) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[ex.id]) {
        delete next[ex.id];
      } else {
        next[ex.id] = { exercise: ex, sets: 3, reps: 12, rest_seconds: 60 };
      }
      return next;
    });
  }

  function updateItem(exId: string, patch: Partial<ItemConfig>) {
    setSelected((prev) => ({
      ...prev,
      [exId]: { ...prev[exId], ...patch } as ItemConfig,
    }));
  }

  async function handleSave() {
    const itemsArray = Object.values(selected).map((i) => ({
      exercise_id: i.exercise.id,
      sets: i.sets,
      reps: i.reps,
      load_kg: i.load_kg,
      rest_seconds: i.rest_seconds,
      notes: i.notes,
    }));
    if (!title.trim()) {
      alert("Informe um título");
      return;
    }
    if (itemsArray.length === 0) {
      alert("Selecione ao menos um exercício");
      return;
    }

    await criarTreinoCompleto({
      title: title.trim(),
      description: description.trim(),
      alunoId,
      frequencyPerWeek: freq,
      items: itemsArray,
    });
    onDone?.();
  }

  const selectedCount = Object.keys(selected).length;

  return (
    <View className="flex-1">
      {/* cabeça */}
      <View className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-zinc-900 dark:text-zinc-50 text-lg font-semibold">
          Novo treino {alunoName ? `para ${alunoName}` : ""}
        </Text>
        <Text className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          Defina meta, frequência e exercícios
        </Text>
      </View>

      {/* meta */}
      <View className="px-5 py-4 gap-3">
        <Text className="text-zinc-700 dark:text-zinc-300 font-medium">
          Título
        </Text>
        <TextInput
          className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Treino A"
          placeholderTextColor="#9CA3AF"
        />

        <Text className="text-zinc-700 dark:text-zinc-300 font-medium mt-2">
          Descrição
        </Text>
        <TextInput
          multiline
          textAlignVertical="top"
          className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 min-h-[90px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          value={description}
          onChangeText={setDescription}
          placeholder="Observações gerais…"
          placeholderTextColor="#9CA3AF"
        />

        {/* frequência semanal */}
        <Text className="text-zinc-700 dark:text-zinc-300 font-medium mt-2">
          Frequência semanal
        </Text>
        <View className="flex-row gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <Pressable
              key={n}
              onPress={() => setFreq(n)}
              className={`px-3 py-2 rounded-xl border ${freq === n ? "bg-emerald-600 border-emerald-600" : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"}`}
            >
              <Text
                className={`${freq === n ? "text-white" : "text-zinc-800 dark:text-zinc-100"} text-sm`}
              >
                {n}x/sem
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* catálogo */}
      <View className="px-5">
        <Text className="text-zinc-700 dark:text-zinc-300 font-medium">
          Exercícios
        </Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Buscar exercício…"
          placeholderTextColor="#9CA3AF"
          className="mt-2 mb-3 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
      </View>

      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator />
          <Text className="text-xs text-zinc-500 mt-2">
            Carregando exercícios…
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          renderItem={({ item }) => {
            const sel = !!selected[item.id];
            const cfg = selected[item.id];
            return (
              <View className="mb-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                <Pressable
                  onPress={() => toggleExercise(item)}
                  className="flex-row items-center justify-between"
                >
                  <View className="min-w-0 flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-zinc-900 dark:text-zinc-50 font-medium"
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      {item.muscle_group || "Geral"} •{" "}
                      {item.equipment || "Livre"}
                    </Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border ${sel ? "bg-emerald-500 border-emerald-500" : "border-zinc-400 dark:border-zinc-600"}`}
                  />
                </Pressable>

                {sel && (
                  <View className="mt-3 gap-2">
                    <View className="flex-row gap-2">
                      <Counter
                        label="Séries"
                        value={cfg.sets}
                        onChange={(v) => updateItem(item.id, { sets: v })}
                      />
                      <Counter
                        label="Reps"
                        value={cfg.reps}
                        onChange={(v) => updateItem(item.id, { reps: v })}
                      />
                      <Counter
                        label="Carga (kg)"
                        value={cfg.load_kg ?? 0}
                        step={2}
                        onChange={(v) => updateItem(item.id, { load_kg: v })}
                      />
                    </View>
                    <View className="flex-row gap-2">
                      <Counter
                        label="Descanso (s)"
                        value={cfg.rest_seconds ?? 60}
                        step={15}
                        onChange={(v) =>
                          updateItem(item.id, { rest_seconds: v })
                        }
                      />
                    </View>
                    <TextInput
                      className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      placeholder="Notas (opcional)"
                      placeholderTextColor="#9CA3AF"
                      value={cfg.notes ?? ""}
                      onChangeText={(t) => updateItem(item.id, { notes: t })}
                    />
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* barra de ações */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95">
        <View className="flex-row items-center justify-between">
          <Text className="text-zinc-600 dark:text-zinc-400 text-sm">
            {Object.keys(selected).length} exercícios selecionados
          </Text>
          <Pressable
            onPress={handleSave}
            className={`px-5 py-3 rounded-xl ${selectedCount > 0 && title.trim() ? "bg-[#111111]" : "bg-[#ED3241]"}`}
            disabled={!(selectedCount > 0 && title.trim())}
          >
            <Text className="text-white font-semibold">Enviar treino</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** Counter simples */
function Counter({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <View className="flex-1">
      <Text className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </Text>
      <View className="flex-row items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <Pressable
          className="px-3 py-2"
          onPress={() => onChange(Math.max(0, (value ?? 0) - step))}
        >
          <Text className="text-lg text-zinc-700 dark:text-zinc-100">−</Text>
        </Pressable>
        <Text className="text-zinc-900 dark:text-zinc-50">{value ?? 0}</Text>
        <Pressable
          className="px-3 py-2"
          onPress={() => onChange((value ?? 0) + step)}
        >
          <Text className="text-lg text-zinc-700 dark:text-zinc-100">＋</Text>
        </Pressable>
      </View>
    </View>
  );
}
