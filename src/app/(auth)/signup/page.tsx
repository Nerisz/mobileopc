import { ToastContext } from "@/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const context = useContext(ToastContext);
  const { showToast } = context;

  const router = useRouter();

  async function handleSignUp() {
    if (!email || !password || !name)
      return showToast({
        type: "error",
        message: "Preencha todos os campos!",
      });
    if (password.length < 6)
      return showToast({
        type: "error",
        message: "A senha deve ter pelo menos 6 caracteres.",
      });

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      console.log(error);
      showToast({
        type: "error",
        message: "Essa conta já está registrada ",
      });
      setLoading(false);
      return;
    }

    showToast({
      type: "success",
      message: "Conta criada com sucesso! 😉",
    });

    setLoading(false);
    router.replace("/(tabs)/home");
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: "#141414" }}
      className="flex-1 justify-normal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex justify-start items-start ml-5 mt-20">
              <Pressable
                onPress={() => router.push("/(auth)/signin/page")}
                className="flex-row"
              >
                <Entypo name="chevron-left" size={28} color="gray" />
                <Text className="text-white/40 tracking-wide font-bold text-2xl">
                  Voltar
                </Text>
              </Pressable>
            </View>

            <View className="flex justify-start items-start ml-10 mt-20">
              <Text className=" text-white/15 text-lg font-bold text-center mb-2">
                Cadastre-se
              </Text>

              <Text className=" text-white/35 text-sm font-bold tracking-wide text-center mb-10">
                Crie uma conta e inicie agora!
              </Text>
            </View>

            <View className="flex p-1 items-start rounded-2xl mx-10 mt-5 mb-1">
              <Text className="text-white/20 text-sm font-bold">Nome</Text>
            </View>

            <View
              className="gap-4 p-1 rounded-2xl mx-10"
              style={{ borderWidth: 0.9, borderColor: "gray", height: hp(6) }}
            >
              <TextInput
                className="flex-1 text-sm tracking-wide ml-5"
                style={{ color: "rgba(241, 241, 241, 1)" }}
                placeholder="Caio Monzem"
                value={name}
                onChangeText={setName}
                placeholderTextColor={"rgba(241, 241, 241, 0.5)"}
              />
            </View>
            <View className="flex p-1 items-start rounded-2xl mt-5 mb-1 mx-10">
              <Text className="text-white/20 text-sm font-bold">
                Endereço de email
              </Text>
            </View>

            <View
              className="gap-4 p-1 rounded-2xl mx-10"
              style={{ borderWidth: 0.9, borderColor: "gray", height: hp(6) }}
            >
              <TextInput
                className="flex-1 text-sm ml-5"
                style={{ color: "rgba(241, 241, 241, 1)" }}
                placeholder="nome@gmail.com"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={"rgba(241, 241, 241, 0.5)"}
              />
            </View>

            <View className="flex p-1 items-start rounded-2xl mt-5 mb-1 mx-10">
              <Text className="text-white/20 text-sm font-bold">Senha</Text>
            </View>

            <View
              className="flex-row gap-4 p-1 items-center rounded-2xl mx-10"
              style={{
                borderWidth: 0.9,
                borderColor: "gray",
                height: hp(6),
              }}
            >
              <TextInput
                className="flex-1 text-sm tracking-wide ml-5"
                style={{ color: "rgba(241, 241, 241, 1)" }}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                placeholderTextColor={"rgba(241, 241, 241, 0.5)"}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Entypo
                  className="mr-6"
                  name={showPassword ? "eye-with-line" : "eye"}
                  size={22}
                  color="rgba(241, 241, 241, 0.5)"
                />
              </TouchableOpacity>
            </View>

            <Pressable
              onPress={handleSignUp}
              className="rounded-2xl mt-8 p-4 bg-red-500 mx-16"
              disabled={loading}
            >
              <Text className="text-center text-white text-sm tracking-wide font-medium">
                {loading ? "Criando conta..." : "Criar conta"}
              </Text>
            </Pressable>
            <View className="mt-5 items-center justify-center">
              <Text className="text-center text-white/30 text-sm tracking-wide">
                Já possui uma conta?{" "}
                <Text
                  className="text-blue-500 font-bold tracking-wide"
                  onPress={() => router.back()}
                >
                  Faça Login
                </Text>
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
