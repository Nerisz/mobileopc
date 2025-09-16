// components/common/ProfileAvatar.tsx
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

type Props = {
  name?: string | null;
  uri?: string | null; // avatar_url completo (http…)
  size?: number; // diâmetro (px)
  onPress?: () => void; // opcional (ex.: abrir modal)
  className?: string; // NativeWind extra
};

export default function ProfileAvatar({
  name,
  uri,
  size = 56,
  onPress,
  className,
}: Props) {
  const Wrapper = onPress ? Pressable : View;
  const initials = (name?.trim()?.[0] ?? "U").toUpperCase();

  return (
    <Wrapper
      onPress={onPress}
      className={className}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          // se quiser, com cache (expo-image oferece mais controles)
        />
      ) : (
        <View
          className="bg-zinc-800 items-center justify-center"
          style={{ width: size, height: size, borderRadius: size / 2 }}
        >
          <Text className="text-white" style={{ fontSize: size * 0.4 }}>
            {initials}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}
