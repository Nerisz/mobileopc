// app/workouts/[id].tsx
import { supabase } from "@/src/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("workout_exercises")
        .select(
          `
          id,
          sets,
          reps,
          load_kg,
          exercise:exercises!exercise_id (
            id,
            name,
            title,
            muscle_group
          )
        `
        )
        .eq("workout_id", id);

      if (error) {
        console.error(error);
      } else {
        console.log("DATA ===>", data); // debug
        setItems(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#222",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>
              {item.exercise?.title ?? item.exercise?.name}
            </Text>
            <Text style={{ color: "#aaa" }}>
              {item.sets} séries • {item.reps} reps • {item.load_kg ?? 0} kg
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
