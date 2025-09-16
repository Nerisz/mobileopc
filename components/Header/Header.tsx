// components/Header.tsx
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

function formatUserName(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "Aluno";
  const parts = n.split(/\s+/);
  if (parts.length > 1) return `${parts[0]} ${parts[1][0]}.`;
  return parts[0];
}

export default function Header() {
  const router = useRouter();
  const { profile, loading } = useMyProfile();

  const displayName = useMemo(
    () => (loading ? "Carregando…" : formatUserName(profile?.name)),
    [loading, profile?.name]
  );

  return (
    <View
      className="flex-row-reverse items-center justify-between"
      style={{ marginTop: hp(5), width: wp(87) }}
    >
      <Pressable
        onPress={() => router.push("/(tabs)/settings")}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Abrir configurações"
      >
        <ProfileAvatar
          name={profile?.name ?? "A"}
          uri={profile?.avatar_url ?? null}
          size={70}
        />
      </Pressable>

      <View className="flex items-start justify-center">
        <Text className="text-[#f1f1f1] tracking-wider text-[14px] font-medium">
          Bem vindo(a)
        </Text>
        <Text className="text-[#f1f1f1] text-[25px] font-medium mt-1 tracking-normal">
          {displayName}
        </Text>
      </View>
    </View>
  );
}
