import CustomNavBar from "@/components/NavBar/CustomNavBar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TabLayout = () => {
  return (
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <Tabs
          tabBar={(props) => <CustomNavBar {...props} />}
          screenOptions={{ headerShown: false, lazy: false }}
        >
          <Tabs.Screen name="home" options={{ title: "Início" }} />
          <Tabs.Screen name="gym" options={{ title: "Treino" }} />
          <Tabs.Screen name="settings" options={{ title: "Config" }} />
        </Tabs>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default TabLayout;
