// services/profile.ts
import { supabase } from "@/src/lib/supabase";
import * as FileSystem from "expo-file-system";
import * as mime from "react-native-mime-types";

export type MyProfile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role?: string | null;
};

function base64ToBytes(b64: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < alphabet.length; i++) lookup[alphabet.charCodeAt(i)] = i;
  let padding = 0;
  if (b64.endsWith("==")) padding = 2;
  else if (b64.endsWith("=")) padding = 1;

  const len = b64.length;
  const outLen = ((len / 4) | 0) * 3 - padding;
  const bytes = new Uint8Array(outLen);

  let byteIndex = 0;
  for (let i = 0; i < len; i += 4) {
    const c1 = lookup[b64.charCodeAt(i)];
    const c2 = lookup[b64.charCodeAt(i + 1)];
    const c3 = lookup[b64.charCodeAt(i + 2)];
    const c4 = lookup[b64.charCodeAt(i + 3)];

    const n = (c1 << 18) | (c2 << 12) | ((c3 & 63) << 6) | (c4 & 63);
    if (byteIndex < outLen) bytes[byteIndex++] = (n >> 16) & 0xff;
    if (byteIndex < outLen) bytes[byteIndex++] = (n >> 8) & 0xff;
    if (byteIndex < outLen) bytes[byteIndex++] = n & 0xff;
  }
  return bytes;
}

// -------------------------
// Queries
// -------------------------
export async function getMyProfile(): Promise<MyProfile> {
  const { data: { session }, error: es } = await supabase.auth.getSession();
  if (es) throw es;
  if (!session) throw new Error("Sem sessão");

  const { data, error } = await supabase
    .from("users")
    .select("id, name, avatar_url, role")
    .eq("id", session.user.id)
    .maybeSingle(); // evita throw se vier null

  if (error) throw error;
  if (!data) throw new Error("Perfil não encontrado.");
  return data as MyProfile;
}

export async function updateMyName(name: string): Promise<MyProfile> {
  const next = name.trim();
  if (!next) throw new Error("Digite um nome válido.");

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Sem sessão");
  const uid = session.user.id;

  const { data, error } = await supabase
    .from("users")
    .update({ name: next })
    .eq("id", uid)
    .select("id, name, avatar_url, role")
    .single();

  if (error) throw error;
  return data as MyProfile;
}

// -------------------------
// Storage (avatar) — versão robusta p/ RN (content:// + file://)
// -------------------------
export async function uploadAvatarAndSave(uri: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Sem sessão");
  const uid = session.user.id;

  // 1) Garantir que o arquivo existe e ler como base64 (funciona em Android/iOS)
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  if (!info.exists) throw new Error("Arquivo não encontrado");

  const guessedExt = uri.split(".").pop()?.toLowerCase() || "jpg";
  const contentType = (mime.lookup(uri) as string) || `image/${guessedExt}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = base64ToBytes(base64); // Uint8Array

  // 2) Caminho único (upsert = true para sobrescrever)
  const filePath = `${uid}/avatar_${Date.now()}.${guessedExt}`;

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(filePath, bytes, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });
  if (upErr) throw upErr;

  // 3) URL pública (com cache-buster)
  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;

  // 4) Atualiza tabela users
  const { error: upUserErr } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", uid);
  if (upUserErr) throw upUserErr;

  // 5) (Opcional) Sincroniza meta do auth — ignore falha
  try {
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
  } catch (e: any) {
    console.warn("⚠️ auth.updateUser (avatar) falhou:", e?.message ?? e);
  }

  return publicUrl;
}
