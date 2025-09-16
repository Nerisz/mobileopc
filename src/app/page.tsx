import Entypo from "@expo/vector-icons/Entypo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import LoadingScreen from "../app/index";

export default function Index() {
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
    <SafeAreaView
      className="flex-1 flex justify-end"
      style={{ width: hp(47), height: wp(100) }}
    >
      <StatusBar style="light" />
      <Image
        style={{
          width: wp(100),
          height: hp(100),
          position: "absolute",
          zIndex: -1,
        }}
        resizeMode="cover"
        source={require("../../assets/images/gymx.jpg")}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.89)", "transparent"]}
        style={{ position: "absolute", width: wp(100), height: hp(100) }}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        className="flex justify-end pb-12 space-y-8 absolute top-0 left-0 right-0 bottom-0"
      >
        <View
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center shadow-black rounded-full"
          style={{
            elevation: 40,
            shadowColor: "#000000",
          }}
        >
          <Animated.Image
            entering={FadeIn.delay(200).springify()}
            source={require("../../assets/images/opc-logo.png")}
            style={{ width: wp(38), height: hp(17), borderRadius: 80 }}
            resizeMode="cover"
          />
        </View>
        <View className="flex items-center gap-4">
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="flex items-center"
          >
            <Text className="text-white text-xl tracking-wide font-bold text-center">
              O OCIAN PRAIA CLUBE
            </Text>
            <Text className="text-white text-5xl font-bold text-center">
              DE CARA NOVA!
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/signin/page")}
              activeOpacity={0.6}
              style={{ backgroundColor: "#ED3241" }}
              className="flex-row rounded-full px-10 py-4 mx-10 mb-12"
            >
              <Text className="text-white text-xl font-bold tracking-widest text-center ml-10">
                COMECE AGORA
              </Text>

              <Entypo
                className="ml-10"
                name="chevron-right"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
