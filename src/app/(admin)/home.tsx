import HeaderAdmin from "@/components/Header/HeaderAdmin";
import LoadingScreen from "@/src/app/index";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GymCoach() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 200); // tempo mínimo para evitar flash branco

    return () => clearTimeout(timeout);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView className="flex-1 items-center justify-normal bg-[#141414]">
      <LinearGradient
        colors={["transparent", "rgba(237,50,65,0.3)"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 480,
        }}
        start={{ x: 0, y: 0.56 }}
        end={{ x: 0, y: 0 }}
      />

      <HeaderAdmin />
    </SafeAreaView>
  );
}
