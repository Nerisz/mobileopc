// components/Modal/WorkoutWizardModal.tsx
import { Exercise, listarExercicios } from "@/services/exercises";
import { criarTreinoCompleto } from "@/services/workouts";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  alunoId: string;
  alunoName?: string;
  onClose: () => void | Promise<void>;
};

const PAGE_SIZE = 30;
const MUSCLES = [
  "peito",
  "costas",
  "pernas",
  "ombro",
  "bíceps",
  "tríceps",
  "abdômen",
  "glúteo",
  "panturrilha",
] as const;

type ItemConfig = {
  exercise: Exercise;
  sets: number;
  reps: number;
  load_kg?: number;
  rest_seconds?: number;
  notes?: string;
};

type WizardSession = {
  key: string; // A/B/C...
  title: string;
  muscles: string[];
  selected: Record<string, ItemConfig>;
};

export default function WorkoutWizardModal({
  alunoId,
  alunoName,
  onClose,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // meta global
  const [freq, setFreq] = useState<number>(3);
  const [description, setDescription] = useState("");

  // sessões A/B/C
  const [sessions, setSessions] = useState<WizardSession[]>([
    { key: "A", title: "Treino A", muscles: [], selected: {} },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const current = sessions[activeIndex];

  // catálogo + busca + filtro músculo
  const [q, setQ] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<string | undefined>(
    undefined
  );
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // carregar exercícios (com debounce)
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        if (page === 0) setLoading(true);
        else setLoadingMore(true);

        const raw = await listarExercicios({
          q,
          muscle: filterMuscle,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        });

        if (cancelled) return;

        // cinto de segurança: filtro local normalizado
        const norm = (s?: string | null) =>
          (s ?? "")
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase();

        const filtered =
          filterMuscle && filterMuscle.trim()
            ? raw.filter((e) =>
                norm(e.muscle_group).includes(norm(filterMuscle))
              )
            : raw;

        setHasMore(filtered.length === PAGE_SIZE);
        if (page === 0) setCatalog(filtered);
        else setCatalog((prev) => [...prev, ...filtered]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q, page, filterMuscle]);

  // sincroniza filtro ao entrar no passo 2 / trocar de sessão
  useEffect(() => {
    if (step !== 2) return;
    const muscles = current?.muscles ?? [];
    setFilterMuscle(muscles.length ? muscles[0] : undefined);
    setPage(0);
    setHasMore(true);
  }, [step, activeIndex]);

  // se os músculos mudarem no passo 1 enquanto estamos no 2, ajusta filtro
  useEffect(() => {
    if (step !== 2) return;
    const muscles = current?.muscles ?? [];
    if (!muscles.length && filterMuscle !== undefined) {
      setFilterMuscle(undefined);
      setPage(0);
      setHasMore(true);
    } else if (muscles.length && !muscles.includes(filterMuscle as string)) {
      setFilterMuscle(muscles[0]);
      setPage(0);
      setHasMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.muscles?.join("|")]);

  // helpers sessões
  function addSession() {
    const nextKey = String.fromCharCode(65 + sessions.length);
    setSessions((prev) => [
      ...prev,
      { key: nextKey, title: `Treino ${nextKey}`, muscles: [], selected: {} },
    ]);
    setActiveIndex(sessions.length);
  }

  function removeSession(index: number) {
    if (sessions.length === 1) return;
    setSessions((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy.map((s, i) => ({
        ...s,
        key: String.fromCharCode(65 + i),
        title: s.title.replace(
          /Treino .$/,
          `Treino ${String.fromCharCode(65 + i)}`
        ),
      }));
    });
    setActiveIndex((i) => Math.max(0, Math.min(i, sessions.length - 2)));
  }

  function patchSession(index: number, patch: Partial<WizardSession>) {
    setSessions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  }

  function toggle(ex: Exercise) {
    setSessions((prev) => {
      const copy = [...prev];
      const sel = { ...copy[activeIndex].selected };
      if (sel[ex.id]) delete sel[ex.id];
      else sel[ex.id] = { exercise: ex, sets: 3, reps: 12, rest_seconds: 60 };
      copy[activeIndex] = { ...copy[activeIndex], selected: sel };
      return copy;
    });
  }

  function patchItem(exId: string, p: Partial<ItemConfig>) {
    setSessions((prev) => {
      const copy = [...prev];
      const sel = { ...copy[activeIndex].selected };
      sel[exId] = { ...sel[exId], ...p } as ItemConfig;
      copy[activeIndex] = { ...copy[activeIndex], selected: sel };
      return copy;
    });
  }

  async function finish() {
    // valida antes
    const vazia = sessions.find((s) => Object.keys(s.selected).length === 0);
    if (vazia) {
      alert(
        `${vazia.title} está vazio. Adicione ao menos 1 exercício ou remova o treino.`
      );
      return;
    }

    setSubmitting(true);
    try {
      for (const s of sessions) {
        const items = Object.values(s.selected).map((i) => ({
          exercise_id: i.exercise.id,
          sets: i.sets,
          reps: i.reps,
          load_kg: i.load_kg ?? null,
          rest_seconds: i.rest_seconds ?? null,
          notes: i.notes ?? null,
        }));

        // LOG pra ver payload
        console.log("CRIAR_TREINO payload:", {
          title: s.title,
          alunoId,
          frequencyPerWeek: freq,
          itemsCount: items.length,
        });

        const id = await criarTreinoCompleto({
          title: s.title.trim(),
          description: description.trim(),
          alunoId, // <- CONFIRA: é assigned_to no banco
          frequencyPerWeek: freq, // <- vira frequency_per_week no insert
          items,
        });

        console.log("CRIAR_TREINO ok id:", id);
      }

      // sucesso
      alert("Treinos enviados! 🚀");
      await onClose();
    } catch (e: any) {
      console.error("ERRO CRIAR_TREINO:", e);
      alert(`Erro ao enviar treinos:\n${e?.message ?? e}`);
    } finally {
      setSubmitting(false);
    }
  }

  const canNext =
    (step === 1 && sessions.length >= 1) ||
    (step === 2 && Object.keys(current?.selected ?? {}).length > 0) ||
    step === 3;

  function Chip({
    active,
    label,
    onPress,
  }: {
    active?: boolean;
    label: string;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        className={`px-3 py-2 rounded-xl border ${
          active
            ? "bg-emerald-600 border-emerald-600"
            : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
        }`}
      >
        <Text
          className={active ? "text-white" : "text-zinc-800 dark:text-zinc-100"}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  function SessionTabs() {
    return (
      <View className="flex-row gap-2 mb-3">
        {sessions.map((s, i) => (
          <Pressable
            key={s.key}
            onPress={() => setActiveIndex(i)}
            className={`px-3 py-2 rounded-xl border ${
              i === activeIndex
                ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-700"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            <Text className="text-zinc-800 dark:text-zinc-100">{s.key}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  async function handleEnviarTreinos() {
    console.log("📌 handleEnviarTreinos(): START", {
      alunoId,
      sessionsCount: sessions.length,
      freq,
    });

    // valida: nenhuma sessão vazia
    const vazia = sessions.find((s) => Object.keys(s.selected).length === 0);
    if (vazia) {
      console.warn("⚠️ Sessão vazia:", vazia.title);
      alert(
        `${vazia.title} está vazio. Adicione ao menos 1 exercício ou remova o treino.`
      );
      return;
    }

    setSubmitting(true);
    try {
      for (const s of sessions) {
        const items = Object.values(s.selected).map((i) => ({
          exercise_id: i.exercise.id,
          sets: i.sets,
          reps: i.reps,
          load_kg: i.load_kg ?? null,
          rest_seconds: i.rest_seconds ?? null,
          notes: i.notes ?? null,
        }));

        console.log("➡️ Criando treino", {
          title: s.title,
          alunoId,
          frequencyPerWeek: freq,
          itemsCount: items.length,
          firstItemPreview: items[0],
        });

        const newId = await criarTreinoCompleto({
          title: s.title.trim(),
          description: description.trim(),
          alunoId,
          frequencyPerWeek: freq,
          items,
        });

        console.log("✅ Treino criado com sucesso:", {
          workoutId: newId,
          title: s.title,
        });
      }

      console.log("🎉 handleEnviarTreinos(): ALL DONE");
      alert("Treinos enviados! 🚀");
      await onClose(); // volta para o modal de perfil/lista
    } catch (err: any) {
      console.error("❌ handleEnviarTreinos(): ERROR", {
        message: err?.message,
        stack: err?.stack,
        err,
      });
      alert(`Erro ao enviar treinos:\n${err?.message ?? String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-zinc-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Novo treino {alunoName ? `para ${alunoName}` : ""}
        </Text>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">
          Passo {step} de 4
        </Text>
      </View>

      {/* Conteúdo */}
      {step === 2 ? (
        <FlatList
          data={catalog}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View className="gap-3 mb-2">
              <SessionTabs />
              <Text className="text-zinc-700 dark:text-zinc-300 font-medium">
                Escolha exercícios para {current?.title}
              </Text>
              <TextInput
                value={q}
                onChangeText={(t) => {
                  setPage(0);
                  setHasMore(true);
                  setQ(t);
                }}
                placeholder="Buscar exercício…"
                placeholderTextColor="#9CA3AF"
                className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              {/* filtros por músculo */}
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Todos"
                  active={!filterMuscle}
                  onPress={() => {
                    setFilterMuscle(undefined);
                    setPage(0);
                    setHasMore(true);
                  }}
                />
                {(current?.muscles ?? []).map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    active={filterMuscle === m}
                    onPress={() => {
                      setFilterMuscle(m);
                      setPage(0);
                      setHasMore(true);
                    }}
                  />
                ))}
              </View>

              {loading && page === 0 && (
                <View className="py-6 items-center">
                  <ActivityIndicator />
                  <Text className="text-xs text-zinc-500 mt-2">
                    Carregando…
                  </Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const sel = !!current?.selected[item.id];
            return (
              <Pressable
                onPress={() => toggle(item)}
                className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-row items-center justify-between"
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
                    {item.muscle_group || "Geral"} • {item.equipment || "Livre"}
                  </Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border ${
                    sel
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-zinc-400 dark:border-zinc-600"
                  }`}
                />
              </Pressable>
            );
          }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!loadingMore && hasMore) setPage((p) => p + 1);
          }}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-3 items-center">
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && catalog.length === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-xs text-zinc-500">Nada encontrado</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && (
            <View className="gap-4">
              <View>
                <Text className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">
                  Quantos treinos
                </Text>
                <View className="flex-row gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <Chip
                      key={n}
                      label={`${n}x/sem`}
                      active={freq === n}
                      onPress={() => setFreq(n)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">
                  Observações (opcional)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ex.: foco em hipertrofia…"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 min-h-[80px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </View>

              <View className="gap-3">
                <Text className="text-zinc-700 dark:text-zinc-300 font-medium">
                  Treinos da semana
                </Text>

                {sessions.map((s, i) => (
                  <View
                    key={s.key}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <TextInput
                        value={s.title}
                        onChangeText={(t) => patchSession(i, { title: t })}
                        className="flex-1 mr-3 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
                      />
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() => {
                            setActiveIndex(i);
                            setStep(2);
                          }}
                          className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700"
                        >
                          <Text className="text-zinc-800 dark:text-zinc-100">
                            Modificar
                          </Text>
                        </Pressable>
                        <Pressable
                          disabled={sessions.length === 1}
                          onPress={() => removeSession(i)}
                          className={`px-3 py-2 rounded-xl border ${
                            sessions.length === 1
                              ? "border-zinc-800"
                              : "border-red-500"
                          }`}
                        >
                          <Text
                            className={
                              sessions.length === 1
                                ? "text-zinc-500"
                                : "text-red-500"
                            }
                          >
                            Excluir
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap gap-2 mt-3">
                      {MUSCLES.map((m) => {
                        const active = s.muscles.includes(m);
                        return (
                          <Pressable
                            key={m}
                            onPress={() => {
                              const next = active
                                ? s.muscles.filter((x) => x !== m)
                                : [...s.muscles, m];
                              patchSession(i, { muscles: next });
                            }}
                            className={`px-3 py-2 rounded-xl border ${
                              active
                                ? "bg-emerald-600 border-emerald-600"
                                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                            }`}
                          >
                            <Text
                              className={
                                active
                                  ? "text-white"
                                  : "text-zinc-800 dark:text-zinc-100"
                              }
                            >
                              {m}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {!!Object.keys(s.selected).length && (
                      <View className="mt-3">
                        <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                          {Object.keys(s.selected).length} exercício(s)
                          adicionados.
                        </Text>
                      </View>
                    )}
                  </View>
                ))}

                <Pressable
                  onPress={addSession}
                  className="mt-1 px-4 py-3 rounded-xl border border-dashed border-zinc-400 dark:border-zinc-700 items-center"
                >
                  <Text className="text-zinc-700 dark:text-zinc-200">
                    + Adicionar treino
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {step === 3 && (
            <View className="gap-3">
              <View className="mb-2">
                <SessionTabs />
              </View>
              <Text className="text-zinc-700 dark:text-zinc-300 font-medium">
                Séries e repetições – {current?.title}
              </Text>
              {current && Object.values(current.selected).length === 0 ? (
                <Text className="text-zinc-500 dark:text-zinc-400">
                  Nenhum exercício escolhido no passo anterior.
                </Text>
              ) : (
                current &&
                Object.values(current.selected).map((cfg) => (
                  <View
                    key={cfg.exercise.id}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3"
                  >
                    <Text className="text-zinc-900 dark:text-zinc-50 font-medium">
                      {cfg.exercise.name}
                    </Text>

                    <View className="flex-row gap-2 mt-2">
                      <MiniCounter
                        label="Séries"
                        value={cfg.sets}
                        onChange={(v) =>
                          patchItem(cfg.exercise.id, { sets: v })
                        }
                      />
                      <MiniCounter
                        label="Reps"
                        value={cfg.reps}
                        onChange={(v) =>
                          patchItem(cfg.exercise.id, { reps: v })
                        }
                      />
                    </View>

                    <View className="flex-row gap-2 mt-2">
                      <MiniCounter
                        label="Carga (kg)"
                        value={cfg.load_kg ?? 0}
                        step={2}
                        onChange={(v) =>
                          patchItem(cfg.exercise.id, { load_kg: v })
                        }
                      />
                      <MiniCounter
                        label="Descanso (s)"
                        value={cfg.rest_seconds ?? 60}
                        step={15}
                        onChange={(v) =>
                          patchItem(cfg.exercise.id, { rest_seconds: v })
                        }
                      />
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {step === 4 && (
            <Pressable
              onPress={() => {
                console.log("🖱️ Botão 'Enviar treinos' clicado");
                void handleEnviarTreinos();
              }}
              disabled={submitting}
              className={`px-5 py-3 rounded-xl ${submitting ? "bg-emerald-600/50" : "bg-emerald-600"}`}
            >
              <Text className="text-white font-semibold">
                {submitting ? "Enviando..." : "Enviar treinos"}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* Rodapé */}
      <View className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => void onClose()}
            className="px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700"
          >
            <Text className="text-zinc-800 dark:text-zinc-100">Fechar</Text>
          </Pressable>

          {step > 1 && (
            <Pressable
              onPress={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-3"
            >
              <Text className="text-zinc-600 dark:text-zinc-300">Voltar</Text>
            </Pressable>
          )}

          {step < 4 ? (
            <Pressable
              disabled={!canNext}
              onPress={() => setStep((s) => (s + 1) as any)}
              className={`px-5 py-3 rounded-xl ${canNext ? "bg-emerald-600" : "bg-emerald-600/50"}`}
            >
              <Text className="text-white font-semibold">Próximo</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={finish}
              className="px-5 py-3 rounded-xl bg-emerald-600"
            >
              <Text className="text-white font-semibold">Enviar treinos</Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------- MiniCounter ---------- */
function MiniCounter({
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
          <Text className="text-lg text-zinc-800 dark:text-zinc-100">−</Text>
        </Pressable>
        <Text className="text-zinc-900 dark:text-zinc-50">{value ?? 0}</Text>
        <Pressable
          className="px-3 py-2"
          onPress={() => onChange((value ?? 0) + step)}
        >
          <Text className="text-lg text-zinc-800 dark:text-zinc-100">＋</Text>
        </Pressable>
      </View>
    </View>
  );
}
