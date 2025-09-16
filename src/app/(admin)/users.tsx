import HeaderAdmin from "@/components/Header/HeaderAdmin";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Users() {
  const router = useRouter();
  const { setAuth } = useAuth();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    setAuth(null);

    if (error) {
      Alert.alert(error.message);
      return;
    }
  }

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

      <View>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}
