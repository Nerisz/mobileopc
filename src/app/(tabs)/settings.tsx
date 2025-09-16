// app/(tabs)/settings/index.tsx
import {
  getMyProfile,
  updateMyName,
  uploadAvatarAndSave,
} from "@/services/profile";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react"; // ✅ useRef
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { setAuth, user } = useAuth();
  const router = useRouter();

  // loading geral
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  // ✅ evita corridas: não faça load/saves se a tela desmontar ou estiver deslogando
  const isAlive = useRef(true);
  const loggingOut = useRef(false); // ✅ bloqueia ações enquanto sai

  // avatar
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // nome
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");

  // email
  const [email, setEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");

  // telefone
  const [phone, setPhone] = useState("");
  const [initialPhone, setInitialPhone] = useState("");

  // senha
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    isAlive.current = true;
    return () => {
      isAlive.current = false; // ✅ cancela tudo após desmontar
    };
  }, []);

  async function handleLogout() {
    try {
      loggingOut.current = true; // ✅ trava ações concorrentes
      setAuth(null); // ✅ limpa estado já
      router.replace("/(auth)/signin/page"); // ✅ desmonta (tabs) e evita re-renders
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error && error.name !== "AuthSessionMissingError") throw error;
      } else {
        await supabase.auth.signOut({ scope: "local" });
      }
    } catch (e: any) {
      Alert.alert("Erro ao sair", e?.message ?? "Tente novamente.");
    } finally {
      loggingOut.current = false;
    }
  }

  async function load() {
    // ✅ não carrega sem usuário nem durante logout
    if (!user?.id || loggingOut.current) return;

    setLoading(true);
    try {
      // ✅ garante sessão antes de qualquer chamada
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session || !isAlive.current) return;

      // perfil na tabela users
      const p = await getMyProfile(); // id, name, avatar_url, role
      if (!isAlive.current) return;
      setName(p?.name ?? "");
      setInitialName(p?.name ?? "");
      setAvatarUrl(p?.avatar_url ?? null);

      // email pela sessão (tolerante a falta de sessão)
      const { data } = await supabase.auth.getUser();
      if (!isAlive.current) return;
      const currentEmail = data.user?.email ?? "";
      setEmail(currentEmail);
      setInitialEmail(currentEmail);

      // telefone (só consulta se houver id)
      if (data.user?.id) {
        const { data: row } = await supabase
          .from("users")
          .select("phone")
          .eq("id", data.user.id)
          .maybeSingle();
        if (!isAlive.current) return;
        const currentPhone = (row as any)?.phone ?? "";
        setPhone(currentPhone);
        setInitialPhone(currentPhone);
      } else {
        setPhone("");
        setInitialPhone("");
      }
    } catch (e: any) {
      // ✅ silencia especificamente a ausência de sessão
      if (e?.name !== "AuthSessionMissingError") {
        console.error("❌ load profile:", e);
        Alert.alert("Erro", e?.message ?? "Falha ao carregar perfil");
      }
    } finally {
      if (isAlive.current) setLoading(false);
    }
  }

  // ✅ carrega SOMENTE quando houver user.id
  useEffect(() => {
    if (!user?.id) {
      // quando não autenticado, mantenha “Carregando…” curto
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Avatar
  async function pickAvatar() {
    if (!user?.id || loggingOut.current) return; // ✅ guarda
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos da sua permissão para acessar as fotos."
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (res.canceled || !res.assets?.length) return;

      setAvatarLoading(true);
      const uri = res.assets[0].uri;
      const url = await uploadAvatarAndSave(uri);
      if (!isAlive.current) return;
      setAvatarUrl(url);
      Alert.alert("Sucesso", "Foto atualizada!");
    } catch (e: any) {
      console.error("❌ pick/upload avatar:", e);
      Alert.alert("Erro", e?.message ?? "Falha ao enviar foto");
    } finally {
      if (isAlive.current) setAvatarLoading(false);
    }
  }

  function withTimeout<T>(p: Promise<T>, ms = 30000, label = "op") {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error(`Timeout: ${label} > ${ms}ms`)),
        ms
      );
      p.then((v) => {
        clearTimeout(t);
        resolve(v);
      }).catch((e) => {
        clearTimeout(t);
        reject(e);
      });
    });
  }

  async function saveAll() {
    if (!user?.id || loggingOut.current) return; // ✅ guarda

    const nameTrim = name.trim();
    const emailTrim = email.trim();
    const phoneTrim = phone.trim();

    if (!nameTrim) return Alert.alert("Atenção", "Digite um nome válido.");
    if (!emailTrim || !emailTrim.includes("@"))
      return Alert.alert("Atenção", "Digite um e-mail válido.");
    if (password || password2) {
      if (password.length < 6)
        return Alert.alert(
          "Atenção",
          "A senha precisa ter pelo menos 6 caracteres."
        );
      if (password !== password2)
        return Alert.alert("Atenção", "As senhas digitadas não conferem.");
    }

    const changedName = nameTrim !== initialName;
    const changedEmail = emailTrim !== initialEmail;
    const changedPhone = phoneTrim !== initialPhone;
    const changedPass = !!password;

    if (!changedName && !changedEmail && !changedPhone && !changedPass) {
      return Alert.alert("Nada para salvar", "Nenhuma alteração detectada.");
    }

    setSavingAll(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sem sessão");

      const baseUpdates: Promise<any>[] = [];

      if (changedName) {
        baseUpdates.push(
          withTimeout(
            updateMyName(nameTrim).then(() =>
              console.log("✅ Nome atualizado")
            ),
            15000,
            "updateMyName"
          )
        );
      }

      if (changedEmail) {
        baseUpdates.push(
          withTimeout(
            (async () => {
              const { error } = await supabase.auth.updateUser({
                email: emailTrim,
              });
              if (error) throw error;
              console.log("✅ Email atualizado (pode exigir confirmação)");
            })(),
            20000,
            "auth.updateUser(email)"
          )
        );
      }

      if (changedPhone) {
        baseUpdates.push(
          withTimeout(
            (async () => {
              const { error } = await supabase
                .from("users")
                .update({ phone: phoneTrim || null })
                .eq("id", session.user.id);
              if (error) throw error;
              console.log("✅ Telefone atualizado");
            })(),
            15000,
            "users.update(phone)"
          )
        );
      }

      const baseResults = await Promise.allSettled(baseUpdates);
      const baseErrors: string[] = [];
      baseResults.forEach((r, i) => {
        if (r.status === "rejected") {
          const msg = (
            r.reason?.message ??
            r.reason ??
            `Falha base ${i + 1}`
          ).toString();
          console.error("❌ base update failed:", msg);
          baseErrors.push(msg);
        }
      });

      let passError: string | null = null;
      if (changedPass) {
        try {
          await withTimeout(
            (async () => {
              const { error } = await supabase.auth.updateUser({ password });
              if (error) throw error;
              console.log("✅ Senha atualizada");
            })(),
            30000,
            "auth.updateUser(password)"
          );
        } catch (e: any) {
          passError = e?.message ?? String(e);
          console.error("❌ update password:", passError);
        }
      }

      if (changedEmail || changedPass) {
        try {
          await supabase.auth.getUser();
        } catch {}
      }

      if (baseErrors.length === 0 && !passError) {
        setInitialName(nameTrim);
        setInitialEmail(emailTrim);
        setInitialPhone(phoneTrim);
        setPassword("");
        setPassword2("");

        let msg = "Alterações salvas!";
        if (changedEmail)
          msg +=
            "\n\nSe necessário, confirme a troca de e-mail pelo link enviado.";
        Alert.alert("Sucesso", msg);
      } else {
        const all = [...baseErrors];
        if (passError) {
          const { data } = await supabase.auth.getUser();
          const target = data.user?.email ?? emailTrim;
          all.push("Senha: " + passError);
          all.push("Dica: tente 'Esqueci minha senha' pelo e-mail " + target);
        }
        Alert.alert("Algumas alterações falharam", all.join("\n"));
      }
    } finally {
      if (isAlive.current) setSavingAll(false);
    }
  }

  const hasChanges = useMemo(() => {
    return (
      name.trim() !== initialName ||
      email.trim() !== initialEmail ||
      phone.trim() !== initialPhone ||
      !!password
    );
  }, [name, email, phone, password, initialName, initialEmail, initialPhone]);

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

      <View className="mt-10">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="text-zinc-400 mt-2">Carregando…</Text>
          </View>
        ) : (
          <View className="w-full px-5 gap-6 pb-24">
            <View className="flex-row items-center justify-center mt-2">
              <Pressable onPress={pickAvatar} className="relative">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-zinc-800 items-center justify-center">
                    <Text className="text-white text-2xl">
                      {(user?.user_metadata?.name?.[0] ?? "U").toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="absolute bottom-0 right-0 px-2 py-1 rounded-full bg-white">
                  <Text className="text-zinc-800 text-xs">Trocar</Text>
                </View>
              </Pressable>
              {avatarLoading && (
                <Text className="text-zinc-400 text-xs mt-2">
                  Enviando foto…
                </Text>
              )}

              <View className="items-center">
                <Pressable
                  onPress={handleLogout}
                  className="absolute left-24 bottom-0 px-2 py-1 rounded-full "
                >
                  <Ionicons name="exit-outline" size={28} color="#f1f1f1" />
                </Pressable>
              </View>
            </View>

            <View>
              <Text className="text-zinc-300 mb-2">Nome</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor="#9CA3AF"
                className="border border-zinc-700 rounded-xl px-4 py-3 bg-zinc-900 text-white"
              />
            </View>

            {/* E-mail */}
            <View>
              <Text className="text-zinc-300 mb-2">E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
                className="border border-zinc-700 rounded-xl px-4 py-3 bg-zinc-900 text-white"
              />
              <Text className="text-zinc-500 text-xs mt-2">
                Em alguns casos será necessário confirmar a alteração por
                e-mail.
              </Text>
            </View>

            {/* Telefone */}
            <View>
              <Text className="text-zinc-300 mb-2">Telefone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(Opcional)"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
                className="border border-zinc-700 rounded-xl px-4 py-3 bg-zinc-900 text-white"
              />
            </View>

            {/* Senha */}
            <View>
              <Text className="text-zinc-300 mb-2">Trocar senha</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nova senha"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                className="border border-zinc-700 rounded-xl px-4 py-3 bg-zinc-900 text-white mb-2"
              />
              <TextInput
                value={password2}
                onChangeText={setPassword2}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                className="border border-zinc-700 rounded-xl px-4 py-3 bg-zinc-900 text-white"
              />
            </View>

            {/* Botão Salvar */}
            <Pressable
              onPress={saveAll}
              disabled={savingAll || !hasChanges}
              className={`mt-2 rounded-xl px-4 py-3 items-center ${
                savingAll || !hasChanges
                  ? "bg-emerald-600/50"
                  : "bg-emerald-600"
              }`}
            >
              <Text className="text-white font-semibold">
                {savingAll ? "Salvando…" : "Salvar alterações"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
