import { ToastContext } from "@/components/toast/ToastProvider";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import Entypo from "@expo/vector-icons/Entypo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const context = useContext(ToastContext);
  const { showToast } = context;
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password)
      return showToast({
        type: "error",
        message: "Preencha todos os campos!",
      });
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showToast({
        type: "warning",
        message: "Erro ao fazer login. Verifique suas credenciais.",
      });
      setLoading(false);
      return;
    }

    if (data.user) {
      await setAuth(data.user);
      showToast({ type: "success", message: "Login realizado com sucesso." });
      router.replace("/(tabs)/home");
    }
    setLoading(false);
  }

  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#141414]" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-end">
              <StatusBar style="light" />

              <Image
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  zIndex: -1,
                }}
                resizeMode="cover"
                source={require("../../../../assets/images/gymen.jpg")}
              />

              <LinearGradient
                colors={["rgba(20, 20, 20, 1)", "transparent"]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                start={{ x: 0, y: 0.56 }}
                end={{ x: 0, y: 0 }}
                className="flex justify-end pb-12 space-y-8 absolute top-0 left-0 right-0 bottom-0"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                start={{ x: 0, y: 0.2 }}
                end={{ x: 0, y: 0 }}
                className="flex justify-end pb-12 space-y-8 absolute top-0 left-0 right-0 bottom-0"
              />

              <Animated.View
                entering={FadeInRight.duration(1000).delay(600)}
                className="flex justify-start items-center ml-72 mb-80"
              >
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/signin/coach")}
                >
                  <Image
                    className="w-20 h-20 rounded-full"
                    source={require("../../../../assets/images/opc-logo.png")}
                  />
                </TouchableOpacity>
              </Animated.View>

              <View className="gap-4" style={{ marginBottom: hp(12) }}>
                <Text
                  style={{ fontSize: 21 }}
                  className="font-bold tracking-wide text-white/90 justify-start items-start ml-10"
                >
                  Bem Vindo(a)
                </Text>

                <View
                  className="flex-row gap-4 p-1 items-center rounded-2xl mx-10"
                  style={{
                    borderWidth: 0.7,
                    borderColor: "gray",
                    height: hp(6),
                  }}
                >
                  <Entypo
                    name="mail"
                    size={22}
                    color="rgba(241, 241, 241, 0.3)"
                    style={{ marginLeft: hp(2) }}
                  />
                  <TextInput
                    className="font-normal flex-1 "
                    style={{ color: "rgba(241, 241, 241, 0.8)" }}
                    placeholder="Email"
                    placeholderTextColor={"rgba(241, 241, 241, 0.3)"}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View
                  className="flex-row gap-4 p-1 items-center rounded-2xl mx-10"
                  style={{
                    borderWidth: 0.7,
                    borderColor: "gray",
                    height: hp(6),
                  }}
                >
                  <Entypo
                    name="lock"
                    size={22}
                    color="rgba(241, 241, 241, 0.3)"
                    style={{ marginLeft: hp(2) }}
                  />
                  <TextInput
                    className="font-normal flex-1 "
                    style={{ color: "rgba(241, 241, 241, 0.8)" }}
                    placeholder="Senha"
                    placeholderTextColor={"rgba(241, 241, 241, 0.3)"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Entypo
                      className="mr-5"
                      size={22}
                      color="grey"
                      name={showPassword ? "eye-with-line" : "eye"}
                    />
                  </TouchableOpacity>
                </View>

                <View>
                  <TouchableOpacity
                    style={{ backgroundColor: "#ED3241", height: hp(5) }}
                    className="rounded-2xl mt-2 mx-16 p-3"
                    activeOpacity={0.4}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <Text className="text-center text-white text-base tracking-wider font-medium">
                      {loading ? "Entrando..." : "Entrar"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-center text-white/30 text-sm tracking-wide">
                    Não possui uma conta?{" "}
                    <Text
                      className="text-center text-blue-500 text-sm tracking-wide font-medium"
                      onPress={() => router.push("/(auth)/signup/page")}
                    >
                      Cadastre-se
                    </Text>
                  </Text>
                  {/* <Text className="text-center text-white/30 text-sm tracking-wide mt-4">
                    Ou faça login com:
                  </Text> */}
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
