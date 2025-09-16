import CustomNavBarCoach from "@/components/NavBar/CustomNavBarCoach";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// import { TabBar } from "../../components/TabBar";

const TabLayout = () => {
  return (
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <Tabs
          tabBar={(props) => <CustomNavBarCoach {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="gym" options={{ title: "Gym" }} />
          <Tabs.Screen name="home" options={{ title: "Home" }} />
          <Tabs.Screen name="users" options={{ title: "Usuários" }} />
        </Tabs>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default TabLayout;
