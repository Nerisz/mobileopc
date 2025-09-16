import { ToastProvider } from "@/components/toast/ToastProvider";
import "@/global.css";
import { Href, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

function MainLayout() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const mounted = useRef(true);
  const navigating = useRef(false);
  const [ready, setReady] = useState(false);

  const safeReplace = (path: Href) => {
    if (navigating.current) return;
    navigating.current = true;
    router.replace(path);
  };

  const goByRole = (role?: string | null) => {
    if (role === "ADMIN") safeReplace("/(admin)/gym");
    else safeReplace("/(tabs)/home");
  };

  useEffect(() => {
    mounted.current = true;

    const bootstrap = async () => {
      try {
        // Sessão inicial com timeout
        const sessionRace = Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error("getSession timeout")), 2500)
          ),
        ]);
        const res = (await sessionRace) as { data?: { session?: any } };
        const session = res?.data?.session ?? null;

        setAuth(session ? session.user : null);

        if (session) {
          const roleRace = Promise.race([
            supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle(),
            new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), 2000)
            ),
          ]);

          const roleRes = (await roleRace) as { role?: string } | null;
          const role = roleRes?.role ?? null;
          goByRole(role);
        } else {
          safeReplace("/(auth)/signin/page");
        }
      } catch {
        safeReplace("/(auth)/signin/page");
      } finally {
        setReady(true);
      }

      // onAuthStateChange
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted.current) return;

        setAuth(session ? session.user : null);

        if (session) {
          let role: string | null = null;
          try {
            const { data } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle();
            role = (data as { role?: string } | null)?.role ?? null;
          } catch {
            role = null;
          }
          goByRole(role);
        } else {
          safeReplace("/(auth)/signin/page");
        }
      });

      return () => subscription?.unsubscribe();
    };

    let cleanup: (() => void) | undefined;
    bootstrap().then((fn) => {
      if (typeof fn === "function") cleanup = fn;
    });

    return () => {
      mounted.current = false;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  return (
    <GestureHandlerRootView className="flex-1">
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#141414" },
            animation: "flip",
            headerTitleStyle: { color: "#fff" },
            headerTintColor: "#fff",
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
