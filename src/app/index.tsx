import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="flex-1 bg-[#141414] justify-center items-center">
      <ActivityIndicator size={44} color={"#ED3241"} />
    </View>
  );
}
