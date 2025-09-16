import Header from "@/components/Header/Header";
import { ToastContext } from "@/components/toast/ToastProvider";
import { useAuth } from "@/src/contexts/AuthContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "..";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function Home() {
  const router = useRouter();
  const context = useContext(ToastContext);
  const { showToast } = context;
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView className="flex-1 items-center justify-normal bg-[#141414]">
      <StatusBar style="light" backgroundColor="#141414" translucent />
      <LinearGradient
        colors={["transparent", "rgba(237,50,65,0.3)"]}
        style={{
          position: "absolute",
          width: wp(100),
          height: hp(40),
        }}
        start={{ x: 0, y: 0.56 }}
        end={{ x: 0, y: 0 }}
      />

      <Header />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)/gym")}
        className="flex mt-20 items-center justify-center"
      >
        <Image
          className="opacity-30"
          style={{ width: wp(90), height: hp(12), borderRadius: 30 }}
          source={require("../../../assets/images/gymen.jpg")}
        />
        <View className="flex-row absolute inset-0 items-center justify-center gap-10">
          <Text className="text-gray-200 tracking-wider text-[23px] font-bold">
            Acesse seus treinos
          </Text>
          <FontAwesome6 name="circle-exclamation" size={35} color="#FFc000" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
