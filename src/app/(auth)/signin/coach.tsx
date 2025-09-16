import { ToastContext } from "@/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
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

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Coach() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const context = useContext(ToastContext);
  const { showToast } = context;

  async function handleLogin() {
    if (!email || !password)
      return showToast({
        type: "error",
        message: "Preencha todos os campos!",
      });

    if (password.length < 6)
      return showToast({
        type: "error",
        message: "Sua senha deve ter 6 caracteres.",
      });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showToast({
        type: "error",
        message: "Email ou senha incorreta.",
      });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      showToast({
        type: "error",
        message: "Erro ao verificar permissões.",
      });
      return;
    }

    if (profile.role !== "ADMIN") {
      await supabase.auth.signOut();
      showToast({
        type: "error",
        message: "Acesso negado: esta conta não é ADMIN.",
      });
      return;
    }

    showToast({
      type: "success",
      message: "Login realizado com sucesso!",
    });

    router.replace("/(admin)/home");
  }

  return (
    <SafeAreaView className="flex-1 bg-[#141414]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-start justify-start mt-10 left-5 "
            >
              <Entypo name="chevron-left" size={28} color="white" />
              <Text className="text-white tracking-wide font-bold text-2xl">
                {" "}
                Voltar{" "}
              </Text>
            </TouchableOpacity>

            <View className="flex justify-center items-center">
              <View>
                <Image
                  source={require("../../../../assets/images/coach.png")}
                  style={{ width: wp(80), height: hp(30) }}
                />
              </View>

              <View>
                <Text className="text-blue-500 tracking-wide font-bold text-3xl">
                  Á<Text className="text-[#f1f1f1]">rea </Text>
                  <Text>D</Text>
                  <Text className="text-[#f1f1f1]">o </Text>
                  <Text>P</Text>
                  <Text className="text-[#f1f1f1]">rofessor</Text>
                </Text>
              </View>

              <View className="gap-4 mt-5 mx-16" style={{ width: wp(80) }}>
                <View
                  className="flex-row gap-4 p-1 items-center rounded-2xl border-2"
                  style={{ borderWidth: 1, borderColor: "gray", height: hp(6) }}
                >
                  <Entypo
                    name="email"
                    size={20}
                    color="white"
                    style={{ marginLeft: 15 }}
                  />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor={"rgba(241, 241, 241, 0.5)"}
                    className="text-white w-full"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View
                  className="flex-row gap-4 p-1 items-center rounded-2xl border-2"
                  style={{ borderWidth: 1, borderColor: "gray", height: hp(6) }}
                >
                  <Entypo
                    name="lock"
                    size={20}
                    color="white"
                    style={{ marginLeft: 15 }}
                  />
                  <TextInput
                    className="flex-1 text-sm tracking-wide text-white w-full"
                    placeholder="*******"
                    placeholderTextColor={"rgba(241, 241, 241, 0.5)"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Entypo
                      className="mr-6"
                      name={showPassword ? "eye-with-line" : "eye"}
                      size={22}
                      color="rgba(241, 241, 241, 0.5)"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleLogin}
                  className="flex-row gap-4 p-1 items-center rounded-2xl border-2"
                  style={{ borderWidth: 1, borderColor: "gray", height: hp(6) }}
                >
                  <Entypo
                    name="key"
                    size={20}
                    color="white"
                    style={{ marginLeft: 15 }}
                  />
                  <Text className="flex-1 text-sm tracking-wide text-white w-full">
                    Entrar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
