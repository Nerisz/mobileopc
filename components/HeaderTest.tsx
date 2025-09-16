// components/HeaderProfile.tsx
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Props = {
  avatarUrl?: string | null;
  initial?: string; // ex.: primeira letra do nome
  onChangeAvatar?: () => void;
  onSignOut?: () => void;
};

export default function HeaderProfile({
  avatarUrl,
  initial = "G",
  onChangeAvatar,
  onSignOut,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{ paddingTop: insets.top + 8 }}
      className="relative px-4 pb-3"
    >
      {/* Sair (fixo topo-direita) */}
      <Pressable
        onPress={onSignOut}
        hitSlop={12}
        android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: true }}
        className="absolute right-4 top-2 h-10 w-10 items-center justify-center rounded-full"
      >
        <Feather name="log-out" size={26} color="#fff" />
      </Pressable>

      {/* Centro absoluto responsivo */}
      <Pressable
        onPress={onChangeAvatar}
        className="items-center justify-center self-center"
      >
        <View
          className="rounded-full border border-white/20 bg-neutral-900 w-24 h-24 items-center justify-center"
          style={{ elevation: 6 }} // sombra no Android (shadow-* já cobre iOS)
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <Text className="text-white text-2xl font-bold">{initial}</Text>
          )}
        </View>

        <View className="mt-2 rounded-full bg-white/15 px-3 py-1">
          <Text className="text-white text-xs font-semibold">Trocar</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
