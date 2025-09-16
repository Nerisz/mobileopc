import { FontAwesome5 } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MotiView } from "moti";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = "#da2637";
const SECONDARY_COLOR = "#FFF";

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [dimensions, setDimensions] = useState({
    width: 20,
    height: 100,
  });

  const buttonWidth = dimensions.width / state.routes.length;

  const tabPositionX = useSharedValue(0);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          position: "absolute",
          backgroundColor: "black",
        }}
      />
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            duration: 1500,
          });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onLongPress={onLongPress}
            onPress={onPress}
            style={[
              styles.tabItem,
              {
                backgroundColor: isFocused ? SECONDARY_COLOR : "transparent",
              },
            ]}
          >
            <Animated.View>
              <MotiView style={{ flexDirection: "row", alignItems: "center" }}>
                {getIconByRouteName(
                  route.name,
                  isFocused ? PRIMARY_COLOR : SECONDARY_COLOR
                )}
                {isFocused && (
                  <Animated.Text
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(150)}
                    style={[
                      {
                        color: isFocused ? PRIMARY_COLOR : PRIMARY_COLOR,
                        fontWeight: "500",
                        fontSize: 16,
                        marginLeft: 8,
                      },
                    ]}
                  >
                    {label as string}
                  </Animated.Text>
                )}
              </MotiView>
            </Animated.View>
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );

  function getIconByRouteName(routeName: string, color: string) {
    switch (routeName) {
      case "home":
        return <Entypo name="home" size={28} color={color} />;
      case "gym":
        return <FontAwesome5 name="dumbbell" size={26} color={color} />;
      case "settings":
        return <Ionicons name="settings" size={28} color={color} />;
      default:
        return "home";
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: "66%",
    backgroundColor: PRIMARY_COLOR,
    bottom: 40,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 14,
    shadowColor: "red",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },
  text: {
    color: PRIMARY_COLOR,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default CustomNavBar;
